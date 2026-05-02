package com.enicar.projet.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Entity
@Table(name = "prolongation")
@Data
@NoArgsConstructor
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
