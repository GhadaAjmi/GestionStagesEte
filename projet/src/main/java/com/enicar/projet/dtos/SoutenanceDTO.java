package com.enicar.projet.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SoutenanceDTO {

    private Long id;
    private LocalDate date;
    private String heureDebut;
    private int duree;
    private String statut;

    // Demande de stage
    private Long demandeStageId;
    private String sujetDemande;

    // Étudiant (enrichi)
    private String etudiantNom;
    private String etudiantPrenom;
    private String etudiantNiveau;
    private String etudiantGroupe;
    private String etudiantSpecialite;
    private String etudiantDepartement;

    // Salle
    private Long salleId;
    private String codeSalle;
    private String localisationSalle;

    // Jury
    private List<MembreJuryDTO> membresJury;
}