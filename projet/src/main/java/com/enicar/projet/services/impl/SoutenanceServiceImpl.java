package com.enicar.projet.services.impl;

import com.enicar.projet.dtos.MembreJuryDTO;
import com.enicar.projet.dtos.PlanificationGroupeDTO;
import com.enicar.projet.dtos.SoutenanceDTO;
import com.enicar.projet.entities.*;
import com.enicar.projet.exceptions.NotFoundException;
import com.enicar.projet.repositories.*;
import com.enicar.projet.services.interfaces.SoutenanceService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SoutenanceServiceImpl implements SoutenanceService {

    private final SoutenanceRepository repo;
    private final DemandeStageRepository demandeRepo;
    private final SalleRepository salleRepo;
    private final MembreJuryRepository membreJuryRepo;
    private final UtilisateurRepository enseignantRepo;

    // ── CRUD ────────────────────────────────────────────────────────────────

    @Override
    public SoutenanceDTO ajouter(SoutenanceDTO dto) {
        Soutenance s = new Soutenance();
        DemandeStage d = new DemandeStage();

        s.setDate(dto.getDate());
        s.setHeureDebut(dto.getHeureDebut());
        s.setDuree(dto.getDuree());
        s.setStatut(StatutSoutenance.valueOf(dto.getStatut()));

        if (dto.getDemandeStageId() != null) {
            d = demandeRepo.findById(dto.getDemandeStageId())
                    .orElseThrow(() -> new NotFoundException(
                            "Demande introuvable : " + dto.getDemandeStageId()));
            s.setDemandeStage(d);
        }

        if (dto.getSalleId() != null) {
            Salle salle = salleRepo.findById(dto.getSalleId())
                    .orElseThrow(() -> new NotFoundException(
                            "Salle introuvable : " + dto.getSalleId()));
            s.setSalle(salle);
        }

        Soutenance saved = repo.save(s);
        d.setSoutenance(saved);
        List<MembreJury> membres = saveMembres(dto.getMembresJury(), saved);
        return toDTO(saved, membres);
    }

    @Override
    public SoutenanceDTO modifier(Long id, SoutenanceDTO dto) {
        Soutenance s = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Soutenance introuvable : " + id));

        s.setDate(dto.getDate());
        s.setHeureDebut(dto.getHeureDebut());
        s.setDuree(dto.getDuree());
        s.setStatut(StatutSoutenance.valueOf(dto.getStatut()));

        if (dto.getDemandeStageId() != null) {
            DemandeStage d = demandeRepo.findById(dto.getDemandeStageId())
                    .orElseThrow(() -> new NotFoundException(
                            "Demande introuvable : " + dto.getDemandeStageId()));
            s.setDemandeStage(d);
        }

        if (dto.getSalleId() != null) {
            Salle salle = salleRepo.findById(dto.getSalleId())
                    .orElseThrow(() -> new NotFoundException(
                            "Salle introuvable : " + dto.getSalleId()));
            s.setSalle(salle);
        }

        Soutenance saved = repo.save(s);
        membreJuryRepo.deleteBySoutenanceId(id);
        List<MembreJury> membres = saveMembres(dto.getMembresJury(), saved);
        return toDTO(saved, membres);
    }

    @Override
    public SoutenanceDTO modifierStatut(Long id, String statut) {
        Soutenance s = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Soutenance introuvable : " + id));

        if (statut == null || statut.isBlank())
            throw new IllegalArgumentException("Le statut est obligatoire");

        statut = statut.replace("\"", "").trim();

        try {
            s.setStatut(StatutSoutenance.valueOf(statut));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Statut invalide : " + statut);
        }

        Soutenance saved = repo.save(s);
        return toDTO(saved, membreJuryRepo.findBySoutenanceId(saved.getId()));
    }
    @Override
    public List<SoutenanceDTO> getAllIng2() {
        return repo.findByEtudiantNiveau("ING2")
                .stream()
                .map(s -> toDTO(s, membreJuryRepo.findBySoutenanceId(s.getId())))
                .toList();
    }
    @Override
    public void supprimer(Long id) {
        if (!repo.existsById(id))
            throw new NotFoundException("Soutenance introuvable : " + id);
        membreJuryRepo.deleteBySoutenanceId(id);
        repo.deleteById(id);
    }

    @Override
    public SoutenanceDTO getById(Long id) {
        Soutenance s = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Soutenance introuvable : " + id));
        return toDTO(s, membreJuryRepo.findBySoutenanceId(id));
    }

    @Override
    public List<SoutenanceDTO> getAll() {
        return repo.findAll().stream()
                .map(s -> toDTO(s, membreJuryRepo.findBySoutenanceId(s.getId())))
                .toList();
    }

    @Override
    public List<SoutenanceDTO> planifierGroupe(PlanificationGroupeDTO dto) {
        Salle salle = salleRepo.findById(dto.getSalleId())
                .orElseThrow(() -> new NotFoundException("Salle introuvable : " + dto.getSalleId()));

        return dto.getEtudiantIds().stream().map(etudiantId -> {
            DemandeStage demande = demandeRepo.findByEtudiantId(etudiantId)
                    .orElseThrow(() -> new NotFoundException(
                            "Aucune demande pour l'étudiant : " + etudiantId));

            Soutenance s = new Soutenance();
            s.setDate(dto.getDate());
            s.setHeureDebut(String.valueOf(dto.getHeureDebut()));
            s.setDuree(dto.getDuree());
            s.setStatut(StatutSoutenance.valueOf(dto.getStatut()));
            s.setDemandeStage(demande);
            s.setSalle(salle);

            Soutenance saved = repo.save(s);
            List<MembreJury> membres = saveMembres(dto.getMembresJury(), saved);
            return toDTO(saved, membres);
        }).toList();
    }


    // ── Mapping central ─────────────────────────────────────────────────────

    private SoutenanceDTO toDTO(Soutenance s, List<MembreJury> membres) {

        // Étudiant
        DemandeStage demande  = s.getDemandeStage();
        Etudiant     etudiant = demande != null ? demande.getEtudiant() : null;

        return SoutenanceDTO.builder()
                .id(s.getId())
                .date(s.getDate())
                .heureDebut(s.getHeureDebut())
                .duree(s.getDuree())
                .statut(s.getStatut().name())
                // Demande
                .demandeStageId(demande != null ? demande.getId()      : null)
                .sujetDemande  (demande != null ? demande.getSujet()   : null)
                // Étudiant
                .etudiantNom        (etudiant != null ? etudiant.getNom()         : null)
                .etudiantPrenom     (etudiant != null ? etudiant.getPrenom()      : null)
                .etudiantNiveau     (etudiant != null ? etudiant.getNiveau()      : null)
                .etudiantGroupe     (etudiant != null ? etudiant.getGroupe()      : null)
                .etudiantSpecialite (etudiant != null ? etudiant.getSpecialite()  : null)
                .etudiantDepartement(etudiant != null ? etudiant.getDepartement() : null)
                // Salle
                .salleId          (s.getSalle() != null ? s.getSalle().getId()           : null)
                .codeSalle        (s.getSalle() != null ? s.getSalle().getCode()         : null)
                .localisationSalle(s.getSalle() != null ? s.getSalle().getLocalisation() : null)
                // Jury
                .membresJury(membres != null
                        ? membres.stream().map(this::toMembreJuryDTO).toList()
                        : List.of())
                .build();
    }

    private MembreJuryDTO toMembreJuryDTO(MembreJury m) {
        return MembreJuryDTO.builder()
                .id(m.getId())
                .enseignantId(m.getEnseignant().getId())
                .nomEnseignant(m.getEnseignant().getNom())
                .prenomEnseignant(m.getEnseignant().getPrenom())
                .build();
    }

    private List<MembreJury> saveMembres(List<MembreJuryDTO> dtos, Soutenance soutenance) {
        if (dtos == null || dtos.isEmpty()) return List.of();
        return dtos.stream().map(dto -> {
            Enseignant enseignant = (Enseignant) enseignantRepo.findById(dto.getEnseignantId())
                    .orElseThrow(() -> new NotFoundException(
                            "Enseignant introuvable : " + dto.getEnseignantId()));
            return membreJuryRepo.save(new MembreJury(null, soutenance, enseignant));
        }).toList();
    }
    @Override
    public List<SoutenanceDTO> updateGroupeDepuisSoutenance(
            Long soutenanceId,
            PlanificationGroupeDTO dto
    ) {
        Soutenance soutenanceReference = repo.findById(soutenanceId)
                .orElseThrow(() -> new NotFoundException(
                        "Soutenance introuvable : " + soutenanceId
                ));

        if (soutenanceReference.getDemandeStage() == null ||
                soutenanceReference.getDemandeStage().getEtudiant() == null) {
            throw new IllegalArgumentException(
                    "Impossible de déterminer l'étudiant de la soutenance : " + soutenanceId
            );
        }

        Etudiant etudiantReference = soutenanceReference
                .getDemandeStage()
                .getEtudiant();

        String departement = etudiantReference.getDepartement();
        String specialite = etudiantReference.getSpecialite();
        String niveau = etudiantReference.getNiveau();
        String groupe = etudiantReference.getGroupe();

        if (departement == null || departement.isBlank()
                || specialite == null || specialite.isBlank()
                || niveau == null || niveau.isBlank()
                || groupe == null || groupe.isBlank()) {
            throw new IllegalArgumentException(
                    "Impossible de déterminer le groupe complet depuis la soutenance : " + soutenanceId
            );
        }

        if (dto.getDate() == null) {
            throw new IllegalArgumentException("La date est obligatoire");
        }

        if (dto.getHeureDebut() == null) {
            throw new IllegalArgumentException("L'heure de début est obligatoire");
        }

        if (dto.getDuree() <= 0) {
            throw new IllegalArgumentException("La durée est obligatoire");
        }

        if (dto.getSalleId() == null) {
            throw new IllegalArgumentException("La salle est obligatoire");
        }

        Salle salle = salleRepo.findById(dto.getSalleId())
                .orElseThrow(() -> new NotFoundException(
                        "Salle introuvable : " + dto.getSalleId()
                ));

        List<Etudiant> etudiantsDuGroupe = enseignantRepo.findEtudiantsDuGroupe(
                departement,
                specialite,
                niveau,
                groupe
        );

        if (etudiantsDuGroupe.isEmpty()) {
            throw new NotFoundException(
                    "Aucun étudiant trouvé pour le groupe : "
                            + niveau + " / "
                            + departement + " / "
                            + specialite + " / "
                            + groupe
            );
        }

        List<Soutenance> soutenancesDuGroupe = etudiantsDuGroupe.stream()
                .map(etudiant -> repo.findByDemandeStageEtudiantId(etudiant.getId())
                        .orElseThrow(() -> new NotFoundException(
                                "Aucune soutenance trouvée pour l'étudiant : " + etudiant.getId()
                        )))
                .toList();

        List<Long> idsAIgnorer = soutenancesDuGroupe.stream()
                .map(Soutenance::getId)
                .toList();

        List<String> conflitsSalle = getConflitsSalleEnIgnorantSoutenances(
                dto.getSalleId(),
                dto.getDate(),
                dto.getHeureDebut(),
                dto.getDuree(),
                idsAIgnorer
        );

        if (!conflitsSalle.isEmpty()) {
            throw new IllegalArgumentException(
                    "Salle non disponible : " + conflitsSalle
            );
        }

        return soutenancesDuGroupe.stream().map(s -> {

            s.setDate(dto.getDate());
            s.setHeureDebut(dto.getHeureDebut().toString());
            s.setDuree(dto.getDuree());

            if (dto.getStatut() != null && !dto.getStatut().isBlank()) {
                s.setStatut(StatutSoutenance.valueOf(dto.getStatut()));
            }

            s.setSalle(salle);

            Soutenance saved = repo.save(s);

            membreJuryRepo.deleteBySoutenanceId(saved.getId());

            List<MembreJury> membres = saveMembres(dto.getMembresJury(), saved);

            return toDTO(saved, membres);

        }).toList();
    }
    private List<String> getConflitsSalleEnIgnorantSoutenances(
            Long salleId,
            LocalDate date,
            LocalTime heureDebut,
            int duree,
            List<Long> soutenanceIdsAIgnorer
    ) {
        List<Soutenance> soutenances = repo.findBySalleIdAndDate(salleId, date);
        List<String> conflits = new ArrayList<>();

        LocalTime heureFin = heureDebut.plusMinutes(duree);

        for (Soutenance s : soutenances) {

            if (soutenanceIdsAIgnorer.contains(s.getId())) {
                continue;
            }

            LocalTime sDebut = LocalTime.parse(s.getHeureDebut());
            LocalTime sFin = sDebut.plusMinutes(s.getDuree());

            boolean conflit = heureDebut.isBefore(sFin) && heureFin.isAfter(sDebut);

            if (conflit) {
                conflits.add("Soutenance existante de " + sDebut + " à " + sFin);
            }
        }

        return conflits;
    }
    @Override
    public SoutenanceDTO getSoutenanceByEtudiant(Long etudiantId) {
        Soutenance soutenance = repo.findByDemandeStageEtudiantId(etudiantId)
                .orElseThrow(() -> new NotFoundException(
                        "Aucune soutenance trouvée pour cet étudiant : " + etudiantId
                ));

        List<MembreJury> membres = membreJuryRepo.findBySoutenanceId(soutenance.getId());

        return toDTO(soutenance, membres);
    }



    @Override
    public List<SoutenanceDTO> getSoutenancesByEnseignant(Long enseignantId) {
        return membreJuryRepo.findByEnseignantId(enseignantId)
                .stream()
                .map(MembreJury::getSoutenance)
                .filter(soutenance -> soutenance != null)
                .distinct()
                .map(soutenance -> {
                    List<MembreJury> membres = membreJuryRepo.findBySoutenanceId(soutenance.getId());
                    return toDTO(soutenance, membres);
                })
                .toList();
    }
}