package com.enicar.projet.services.impl;

import com.enicar.projet.dtos.EvaluationMoyenneDTO;
import com.enicar.projet.dtos.EvaluationRequestDTO;
import com.enicar.projet.dtos.EvaluationResponseDTO;
import com.enicar.projet.entities.Enseignant;
import com.enicar.projet.entities.Evaluation;
import com.enicar.projet.entities.Soutenance;
import com.enicar.projet.repositories.UtilisateurRepository;
import com.enicar.projet.repositories.EvaluationRepository;
import com.enicar.projet.repositories.SoutenanceRepository;
import com.enicar.projet.services.interfaces.EvaluationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EvaluationServiceImpl implements EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final UtilisateurRepository  enseignantRepository;
    private final SoutenanceRepository  soutenanceRepository;

    // ── Soumettre / Mettre à jour ────────────────────────────────────────────

    @Override
    public EvaluationResponseDTO soumettre(EvaluationRequestDTO dto) {

        Enseignant enseignant = (Enseignant)enseignantRepository.findById(dto.getEnseignantId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Enseignant introuvable : id=" + dto.getEnseignantId()));

        Soutenance soutenance = soutenanceRepository.findById(dto.getSoutenanceId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Soutenance introuvable : id=" + dto.getSoutenanceId()));

        boolean estJuryMembre = soutenance.getMembresJury().stream()
                .anyMatch(m -> m.getEnseignant().getId().equals(dto.getEnseignantId()));
        if (!estJuryMembre) {
            throw new IllegalStateException(
                    "L'enseignant id=" + dto.getEnseignantId()
                            + " n'est pas membre du jury de cette soutenance.");
        }

        Evaluation evaluation = evaluationRepository
                .findByEnseignant_IdAndSoutenance_Id(dto.getEnseignantId(), dto.getSoutenanceId())
                .orElseGet(Evaluation::new);

        evaluation.setEnseignant(enseignant);
        evaluation.setSoutenance(soutenance);
        evaluation.setNoteRapport(dto.getNoteRapport());
        evaluation.setNotePresentation(dto.getNotePresentation());
        evaluation.setNoteTechnique(dto.getNoteTechnique());
        evaluation.setNoteComportement(dto.getNoteComportement());
        evaluation.setCommentaire(dto.getCommentaire());
        evaluation.calculerNoteFinale();

        return toDTO(evaluationRepository.save(evaluation));
    }

    // ── Lecture ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public EvaluationResponseDTO getParEnseignantEtSoutenance(Long enseignantId, Long soutenanceId) {
        return evaluationRepository
                .findByEnseignant_IdAndSoutenance_Id(enseignantId, soutenanceId)
                .map(this::toDTO)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluationResponseDTO> getParSoutenance(Long soutenanceId) {
        return evaluationRepository
                .findBySoutenance_IdOrderByCreatedAtAsc(soutenanceId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluationResponseDTO> getParEnseignant(Long enseignantId) {
        return evaluationRepository
                .findByEnseignant_IdOrderByCreatedAtDesc(enseignantId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── Moyenne agrégée ──────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public EvaluationMoyenneDTO getMoyenneParSoutenance(Long soutenanceId) {

        Soutenance s = soutenanceRepository.findById(soutenanceId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Soutenance introuvable : id=" + soutenanceId));

        List<Evaluation> evals = evaluationRepository
                .findBySoutenance_IdOrderByCreatedAtAsc(soutenanceId);

        DoubleSummaryHelper h = DoubleSummaryHelper.of(evals);

        return EvaluationMoyenneDTO.builder()
                .soutenanceId(soutenanceId)
                .sujetSoutenance(s.getDemandeStage().getSujet())
                .etudiantNom(s.getDemandeStage().getEtudiant() != null ? s.getDemandeStage().getEtudiant().getNom() : null)
                .etudiantPrenom(s.getDemandeStage().getEtudiant() != null ? s.getDemandeStage().getEtudiant().getPrenom() : null)
                .nombreEvaluateurs(evals.size())
                .moyenneRapport(h.avg(Evaluation::getNoteRapport, evals))
                .moyennePresentation(h.avg(Evaluation::getNotePresentation, evals))
                .moyenneTechnique(h.avg(Evaluation::getNoteTechnique, evals))
                .moyenneComportement(h.avg(Evaluation::getNoteComportement, evals))
                .moyenneFinale(h.avg(Evaluation::getNoteFinale, evals))
                .build();
    }

    // ── Suppression ──────────────────────────────────────────────────────────

    @Override
    public void supprimer(Long evaluationId) {
        if (!evaluationRepository.existsById(evaluationId)) {
            throw new EntityNotFoundException("Évaluation introuvable : id=" + evaluationId);
        }
        evaluationRepository.deleteById(evaluationId);
    }

    // ── Mapping ──────────────────────────────────────────────────────────────

    private EvaluationResponseDTO toDTO(Evaluation e) {

        Soutenance s    = e.getSoutenance();
        Enseignant ens  = e.getEnseignant();

        // Étudiant rattaché à la soutenance (via DemandeStage ou directement)
        String etNom      = null, etPrenom = null, etNiveau = null,
                etGroupe   = null, etDept   = null, etSpec    = null;

        if (s != null && s.getDemandeStage().getEtudiant() != null) {
            var et   = s.getDemandeStage().getEtudiant();
            etNom    = et.getNom();
            etPrenom = et.getPrenom();
            etNiveau = et.getNiveau()     != null ? et.getNiveau()     : null;
            etGroupe = et.getGroupe()     != null ? et.getGroupe() : null;
            etDept   = et.getDepartement() != null
                    ? et.getDepartement() : null;
            etSpec   = et.getSpecialite() != null
                    ? et.getSpecialite()  : null;
        }

        return EvaluationResponseDTO.builder()
                .id(e.getId())
                // soutenance
                .soutenanceId(s != null ? s.getId() : null)
                .sujetSoutenance(s != null ? s.getDemandeStage().getSujet() : null)
                .dateSoutenance(s != null && s.getDate() != null
                        ? s.getDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : null)
                .heureDebutSoutenance(s != null ? s.getHeureDebut() : null)
                .dureeSoutenance(s != null ? s.getDuree() : null)
                .statutSoutenance(s != null && s.getStatut() != null ? s.getStatut().name() : null)
                // étudiant
                .etudiantNom(etNom)
                .etudiantPrenom(etPrenom)
                .etudiantNiveau(etNiveau)
                .etudiantGroupe(etGroupe)
                .etudiantDepartement(etDept)
                .etudiantSpecialite(etSpec)
                // salle
                .codeSalle(s != null && s.getSalle() != null ? s.getSalle().getCode() : null)
                .localisationSalle(s != null && s.getSalle() != null
                        ? s.getSalle().getLocalisation() : null)
                // enseignant
                .enseignantId(ens != null ? ens.getId() : null)
                .enseignantNom(ens != null ? ens.getNom() : null)
                .enseignantPrenom(ens != null ? ens.getPrenom() : null)
                // notes
                .noteRapport(e.getNoteRapport())
                .notePresentation(e.getNotePresentation())
                .noteTechnique(e.getNoteTechnique())
                .noteComportement(e.getNoteComportement())
                .noteFinale(e.getNoteFinale())
                // commentaire
                .commentaire(e.getCommentaire())
                // audit
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    // ── Utilitaire interne ───────────────────────────────────────────────────

    /** Petit helper pour calculer les moyennes sans se répéter. */
    private static class DoubleSummaryHelper {
        static DoubleSummaryHelper of(List<Evaluation> list) { return new DoubleSummaryHelper(); }

        Double avg(java.util.function.Function<Evaluation, Double> getter,
                   List<Evaluation> list) {
            return list.stream()
                    .map(getter)
                    .filter(v -> v != null)
                    .mapToDouble(Double::doubleValue)
                    .average()
                    .stream()
                    .mapToObj(v -> Math.round(v * 100.0) / 100.0)
                    .findFirst()
                    .orElse(null);
        }
    }
}