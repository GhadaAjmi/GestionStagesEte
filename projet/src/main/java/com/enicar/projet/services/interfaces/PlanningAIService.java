package com.enicar.projet.services.interfaces;

import com.enicar.projet.dtos.PlanningING1Request;
import com.enicar.projet.dtos.PlanningING2Request;
import com.enicar.projet.dtos.SoutenanceDTO;

import java.util.List;

public interface PlanningAIService {
    List<SoutenanceDTO> genererPlanningING1(PlanningING1Request request);
    List<SoutenanceDTO> genererPlanningING2(PlanningING2Request request);

}