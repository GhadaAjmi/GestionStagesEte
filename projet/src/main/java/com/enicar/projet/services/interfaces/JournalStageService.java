package com.enicar.projet.services.interfaces;

import com.enicar.projet.dtos.JournalStageDTO;

import java.util.List;

public interface JournalStageService {
    List<JournalStageDTO> getByDemande(Long demandeId);
    JournalStageDTO getById(Long id);
    JournalStageDTO create(JournalStageDTO dto);
    JournalStageDTO update(Long id, JournalStageDTO dto);
    void delete(Long id);
    JournalStageDTO marquerVue(Long id);
    JournalStageDTO valider(Long id);
    JournalStageDTO commenter(Long id, String commentaire);

}