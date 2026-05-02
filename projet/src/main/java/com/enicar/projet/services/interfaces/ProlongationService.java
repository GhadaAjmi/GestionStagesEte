package com.enicar.projet.services.interfaces;



import com.enicar.projet.dtos.ProlongationDTO;

import java.time.LocalDate;
import java.util.List;

public interface ProlongationService {

    ProlongationDTO demanderProlongation(Long demandeId, LocalDate dateFinProlongee);

    ProlongationDTO approuver(Long id);

    ProlongationDTO refuser(Long id);

    ProlongationDTO getByDemande(Long demandeId);

    List<ProlongationDTO> getAll();
}