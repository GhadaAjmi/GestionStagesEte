package com.enicar.projet.dtos;


import lombok.Data;

@Data
public class ConventionRequestDTO {

    // ── Entreprise ────────────────────────────────────────────────────
    private String entreprise;

    private String adresseEntreprise;

    private String representantEntreprise;

    private String tuteurStage;

    private String emailEntreprise;

    private String telephoneEntreprise;

    private String faxEntreprise;           // optionnel

    // ── Étudiant ──────────────────────────────────────────────────────

    private String nomEtudiant;


    private String prenomEtudiant;

    private String cin;

    private String telephone;              // téléphone étudiant

    private String email;                  // optionnel pour le PDF


    private String specialite;             // filière affichée dans la convention

    // ── Stage ─────────────────────────────────────────────────────────
    private String dateDebut;              // format dd/MM/yyyy

    private String dateFin;               // format dd/MM/yyyy

    // ── Cases à cocher (type de formation) ────────────────────────────
    private boolean ing;
    private boolean mastere;

    // ── Cases à cocher (spécialité) ───────────────────────────────────
    private boolean info;
    private boolean electrique;
    private boolean indus;

    // ── Cases à cocher (année) ────────────────────────────────────────
    private boolean premiere;
    private boolean deuxieme;
}