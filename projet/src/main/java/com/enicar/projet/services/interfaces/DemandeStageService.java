package com.enicar.projet.services.interfaces;


import com.enicar.projet.dtos.DemandeRequestDTO;
import com.enicar.projet.dtos.DemandeSoumissionResponseDTO;
import com.enicar.projet.dtos.DemandeStageDTO;
import com.enicar.projet.entities.StatutDemande;

import java.util.List;

public interface DemandeStageService {

    DemandeStageDTO  save(DemandeStageDTO demande);

    List<DemandeStageDTO > findAll();
    DemandeStageDTO  findByEtudiantId(Long id);

    DemandeStageDTO  findById(Long id);

    void delete(Long id);
     DemandeStageDTO update(Long id, DemandeStageDTO dto) ;
    DemandeStageDTO updateStatut(Long id, StatutDemande statut);

    public byte[] soumettreDemandeComplete(DemandeRequestDTO request) ;

    }
