package com.enicar.projet.entities;

import jakarta.persistence.*;

import java.time.LocalDate;

public class Prolongation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_stage_id")
    private DemandeStage demandeStage;


    @Enumerated(EnumType.STRING)
    private StatutProlongation statut;

    private LocalDate dateFinProlongee;

    private LocalDate dateSoumission;
}
