package com.enicar.projet.dtos;

import lombok.Data;

import java.util.List;

@Data
public class PlanningING2Request {

    private String departement;

    private Integer nbJury;

    private Integer dureeSoutenance;

    private Integer nombreJours;

    private List<PlanningJourDTO> jours;



}