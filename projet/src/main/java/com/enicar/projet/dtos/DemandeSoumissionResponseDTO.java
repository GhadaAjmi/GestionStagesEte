package com.enicar.projet.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DemandeSoumissionResponseDTO {

    private DemandeStageDTO demande;

    private DocumentResponseDTO lettreAffectation;

    private DocumentResponseDTO convention;
}