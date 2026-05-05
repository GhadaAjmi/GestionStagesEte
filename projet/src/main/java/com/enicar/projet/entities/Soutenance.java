package com.enicar.projet.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "soutenances")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Soutenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "heure_debut", nullable = false, length = 10)
    private String heureDebut;

    @Column(name = "duree", nullable = false, length = 10)
    private int duree;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutSoutenance statut;
    @JsonIgnore
    @OneToOne(mappedBy = "soutenance", fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_stage_id")
    private DemandeStage demandeStage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salle_id")
    private Salle salle;
    @OneToMany(mappedBy = "soutenance", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<MembreJury> membresJury;}
