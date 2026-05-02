package com.enicar.projet.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@DiscriminatorValue("ENSEIGNANT")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Enseignant extends Utilisateur {

    @Column(length = 50)
    private String grade;

    @Column(length = 100)
    private String domaine;

}