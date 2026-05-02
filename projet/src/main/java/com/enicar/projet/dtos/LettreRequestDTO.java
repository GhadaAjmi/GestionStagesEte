package com.enicar.projet.dtos;


import lombok.Data;

@Data
public class LettreRequestDTO {

    // ── Étudiant ──────────────────────────────────────────────────────
    private String nomEtudiant;


    private String prenomEtudiant;


    private String cin;

    private String dateDelivranceCin;   // date de délivrance CIN  (dd/MM/yyyy)

    private String lieuDelivranceCin;   // lieu de délivrance CIN

    private String niveau;              // ex : "1", "2", "3"

    private String specialite;

    // ── Stage ─────────────────────────────────────────────────────────
    private String entreprise;

    private String dateDebut;           // format dd/MM/yyyy

    private String dateFin;             // format dd/MM/yyyy
}