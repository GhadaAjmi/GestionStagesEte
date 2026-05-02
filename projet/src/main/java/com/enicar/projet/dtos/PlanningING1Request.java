package com.enicar.projet.dtos;

import lombok.Data;

import java.util.List;

@Data
public class PlanningING1Request {

    private String departement;
    private String specialite;

    private Integer nbJury;

    private Integer dureeParEtudiant;

    private Integer nombreJours;

    private List<PlanningJourDTO> jours;

}