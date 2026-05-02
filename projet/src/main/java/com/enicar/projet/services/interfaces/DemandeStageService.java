package com.enicar.projet.services.interfaces;


import com.enicar.projet.dtos.DemandeStageDTO;

import java.util.List;

public interface DemandeStageService {

    DemandeStageDTO  save(DemandeStageDTO demande);

    List<DemandeStageDTO > findAll();
    DemandeStageDTO  findByEtudiantId(Long id);

    DemandeStageDTO  findById(Long id);

    void delete(Long id);
    public DemandeStageDTO update(Long id, DemandeStageDTO dto) ;

    }
