package com.enicar.projet.controllers;

import com.enicar.projet.dtos.EvaluationMoyenneDTO;
import com.enicar.projet.dtos.EvaluationRequestDTO;
import com.enicar.projet.dtos.EvaluationResponseDTO;
import com.enicar.projet.services.interfaces.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EvaluationController {

    private final EvaluationService evaluationService;

    // ── POST /api/evaluations ───────────────────────────────────────────────
    /**
     * Soumettre ou mettre à jour une évaluation.
     * Accessible aux enseignants membres du jury.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'ADMIN')")
    public ResponseEntity<EvaluationResponseDTO> soumettre(
             @RequestBody EvaluationRequestDTO dto) {

        EvaluationResponseDTO result = evaluationService.soumettre(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // ── GET /api/evaluations/soutenance/{soutenanceId} ──────────────────────
    /**
     * Toutes les évaluations d'une soutenance (admin / chef de département).
     */
    @GetMapping("/soutenance/{soutenanceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_DEPARTEMENT')")
    public ResponseEntity<List<EvaluationResponseDTO>> getParSoutenance(
            @PathVariable Long soutenanceId) {

        return ResponseEntity.ok(evaluationService.getParSoutenance(soutenanceId));
    }

    // ── GET /api/evaluations/soutenance/{soutenanceId}/moyenne ─────────────
    /**
     * Moyenne agrégée de toutes les évaluations d'une soutenance.
     */
    @GetMapping("/soutenance/{soutenanceId}/moyenne")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_DEPARTEMENT', 'ENSEIGNANT')")
    public ResponseEntity<EvaluationMoyenneDTO> getMoyenne(
            @PathVariable Long soutenanceId) {

        return ResponseEntity.ok(evaluationService.getMoyenneParSoutenance(soutenanceId));
    }

    // ── GET /api/evaluations/enseignant/{enseignantId} ──────────────────────
    /**
     * Toutes les évaluations soumises par un enseignant.
     */
    @GetMapping("/enseignant/{enseignantId}")
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'ADMIN')")
    public ResponseEntity<List<EvaluationResponseDTO>> getParEnseignant(
            @PathVariable Long enseignantId) {

        return ResponseEntity.ok(evaluationService.getParEnseignant(enseignantId));
    }

    // ── GET /api/evaluations/enseignant/{enseignantId}/soutenance/{soutenanceId}
    /**
     * Évaluation d'un enseignant pour une soutenance précise.
     * Retourne 204 si l'enseignant n'a pas encore évalué.
     */
    @GetMapping("/enseignant/{enseignantId}/soutenance/{soutenanceId}")
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'ADMIN')")
    public ResponseEntity<EvaluationResponseDTO> getParEnseignantEtSoutenance(
            @PathVariable Long enseignantId,
            @PathVariable Long soutenanceId) {

        EvaluationResponseDTO dto =
                evaluationService.getParEnseignantEtSoutenance(enseignantId, soutenanceId);

        return dto != null
                ? ResponseEntity.ok(dto)
                : ResponseEntity.noContent().build();
    }

    // ── DELETE /api/evaluations/{id} ────────────────────────────────────────
    /**
     * Suppression d'une évaluation (admin uniquement).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        evaluationService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}