package com.enicar.projet.services.interfaces;

import java.util.List;


import com.enicar.projet.dtos.EvaluationMoyenneDTO;
import com.enicar.projet.dtos.EvaluationRequestDTO;
import com.enicar.projet.dtos.EvaluationResponseDTO;

import java.util.List;

public interface EvaluationService {


    EvaluationResponseDTO soumettre(EvaluationRequestDTO dto);


    EvaluationResponseDTO getParEnseignantEtSoutenance(Long enseignantId, Long soutenanceId);

    List<EvaluationResponseDTO> getParSoutenance(Long soutenanceId);


    List<EvaluationResponseDTO> getParEnseignant(Long enseignantId);


    EvaluationMoyenneDTO getMoyenneParSoutenance(Long soutenanceId);

    void supprimer(Long evaluationId);
}