package com.enicar.projet.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@DiscriminatorValue("ETUDIANT")
@NoArgsConstructor
@AllArgsConstructor
public class Etudiant extends Utilisateur {

    @Column(nullable = true,length = 50)
    private String niveau;
    @Column(nullable = true,length = 50)
    private String groupe;
    @Column(nullable = true,length = 100)
    private String specialite;
    @Column(nullable = true,length = 100)
    private String numeroInscription;


}