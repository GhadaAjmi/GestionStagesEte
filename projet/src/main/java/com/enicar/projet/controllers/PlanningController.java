package com.enicar.projet.controllers;


import com.enicar.projet.dtos.PlanningING1Request;
import com.enicar.projet.dtos.PlanningING2Request;
import com.enicar.projet.dtos.SoutenanceDTO;
import com.enicar.projet.services.interfaces.PlanningAIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planning")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PlanningController {

    private final PlanningAIService planningAIService;


    @PostMapping("/ing1/generer")
    public ResponseEntity<List<SoutenanceDTO>> genererPlanningING1(
            @RequestBody PlanningING1Request request
    ) {
        return ResponseEntity.ok(
                planningAIService.genererPlanningING1(request)
        );
    }
    @PostMapping("/ing2/generer")
    public ResponseEntity<List<SoutenanceDTO>> genererPlanningING2(
            @RequestBody PlanningING2Request request
    ) {
        return ResponseEntity.ok(
                planningAIService.genererPlanningING2(request)
        );
    }
}