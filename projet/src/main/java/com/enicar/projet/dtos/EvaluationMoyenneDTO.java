package com.enicar.projet.dtos;


import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationMoyenneDTO {

    private Long   soutenanceId;
    private String sujetSoutenance;
    private String etudiantNom;
    private String etudiantPrenom;

    private int    nombreEvaluateurs;
    private Double moyenneRapport;
    private Double moyennePresentation;
    private Double moyenneTechnique;
    private Double moyenneComportement;
    private Double moyenneFinale;        // moyenne des notes finales individuelles
}