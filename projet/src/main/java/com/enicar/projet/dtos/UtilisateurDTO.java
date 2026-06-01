package com.enicar.projet.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Data;


import lombok.Data;

@Data
public class UtilisateurDTO {

    private Long id;
    private String role;

    private String cin;
    private String nom;
    private String prenom;
    private String email;
    private String motDePasse;
    private Boolean actif;

    private String departement;
    private String telephone;
    private String lieuDelivranceCin;
    private String dateDelivranceCin;

    private String niveau; //ING1 ING2
    private String specialite;
    private String groupe;//A,
    private String numeroInscription;
//enseigant
    private String grade;
    private String domaine;
}