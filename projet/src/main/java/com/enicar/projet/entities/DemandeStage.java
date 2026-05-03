package com.enicar.projet.entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "demandes_stage")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DemandeStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String sujet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id", nullable = true)
    private Entreprise entreprise;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutDemande statut;

    @Column(name = "date_demande", nullable = true)
    private LocalDateTime dateDemande;

    @Column(name = "date_debut", nullable = true)
    private LocalDate dateDebut;
    @Column(name = "date_fin", nullable = true)
    private LocalDate dateFin;

    @ManyToOne (fetch = FetchType.LAZY)
    @JoinColumn(name = "etudiant_id")
    private Etudiant etudiant;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soutenance_id", nullable = true)
    private Soutenance soutenance;
    @OneToMany(mappedBy = "demandeStage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Journal> journaux = new ArrayList<>();
    @OneToOne (fetch = FetchType.LAZY)
    @JoinColumn(name = "prolongation_id",nullable = true)
    private Prolongation prolongation;

}