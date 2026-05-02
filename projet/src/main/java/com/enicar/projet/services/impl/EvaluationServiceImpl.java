package com.enicar.projet.services.impl;

import com.enicar.projet.entities.Evaluation;
import com.enicar.projet.repositories.EvaluationRepository;
import com.enicar.projet.services.interfaces.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluationServiceImpl implements EvaluationService {

    private final EvaluationRepository repo;

    public Evaluation save(Evaluation e){ return repo.save(e); }

    public List<Evaluation> findAll(){ return repo.findAll(); }
}
