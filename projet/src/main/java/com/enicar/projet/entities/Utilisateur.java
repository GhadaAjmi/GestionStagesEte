package com.enicar.projet.entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonSubTypes;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "role")
@JsonSubTypes({
        @JsonSubTypes.Type(value = Etudiant.class,        name = "ETUDIANT"),
        @JsonSubTypes.Type(value = Enseignant.class,      name = "ENSEIGNANT"),
        @JsonSubTypes.Type(value = Admin.class,           name = "ADMIN"),
        @JsonSubTypes.Type(value = Responsable.class,     name = "RESPONSABLE"),
        @JsonSubTypes.Type(value = ChefDepartement.class, name = "CHEF_DEPARTEMENT"),
        @JsonSubTypes.Type(value = ServiceStage.class,    name = "SERVICE_STAGE")
})
@Entity
@Table(name = "utilisateurs")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING, length = 20)
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 20, unique = true, nullable = false)
    private String cin;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, unique = true, length = 8)
    private String telephone;
    @Column(nullable = true,  length = 100)
    private String lieuDelivranceCin;
    @Column(nullable = true,  length = 30)
    private String dateDelivranceCin;
    @Column(name = "mot_de_passe", nullable = false)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", insertable = false, updatable = false)
    private RoleUtilisateur role;

    @Column(nullable = false)
    private Boolean actif = true;

    @Lob
    @Column(name = "photo_profil", columnDefinition = "LONGBLOB")
    private byte[] photoProfil;
    @Column(name = "departement", nullable = true)
    private String departement;

}