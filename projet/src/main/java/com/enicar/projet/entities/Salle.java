package com.enicar.projet.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "salles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Salle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(length = 200)
    private String localisation;
    @Column(name = "supporte_presentation", nullable = false)
    private Boolean supportePresentation = false;

    @Column(name = "supporte_poster", nullable = false)
    private Boolean supportePoster = false;


}
