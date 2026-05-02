package com.enicar.projet.controllers;

import com.enicar.projet.entities.Evaluation;
import com.enicar.projet.services.interfaces.EvaluationService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
@CrossOrigin("*")
public class EvaluationController {

    private final EvaluationService service;

    @PostMapping
    public Evaluation save(@RequestBody Evaluation e){
        return service.save(e);
    }

    @GetMapping
    public List<Evaluation> all(){
        return service.findAll();
    }
}
