package com.enicar.projet.services.interfaces;

import com.enicar.projet.entities.Evaluation;

import java.util.List;

public interface EvaluationService {
    Evaluation save(Evaluation e);
    List<Evaluation> findAll();
}
