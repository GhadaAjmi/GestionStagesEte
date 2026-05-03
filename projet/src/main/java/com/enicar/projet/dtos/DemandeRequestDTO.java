package com.enicar.projet.dtos;

import lombok.Data;

@Data
public class DemandeRequestDTO {

    // ── Étudiant ───────────────────────────────────────────────

    private Long etudiantId;

    // ── Entreprise ─────────────────────────────────────────────

    private String entreprise;


    private String adresseEntreprise;


    private String representantEntreprise;


    private String tuteurStage;

    private String emailEntreprise;


    private String telephoneEntreprise;

    private String faxEntreprise;

    // ── Demande / Stage ────────────────────────────────────────

    private String sujet;

    private String type;

    private String description;

    private String dateDebut; // yyyy-MM-dd

    private String dateFin; // yyyy-MM-dd

    private String anneeUniversitaire;
}