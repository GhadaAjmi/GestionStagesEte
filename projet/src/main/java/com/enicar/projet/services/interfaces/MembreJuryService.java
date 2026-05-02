package com.enicar.projet.services.interfaces;


import com.enicar.projet.dtos.MembreJuryDTO;

import java.util.List;

public interface MembreJuryService {
    MembreJuryDTO ajouter(MembreJuryDTO dto);

    MembreJuryDTO getById(Long id);

    List<MembreJuryDTO> getAll();

    List<MembreJuryDTO> getBySoutenance(Long soutenanceId);

    List<MembreJuryDTO> getByEnseignant(Long enseignantId);

    void supprimer(Long id);
}

