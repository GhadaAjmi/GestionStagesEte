package com.enicar.projet.services.impl;

import com.enicar.projet.dtos.*;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import com.enicar.projet.entities.*;
import com.enicar.projet.repositories.*;
import com.enicar.projet.services.interfaces.PlanningAIService;
import com.google.ortools.Loader;
import com.google.ortools.sat.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class PlanningAIServiceImpl implements PlanningAIService {
	private static final Logger log = LogManager.getLogger(PlanningAIServiceImpl.class);

    private final DemandeStageRepository demandeStageRepository;
    private final UtilisateurRepository enseignantRepository;
    private final SalleRepository salleRepository;
    private final SoutenanceRepository soutenanceRepository;
    private final MembreJuryRepository membreJuryRepository;

    static {
        Loader.loadNativeLibraries();
    }

    private record Creneau(LocalDate date, int minutesDebut) {}
    private record BlocGroupe(String cleGroupe, String departement, List<DemandeStage> demandes) {}

    // ════════════════════════════════════════════════════════════════════
    // POINT D'ENTRÉE
    // ════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public List<SoutenanceDTO> genererPlanningING1(PlanningING1Request request) {
    	log.info("=== Génération planning ING1 ===");

        validerRequete(request);

        // ── 1. Demandes ING1 filtrées ────────────────────────────────────
        List<DemandeStage> demandesING1 = demandeStageRepository
                .findByStatutAndSoutenanceIsNull(StatutDemande.VALIDEE)
                .stream()
                .filter(d -> !estDeuxiemeAnnee(d.getEtudiant().getNiveau()))
                .filter(d -> request.getDepartement() == null
                        || request.getDepartement().equalsIgnoreCase(d.getEtudiant().getDepartement()))
                .filter(d -> request.getSpecialite() == null
                        || request.getSpecialite().equalsIgnoreCase(d.getEtudiant().getSpecialite()))
                .collect(Collectors.toList());
        log.info("Demandes ING1 trouvées: {}", demandesING1.size());

        if (demandesING1.isEmpty()){
            log.error("Aucune demande ING1 disponible");
            throw new RuntimeException("Aucune demande ING1 validée.");
        }

        // ── 2. Salles poster dans l'annexe (type fixe ING1) ──────────────
        List<Salle> sallesDisponibles = salleRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getSupportePoster()))
                .filter(this::estEnAnnexe)
                .collect(Collectors.toList());
        log.info("Salles disponibles: {}", sallesDisponibles.size());


        if (sallesDisponibles.isEmpty()){
            log.error("Aucune salle disponible");
            throw new RuntimeException("Aucune salle disponible.");
        }


        int nbJury   = request.getNbJury()           != null ? request.getNbJury()           : 2;
        int dureeEtu = request.getDureeParEtudiant() != null ? request.getDureeParEtudiant() : 15;

        // ── 3. Regroupement par département puis groupe/spécialité ────────
        // Clé du bloc : "departement|groupe|specialite"
        List<BlocGroupe> blocs = demandesING1.stream()
                .collect(Collectors.groupingBy(d ->
                        d.getEtudiant().getDepartement() + "|"
                                + d.getEtudiant().getGroupe()    + "|"
                                + d.getEtudiant().getSpecialite()))
                .entrySet().stream()
                .map(e -> {
                    String dept = e.getValue().get(0).getEtudiant().getDepartement();
                    return new BlocGroupe(e.getKey(), dept, e.getValue());
                })
                .collect(Collectors.toList());

        // ── 4. Tous les enseignants actifs, indexés par département ───────
        Map<String, List<Enseignant>> enseignantsParDept = enseignantRepository
                .findByActifTrue()
                .stream()
                .collect(Collectors.groupingBy(
                        e -> e.getDepartement() == null ? "" : e.getDepartement().toLowerCase()
                ));

        // Vérifier que chaque département a assez d'enseignants
        Set<String> departementsPresents = blocs.stream()
                .map(b -> b.departement() == null ? "" : b.departement().toLowerCase())
                .collect(Collectors.toSet());

        for (String dept : departementsPresents) {
            List<Enseignant> ens = enseignantsParDept.getOrDefault(dept, List.of());
            if (ens.size() < nbJury)
                throw new RuntimeException(
                        "Département « " + dept + " » : seulement " + ens.size()
                                + " enseignant(s) actif(s) pour " + nbJury + " jury(s) requis.");
        }

        // ── 5. Créneaux ──────────────────────────────────────────────────
        List<Creneau> creneaux = construireCreneaux(request.getJours(), dureeEtu);
        log.info("Créneaux générés: {}", creneaux.size());

        log.info("[ING1-Poster] {} blocs | {} créneaux de {}min | {} salles | {} jurys/soutenance",
                blocs.size(), creneaux.size(), dureeEtu, sallesDisponibles.size(), nbJury);

        // ── 6. Résolution OR-Tools ───────────────────────────────────────
        // Les blocs de départements différents partagent les salles et les créneaux,
        // mais chaque bloc ne peut recruter que des enseignants de son département.
        return resoudreEtPersister(blocs, creneaux, sallesDisponibles,
                enseignantsParDept, nbJury, dureeEtu);
    }

    // ════════════════════════════════════════════════════════════════════
    // RÉSOLUTION OR-TOOLS
    // ════════════════════════════════════════════════════════════════════

    private List<SoutenanceDTO> resoudreEtPersister(
    		
            List<BlocGroupe> blocs,
            List<Creneau> creneaux,
            List<Salle> salles,
            Map<String, List<Enseignant>> enseignantsParDept,
            int nbJury,
            int dureeEtu) {
    	log.debug("Initialisation du modèle OR-Tools");

        // Liste globale unique d'enseignants (tous départements confondus)
        // On maintient une Map bloc→indices enseignants éligibles pour la contrainte C3/C5
        List<Enseignant> tousEnseignants = enseignantsParDept.values().stream()
                .flatMap(Collection::stream)
                .distinct()
                .collect(Collectors.toList());

        int nbBlocs = blocs.size();
        int nbC     = creneaux.size();
        int nbSa    = salles.size();
        int nbE     = tousEnseignants.size();

        int[] tailleBloc = blocs.stream().mapToInt(b -> b.demandes().size()).toArray();

        // Pour chaque bloc, liste des indices d'enseignants éligibles (même département)
        List<List<Integer>> indicesEligiblesParBloc = new ArrayList<>();
        for (BlocGroupe bloc : blocs) {
            String deptBloc = bloc.departement() == null ? "" : bloc.departement().toLowerCase();
            List<Enseignant> ensEligibles = enseignantsParDept.getOrDefault(deptBloc, List.of());
            List<Integer> indices = ensEligibles.stream()
                    .map(tousEnseignants::indexOf)
                    .collect(Collectors.toList());
            indicesEligiblesParBloc.add(indices);
        }

        CpModel model = new CpModel();

        BoolVar[][][] assignation = creerVarsAssignation(model, nbBlocs, nbC, nbSa);
        BoolVar[][]   jury        = creerVarsJury(model, nbBlocs, nbE);

        ajouterC1_affectationUnique(model, assignation, nbBlocs, nbC, nbSa);
        ajouterC2_pasDebordement(model, assignation, creneaux, tailleBloc, nbBlocs, nbC, nbSa);
        ajouterC3_juryDepartement(model, jury, nbBlocs, nbE, nbJury, indicesEligiblesParBloc);
        ajouterC4_pasDoublonSalle(model, assignation, nbBlocs, nbC, nbSa, tailleBloc, creneaux);
        ajouterC5_pasDoublonEnseignant(model, assignation, jury, nbBlocs, nbC, nbSa, nbE, tailleBloc, creneaux);
        ajouterObjectif(model, assignation, nbBlocs, nbC, nbSa);

        CpSolver solver = new CpSolver();
        solver.getParameters().setMaxTimeInSeconds(60.0);
        solver.getParameters().setNumWorkers(4);
        CpSolverStatus status = solver.solve(model);
        log.info("Statut solveur: {}", status);

        if (status != CpSolverStatus.OPTIMAL && status != CpSolverStatus.FEASIBLE){
            log.error("Aucune solution trouvée pour ING1");
            throw new RuntimeException("Aucune solution trouvée.");
        }

        return persisterSolution(solver, assignation, jury,
                blocs, creneaux, salles, tousEnseignants, dureeEtu);
    }
// ════════════════════════════════════════════════════════════════════
// CRÉNEAUX
// ════════════════════════════════════════════════════════════════════

    private List<Creneau> construireCreneaux(List<PlanningJourDTO> jours, int dureeEtu) {
        List<Creneau> creneaux = new ArrayList<>();
        for (PlanningJourDTO jour : jours) {
            int debut = jour.getHeureDebut().getHour() * 60 + jour.getHeureDebut().getMinute();
            int fin   = jour.getHeureFin().getHour()   * 60 + jour.getHeureFin().getMinute();
            for (int m = debut; m + dureeEtu <= fin; m += dureeEtu)
                creneaux.add(new Creneau(jour.getDate(), m));
        }
        if (creneaux.isEmpty())
            throw new RuntimeException("Aucun créneau généré. Vérifiez les jours et plages horaires.");
        return creneaux;
    }


    // ════════════════════════════════════════════════════════════════════
    // VARIABLES OR-TOOLS
    // ════════════════════════════════════════════════════════════════════

    private BoolVar[][][] creerVarsAssignation(CpModel m, int nbS, int nbC, int nbSa) {
        BoolVar[][][] v = new BoolVar[nbS][nbC][nbSa];
        for (int s = 0; s < nbS; s++)
            for (int c = 0; c < nbC; c++)
                for (int sa = 0; sa < nbSa; sa++)
                    v[s][c][sa] = m.newBoolVar("a_%d_%d_%d".formatted(s, c, sa));
        return v;
    }

    private BoolVar[][] creerVarsJury(CpModel m, int nbS, int nbE) {
        BoolVar[][] v = new BoolVar[nbS][nbE];
        for (int s = 0; s < nbS; s++)
            for (int e = 0; e < nbE; e++)
                v[s][e] = m.newBoolVar("j_%d_%d".formatted(s, e));
        return v;
    }

    // ════════════════════════════════════════════════════════════════════
    // CONTRAINTES
    // ════════════════════════════════════════════════════════════════════

    private void ajouterC1_affectationUnique(CpModel m, BoolVar[][][] a,
                                             int nbS, int nbC, int nbSa) {
        for (int s = 0; s < nbS; s++) {
            LinearExprBuilder sum = LinearExpr.newBuilder();
            for (int c = 0; c < nbC; c++)
                for (int sa = 0; sa < nbSa; sa++)
                    sum.add(a[s][c][sa]);
            m.addEquality(sum, 1);
        }
    }

    private void ajouterC2_pasDebordement(CpModel m, BoolVar[][][] a,
                                          List<Creneau> creneaux, int[] tailleBloc,
                                          int nbS, int nbC, int nbSa) {
        for (int s = 0; s < nbS; s++) {
            int taille = tailleBloc[s];
            for (int c = 0; c < nbC; c++) {
                boolean faisable = true;
                for (int k = 1; k < taille; k++) {
                    if (c + k >= nbC || !creneaux.get(c + k).date().equals(creneaux.get(c).date())) {
                        faisable = false;
                        break;
                    }
                }
                if (!faisable)
                    for (int sa = 0; sa < nbSa; sa++)
                        m.addEquality(a[s][c][sa], 0);
            }
        }
    }

    /**
     * C3 — Exactement nbJury enseignants par jury,
     *       choisis UNIQUEMENT parmi les enseignants du même département que le bloc.
     *
     * Pour les enseignants non éligibles au bloc s → jury[s][e] = 0 (forcé).
     * Pour les enseignants éligibles → leur somme doit valoir exactement nbJury.
     */
    private void ajouterC3_juryDepartement(CpModel m, BoolVar[][] jury,
                                           int nbS, int nbE, int nbJury,
                                           List<List<Integer>> indicesEligiblesParBloc) {
        for (int s = 0; s < nbS; s++) {
            List<Integer> eligibles = indicesEligiblesParBloc.get(s);
            Set<Integer> eligiblesSet = new HashSet<>(eligibles);

            LinearExprBuilder sum = LinearExpr.newBuilder();
            for (int e = 0; e < nbE; e++) {
                if (eligiblesSet.contains(e)) {
                    // Enseignant éligible : peut faire partie du jury
                    sum.add(jury[s][e]);
                } else {
                    // Enseignant d'un autre département : interdit pour ce bloc
                    m.addEquality(jury[s][e], 0);
                }
            }
            // Exactement nbJury enseignants éligibles dans le jury
            m.addEquality(sum, nbJury);
        }
    }

    private void ajouterC4_pasDoublonSalle(CpModel m, BoolVar[][][] a,
                                           int nbS, int nbC, int nbSa,
                                           int[] tailleBloc, List<Creneau> creneaux) {
        for (int c = 0; c < nbC; c++) {
            for (int sa = 0; sa < nbSa; sa++) {
                LinearExprBuilder sum = LinearExpr.newBuilder();
                for (int s = 0; s < nbS; s++) {
                    int taille = tailleBloc[s];
                    for (int cDebut = Math.max(0, c - taille + 1); cDebut <= c; cDebut++)
                        if (cDebut < nbC && creneaux.get(cDebut).date().equals(creneaux.get(c).date()))
                            sum.add(a[s][cDebut][sa]);
                }
                m.addLessOrEqual(sum, 1);
            }
        }
    }

    private void ajouterC5_pasDoublonEnseignant(CpModel m,
                                                BoolVar[][][] a, BoolVar[][] jury,
                                                int nbS, int nbC, int nbSa, int nbE,
                                                int[] tailleBloc, List<Creneau> creneaux) {
        for (int e = 0; e < nbE; e++) {
            for (int c = 0; c < nbC; c++) {
                LinearExprBuilder total = LinearExpr.newBuilder();
                for (int s = 0; s < nbS; s++) {
                    int taille = tailleBloc[s];
                    for (int cDebut = Math.max(0, c - taille + 1); cDebut <= c; cDebut++) {
                        if (cDebut >= nbC || !creneaux.get(cDebut).date().equals(creneaux.get(c).date()))
                            continue;
                        LinearExprBuilder dansCreneauExpr = LinearExpr.newBuilder();
                        for (int sa = 0; sa < nbSa; sa++)
                            dansCreneauExpr.add(a[s][cDebut][sa]);
                        BoolVar dansCreneau = m.newBoolVar("dc_%d_%d_%d".formatted(e, s, cDebut));
                        m.addEquality(dansCreneau, dansCreneauExpr);
                        BoolVar occupe = m.newBoolVar("occ_%d_%d_%d".formatted(e, s, cDebut));
                        m.addMinEquality(occupe, new IntVar[]{jury[s][e], dansCreneau});
                        total.add(occupe);
                    }
                }
                m.addLessOrEqual(total, 1);
            }
        }
    }

    private void ajouterObjectif(CpModel m, BoolVar[][][] a, int nbS, int nbC, int nbSa) {
        LinearExprBuilder obj = LinearExpr.newBuilder();
        for (int s = 0; s < nbS; s++)
            for (int c = 0; c < nbC; c++)
                for (int sa = 0; sa < nbSa; sa++)
                    obj.addTerm(a[s][c][sa], c);
        m.minimize(obj);
    }

    // ════════════════════════════════════════════════════════════════════
    // PERSISTANCE
    // ════════════════════════════════════════════════════════════════════

    @Transactional
    protected List<SoutenanceDTO> persisterSolution(
            CpSolver solver,
            BoolVar[][][] assignation,
            BoolVar[][] jury,
            List<BlocGroupe> blocs,
            List<Creneau> creneaux,
            List<Salle> salles,
            List<Enseignant> tousEnseignants,
            int dureeParEtudiant) {

        List<SoutenanceDTO> resultats = new ArrayList<>();

        for (int s = 0; s < blocs.size(); s++) {

            int ci = -1, sai = -1;
            outer:
            for (int c = 0; c < creneaux.size(); c++)
                for (int sa = 0; sa < salles.size(); sa++)
                    if (solver.booleanValue(assignation[s][c][sa])) {
                        ci = c; sai = sa; break outer;
                    }
            if (ci == -1) {
                log.warn("[ING1] Bloc {} non assigné dans la solution !", s);
                continue;
            }

            Creneau creneauDebut = creneaux.get(ci);
            Salle   salle        = salles.get(sai);

            List<Enseignant> juryEnseignants = new ArrayList<>();
            for (int e = 0; e < tousEnseignants.size(); e++)
                if (solver.booleanValue(jury[s][e]))
                    juryEnseignants.add(tousEnseignants.get(e));

            List<MembreJuryDTO> juryDTOs = juryEnseignants.stream()
                    .map(e -> MembreJuryDTO.builder()
                            .enseignantId(e.getId())
                            .nomEnseignant(e.getNom())
                            .prenomEnseignant(e.getPrenom())
                            .build())
                    .toList();

            List<DemandeStage> demandesBloc = blocs.get(s).demandes();
            int offsetMinutes = 0;

            for (DemandeStage demande : demandesBloc) {
                int heureMin = creneauDebut.minutesDebut() + offsetMinutes;

                Soutenance sout = new Soutenance();
                sout.setDate(creneauDebut.date());
                sout.setHeureDebut(minutesEnHeure(heureMin));
                sout.setDuree(dureeParEtudiant);
                sout.setStatut(StatutSoutenance.PLANIFIEE);
                sout.setSalle(salle);
                sout.setDemandeStage(demande);

                Soutenance saved = soutenanceRepository.save(sout);
                demande.setSoutenance(saved);

                for (Enseignant ens : juryEnseignants) {
                    MembreJury mj = new MembreJury();
                    mj.setSoutenance(saved);
                    mj.setEnseignant(ens);
                    membreJuryRepository.save(mj);
                }

                resultats.add(SoutenanceDTO.builder()
                        .id(saved.getId())
                        .date(creneauDebut.date())
                        .heureDebut(minutesEnHeure(heureMin))
                        .duree(dureeParEtudiant)
                        .statut(StatutSoutenance.PLANIFIEE.name())
                        .demandeStageId(demande.getId())
                        .sujetDemande(demande.getSujet())
                        .etudiantNom(demande.getEtudiant().getNom())
                        .etudiantPrenom(demande.getEtudiant().getPrenom())
                        .etudiantNiveau(demande.getEtudiant().getNiveau())
                        .etudiantGroupe(demande.getEtudiant().getGroupe())
                        .etudiantSpecialite(demande.getEtudiant().getSpecialite())
                        .etudiantDepartement(demande.getEtudiant().getDepartement())
                        .salleId(salle.getId())
                        .codeSalle(salle.getCode())
                        .localisationSalle(salle.getLocalisation())
                        .membresJury(juryDTOs)
                        .build());

                offsetMinutes += dureeParEtudiant;
            }
        }

        log.info("[ING1] {} soutenances persistées", resultats.size());
        return resultats;
    }

    // ════════════════════════════════════════════════════════════════════
    // UTILITAIRES
    // ════════════════════════════════════════════════════════════════════

    private void validerRequete(PlanningING1Request request) {
        if (request.getJours() == null || request.getJours().isEmpty())
            throw new RuntimeException("Aucun jour de disponibilité renseigné.");
        if (request.getNbJury() != null && request.getNbJury() < 1)
            throw new RuntimeException("Le nombre de jurys doit être >= 1.");
        if (request.getDureeParEtudiant() != null && request.getDureeParEtudiant() < 5)
            throw new RuntimeException("La durée par étudiant doit être >= 5 minutes.");
    }

    private boolean estDeuxiemeAnnee(String niveau) {
        if (niveau == null) return false;
        String n = niveau.toLowerCase();
        return n.contains("2") || n.contains("deux") || n.contains("deuxième");
    }

    private boolean estEnAnnexe(Salle salle) {
        return Optional.ofNullable(salle.getLocalisation())
                .map(String::toLowerCase)
                .map(loc -> loc.contains("annexe"))
                .orElse(false);
    }

    private String minutesEnHeure(int m) {
        return "%02d:%02d".formatted(m / 60, m % 60);
    }

    //---------------------------------------------------ING2 --------------------------------
    @Override
    @Transactional
    public List<SoutenanceDTO> genererPlanningING2(PlanningING2Request request) {

        validerRequeteING2(request);

        int nbJury = request.getNbJury() != null && request.getNbJury() > 0
                ? request.getNbJury()
                : 2;

        int dureeSoutenance = request.getDureeSoutenance() != null && request.getDureeSoutenance() > 0
                ? request.getDureeSoutenance()
                : 60;

        List<DemandeStage> demandesING2 = demandeStageRepository
                .findByStatutAndSoutenanceIsNull(StatutDemande.VALIDEE)
                .stream()
                .filter(d -> d.getEtudiant() != null)
                .filter(d -> "ING2".equalsIgnoreCase(d.getEtudiant().getNiveau()))
                .filter(d -> request.getDepartement() == null
                        || request.getDepartement().isBlank()
                        || request.getDepartement().equalsIgnoreCase(d.getEtudiant().getDepartement()))
                .collect(Collectors.toList());

        if (demandesING2.isEmpty()) {
            throw new RuntimeException("Aucune demande ING2 validée sans soutenance trouvée.");
        }

        List<Enseignant> enseignants = chargerEnseignantsING2(request);

        List<Salle> sallesDisponibles = chargerSallesING2(request);

        if (enseignants.size() < nbJury) {
            throw new RuntimeException(
                    "Nombre insuffisant d'enseignants pour former un jury de " + nbJury
            );
        }

        if (sallesDisponibles.isEmpty()) {
            throw new RuntimeException("Aucune salle compatible trouvée pour les soutenances ING2.");
        }

        validerEnseignantsING2ParDepartement(demandesING2, enseignants, nbJury);

        List<Creneau> creneaux = construireCreneauxING2(
                request.getJours(),
                dureeSoutenance
        );

        if (creneaux.isEmpty()) {
            throw new RuntimeException("Aucun créneau généré pour ING2.");
        }

        log.info("[ING2] {} demandes | {} créneaux | {} salles | {} enseignants | {} jury",
                demandesING2.size(),
                creneaux.size(),
                sallesDisponibles.size(),
                enseignants.size(),
                nbJury
        );

        CpModel model = new CpModel();

        int nbDemandes = demandesING2.size();
        int nbC = creneaux.size();
        int nbSa = sallesDisponibles.size();
        int nbE = enseignants.size();

        BoolVar[][][] assignation = creerVarsAssignation(model, nbDemandes, nbC, nbSa);
        BoolVar[][] jury = creerVarsJury(model, nbDemandes, nbE);

        ajouterC1_affectationUnique(model, assignation, nbDemandes, nbC, nbSa);

        ajouterC3_jury(model, jury, nbDemandes, nbE, nbJury);

        ajouterC3b_enseignantsMemeDepartementING2(
                model,
                jury,
                demandesING2,
                enseignants
        );

        ajouterC4_pasDoublonSalleING2(
                model,
                assignation,
                nbDemandes,
                nbC,
                nbSa
        );

        ajouterC5_pasDoublonEnseignantING2(
                model,
                assignation,
                jury,
                nbDemandes,
                nbC,
                nbSa,
                nbE
        );

        ajouterObjectif(model, assignation, nbDemandes, nbC, nbSa);

        CpSolver solver = new CpSolver();
        solver.getParameters().setMaxTimeInSeconds(60.0);
        solver.getParameters().setNumWorkers(4);

        CpSolverStatus status = solver.solve(model);

        if (status != CpSolverStatus.OPTIMAL && status != CpSolverStatus.FEASIBLE) {
            throw new RuntimeException(
                    "Aucune solution ING2 trouvée. Vérifiez les créneaux, les salles et les enseignants."
            );
        }

        return persisterSolutionING2(
                solver,
                assignation,
                jury,
                demandesING2,
                creneaux,
                sallesDisponibles,
                enseignants,
                dureeSoutenance
        );
    }

    private void ajouterC3_jury(
            CpModel model,
            BoolVar[][] jury,
            int nbDemandes,
            int nbEnseignants,
            int nbJury
    ) {
        for (int d = 0; d < nbDemandes; d++) {

            LinearExprBuilder sum = LinearExpr.newBuilder();

            for (int e = 0; e < nbEnseignants; e++) {
                sum.add(jury[d][e]);
            }

            model.addEquality(sum, nbJury);
        }
    }
    private void ajouterC3b_enseignantsMemeDepartementING2(
            CpModel model,
            BoolVar[][] jury,
            List<DemandeStage> demandes,
            List<Enseignant> enseignants
    ) {
        for (int d = 0; d < demandes.size(); d++) {

            String departementEtudiant = demandes.get(d)
                    .getEtudiant()
                    .getDepartement();

            for (int e = 0; e < enseignants.size(); e++) {

                String departementEnseignant = enseignants.get(e).getDepartement();

                boolean memeDepartement =
                        departementEtudiant != null
                                && departementEnseignant != null
                                && departementEtudiant.equalsIgnoreCase(departementEnseignant);

                if (!memeDepartement) {
                    model.addEquality(jury[d][e], 0);
                }
            }
        }
    }

    private void ajouterC4_pasDoublonSalleING2(
            CpModel model,
            BoolVar[][][] assignation,
            int nbDemandes,
            int nbCreneaux,
            int nbSalles
    ) {
        for (int c = 0; c < nbCreneaux; c++) {
            for (int sa = 0; sa < nbSalles; sa++) {

                LinearExprBuilder sum = LinearExpr.newBuilder();

                for (int d = 0; d < nbDemandes; d++) {
                    sum.add(assignation[d][c][sa]);
                }

                model.addLessOrEqual(sum, 1);
            }
        }
    }
    private void ajouterC5_pasDoublonEnseignantING2(
            CpModel model,
            BoolVar[][][] assignation,
            BoolVar[][] jury,
            int nbDemandes,
            int nbCreneaux,
            int nbSalles,
            int nbEnseignants
    ) {
        for (int e = 0; e < nbEnseignants; e++) {
            for (int c = 0; c < nbCreneaux; c++) {

                LinearExprBuilder total = LinearExpr.newBuilder();

                for (int d = 0; d < nbDemandes; d++) {

                    LinearExprBuilder affecteDansCreneau = LinearExpr.newBuilder();

                    for (int sa = 0; sa < nbSalles; sa++) {
                        affecteDansCreneau.add(assignation[d][c][sa]);
                    }

                    BoolVar soutenanceDansCreneau = model.newBoolVar(
                            "ing2_dc_e%d_d%d_c%d".formatted(e, d, c)
                    );

                    model.addEquality(soutenanceDansCreneau, affecteDansCreneau);

                    BoolVar enseignantOccupe = model.newBoolVar(
                            "ing2_occ_e%d_d%d_c%d".formatted(e, d, c)
                    );

                    model.addMinEquality(
                            enseignantOccupe,
                            new IntVar[]{jury[d][e], soutenanceDansCreneau}
                    );

                    total.add(enseignantOccupe);
                }

                model.addLessOrEqual(total, 1);
            }
        }
    }
    private List<Salle> chargerSallesING2(PlanningING2Request request) {

        List<Salle> salles;

            salles = salleRepository.findAll();


        return salles.stream()
                .filter(s -> Boolean.TRUE.equals(s.getSupportePresentation()))
                .toList();
    }
    private List<Enseignant> chargerEnseignantsING2(PlanningING2Request request) {
        return enseignantRepository.findByActifTrue();
    }
    private void validerEnseignantsING2ParDepartement(
            List<DemandeStage> demandes,
            List<Enseignant> enseignants,
            int nbJury
    ) {
        Set<String> departements = demandes.stream()
                .filter(d -> d.getEtudiant() != null)
                .map(d -> d.getEtudiant().getDepartement())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        for (String departement : departements) {
            long count = enseignants.stream()
                    .filter(e -> e.getDepartement() != null)
                    .filter(e -> e.getDepartement().equalsIgnoreCase(departement))
                    .count();

            if (count < nbJury) {
                throw new RuntimeException(
                        "Nombre insuffisant d'enseignants dans le département "
                                + departement
                                + ". Requis : "
                                + nbJury
                                + ", trouvés : "
                                + count
                );
            }
        }
    }
    private List<Creneau> construireCreneauxING2(
            List<PlanningJourDTO> jours,
            int dureeSoutenance
    ) {
        List<Creneau> creneaux = new ArrayList<>();

        for (PlanningJourDTO jour : jours) {
            int debut = jour.getHeureDebut().getHour() * 60 + jour.getHeureDebut().getMinute();
            int fin = jour.getHeureFin().getHour() * 60 + jour.getHeureFin().getMinute();

            for (int m = debut; m + dureeSoutenance <= fin; m += dureeSoutenance) {
                creneaux.add(new Creneau(jour.getDate(), m));
            }
        }

        if (creneaux.isEmpty()) {
            throw new RuntimeException("Aucun créneau ING2 généré.");
        }

        return creneaux;
    }
    @Transactional
    protected List<SoutenanceDTO> persisterSolutionING2(
            CpSolver solver,
            BoolVar[][][] assignation,
            BoolVar[][] jury,
            List<DemandeStage> demandes,
            List<Creneau> creneaux,
            List<Salle> salles,
            List<Enseignant> enseignants,
            int dureeSoutenance
    ) {
        List<SoutenanceDTO> resultats = new ArrayList<>();

        for (int d = 0; d < demandes.size(); d++) {

            int ci = -1;
            int sai = -1;

            outer:
            for (int c = 0; c < creneaux.size(); c++) {
                for (int sa = 0; sa < salles.size(); sa++) {
                    if (solver.booleanValue(assignation[d][c][sa])) {
                        ci = c;
                        sai = sa;
                        break outer;
                    }
                }
            }

            if (ci == -1 || sai == -1) {
                log.warn("[ING2] Demande {} non assignée dans la solution", demandes.get(d).getId());
                continue;
            }

            DemandeStage demande = demandes.get(d);
            Creneau creneau = creneaux.get(ci);
            Salle salle = salles.get(sai);

            List<Enseignant> juryEnseignants = new ArrayList<>();

            for (int e = 0; e < enseignants.size(); e++) {
                if (solver.booleanValue(jury[d][e])) {
                    juryEnseignants.add(enseignants.get(e));
                }
            }

            List<MembreJuryDTO> juryDTOs = juryEnseignants.stream()
                    .map(e -> MembreJuryDTO.builder()
                            .enseignantId(e.getId())
                            .nomEnseignant(e.getNom())
                            .prenomEnseignant(e.getPrenom())
                            .build())
                    .toList();

            Soutenance soutenance = new Soutenance();
            soutenance.setDate(creneau.date());
            soutenance.setHeureDebut(minutesEnHeure(creneau.minutesDebut()));
            soutenance.setDuree(dureeSoutenance);
            soutenance.setStatut(StatutSoutenance.PLANIFIEE);
            soutenance.setSalle(salle);
            soutenance.setDemandeStage(demande);

            Soutenance saved = soutenanceRepository.save(soutenance);
            demande.setSoutenance(saved);

            for (Enseignant ens : juryEnseignants) {
                MembreJury membre = new MembreJury();
                membre.setSoutenance(saved);
                membre.setEnseignant(ens);
                membreJuryRepository.save(membre);
            }

            resultats.add(SoutenanceDTO.builder()
                    .id(saved.getId())
                    .date(saved.getDate())
                    .heureDebut(saved.getHeureDebut())
                    .duree(saved.getDuree())
                    .statut(saved.getStatut().name())
                    .demandeStageId(demande.getId())
                    .sujetDemande(demande.getSujet())
                    .etudiantNom(demande.getEtudiant().getNom())
                    .etudiantPrenom(demande.getEtudiant().getPrenom())
                    .etudiantNiveau(demande.getEtudiant().getNiveau())
                    .etudiantGroupe(demande.getEtudiant().getGroupe())
                    .etudiantSpecialite(demande.getEtudiant().getSpecialite())
                    .etudiantDepartement(demande.getEtudiant().getDepartement())
                    .salleId(salle.getId())
                    .codeSalle(salle.getCode())
                    .localisationSalle(salle.getLocalisation())
                    .membresJury(juryDTOs)
                    .build());
        }

        log.info("[ING2] {} soutenances persistées", resultats.size());

        return resultats;
    }
    private void validerRequeteING2(PlanningING2Request request) {

        if (request.getJours() == null || request.getJours().isEmpty()) {
            throw new RuntimeException("Aucun jour de disponibilité renseigné.");
        }

        if (request.getNbJury() != null && request.getNbJury() < 1) {
            throw new RuntimeException("Le nombre de membres du jury doit être >= 1.");
        }

        if (request.getDureeSoutenance() != null && request.getDureeSoutenance() < 15) {
            throw new RuntimeException("La durée d'une soutenance ING2 doit être >= 15 minutes.");
        }

        if (request.getNombreJours() != null
                && !request.getNombreJours().equals(request.getJours().size())) {
            throw new RuntimeException("Le nombre de jours ne correspond pas à la liste des jours fournie.");
        }

        for (PlanningJourDTO jour : request.getJours()) {
            if (jour.getDate() == null) {
                throw new RuntimeException("Chaque jour doit avoir une date.");
            }

            if (jour.getHeureDebut() == null || jour.getHeureFin() == null) {
                throw new RuntimeException("Chaque jour doit avoir une heure début et une heure fin.");
            }

            if (!jour.getHeureDebut().isBefore(jour.getHeureFin())) {
                throw new RuntimeException("L'heure début doit être avant l'heure fin.");
            }
        }
    }
}