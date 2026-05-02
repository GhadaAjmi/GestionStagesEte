package com.enicar.projet.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Entity
@Table(name = "journal")
@Data
@NoArgsConstructor
public class Journal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_stage_id")
    private DemandeStage demandeStage;

    private LocalDate date;

    @Column(length = 1000)
    private String activitesEtObservations;

    @Column(length = 255)
    private String commentaireResponsable;

    private boolean vueResponsable = false;
    private boolean valideResponsable = false;
}
