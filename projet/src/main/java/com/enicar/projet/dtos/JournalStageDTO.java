package com.enicar.projet.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JournalStageDTO {
    private Long id;
    private Long demandeStageId;
    private LocalDate date;
    private String activitesEtObservations;
    private String commentaireResponsable;
    private boolean vueResponsable;
    private boolean valideResponsable;
}