package com.enicar.projet.dtos;

import com.enicar.projet.entities.StatutDemande;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DemandeStageDTO {
    private Long id;
    private String sujet;
    private String entreprise;
    private String tuteurStage;
    private String anneeUniversitaire;

    private String description;
    private Long etudiantId;
    private Long soutenanceId;

    private StatutDemande statut;
    private LocalDateTime dateDemande;
    private LocalDate dateDebut;
    private LocalDate dateFin;


}
