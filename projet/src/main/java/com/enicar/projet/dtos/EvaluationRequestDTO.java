package com.enicar.projet.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationRequestDTO {

    private Long soutenanceId;

    private Long enseignantId;

    private Double noteRapport;
    private Double notePresentation;
    private Double noteTechnique;

    private Double noteComportement;

    private String commentaire;
}