package com.enicar.projet.dtos;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class PlanificationGroupeDTO {

    private String groupe;
    private String niveau;

    private LocalDate date;
    private LocalTime heureDebut;
    private int duree;

    private Long salleId;
    private String statut;

    private List<MembreJuryDTO> membresJury;
    private List<Long> etudiantIds;
}