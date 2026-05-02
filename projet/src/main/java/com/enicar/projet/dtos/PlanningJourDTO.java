package com.enicar.projet.dtos;


import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class PlanningJourDTO {
    private LocalDate date;
    private LocalTime heureDebut;
    private LocalTime heureFin;
}