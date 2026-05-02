package com.enicar.projet.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembreJuryDTO {
    private Long id;
    private Long enseignantId;
    private Long soutenanceId;

    private String nomEnseignant;
    private String prenomEnseignant;
}
