package com.enicar.projet.dtos;


import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationResponseDTO {

    private Long id;

    // ── Soutenance ──────────────────────────────────────────────────────────
    private Long   soutenanceId;
    private String sujetSoutenance;
    private String dateSoutenance;        // formatted dd/MM/yyyy
    private String heureDebutSoutenance;
    private Integer dureeSoutenance;
    private String statutSoutenance;

    // ── Étudiant (via soutenance) ────────────────────────────────────────────
    private String etudiantNom;
    private String etudiantPrenom;
    private String etudiantNiveau;
    private String etudiantGroupe;
    private String etudiantDepartement;
    private String etudiantSpecialite;

    // ── Salle (via soutenance) ───────────────────────────────────────────────
    private String codeSalle;
    private String localisationSalle;

    // ── Enseignant évaluateur ────────────────────────────────────────────────
    private Long   enseignantId;
    private String enseignantNom;
    private String enseignantPrenom;

    // ── Notes ────────────────────────────────────────────────────────────────
    private Double noteRapport;        // /20  — poids 30 %
    private Double notePresentation;   // /20  — poids 30 %
    private Double noteTechnique;      // /20  — poids 25 %
    private Double noteComportement;   // /20  — poids 15 %
    private Double noteFinale;         // calculée automatiquement

    // ── Commentaire ──────────────────────────────────────────────────────────
    private String commentaire;

    // ── Audit ────────────────────────────────────────────────────────────────
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}