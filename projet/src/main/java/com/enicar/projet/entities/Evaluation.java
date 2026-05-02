package com.enicar.projet.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation")
@Data
@NoArgsConstructor
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enseignant_id", nullable = false)
    private Enseignant enseignant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soutenance_id", nullable = false)
    private Soutenance soutenance;

    @Column(name = "note_rapport")
    private Double noteRapport;       // 30%

    @Column(name = "note_presentation")
    private Double notePresentation;  // 30%

    @Column(name = "note_technique")
    private Double noteTechnique;     // 25%

    @Column(name = "note_comportement")
    private Double noteComportement;  // 15%


    @Column(name = "note_finale")
    private Double noteFinale;

    @Column(name = "commentaire", length = 2000)
    private String commentaire;


    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        calculerNoteFinale();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculerNoteFinale();
    }

    /**
     * Calcule la note finale avec pondération.
     * Gère le cas des notes partielles (seulement les critères renseignés sont pondérés).
     */
    public void calculerNoteFinale() {
        double total  = 0.0;
        double poids  = 0.0;

        if (noteRapport      != null) { total += noteRapport      * 0.30; poids += 0.30; }
        if (notePresentation != null) { total += notePresentation * 0.30; poids += 0.30; }
        if (noteTechnique    != null) { total += noteTechnique    * 0.25; poids += 0.25; }
        if (noteComportement != null) { total += noteComportement * 0.15; poids += 0.15; }

        this.noteFinale = (poids > 0)
                ? Math.round((total / poids) * 100.0) / 100.0
                : null;
    }
}
