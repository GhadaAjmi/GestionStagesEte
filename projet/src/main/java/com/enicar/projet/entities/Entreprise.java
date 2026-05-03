package com.enicar.projet.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "entreprises")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Entreprise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Établissement d’accueil
    @Column(nullable = false, unique = true)
    private String nom;

    private String adresse;

    // Représentant de l’entreprise
    private String representant;

    private String email;

    private String telephone;

    private String fax;
}
