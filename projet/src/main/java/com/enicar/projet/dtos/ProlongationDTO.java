package com.enicar.projet.dtos;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProlongationDTO {

    private Long id;

    private Long demandeStageId;
    private String statut;

    private LocalDate dateFinProlongee;
    private LocalDate dateSoumission;
}