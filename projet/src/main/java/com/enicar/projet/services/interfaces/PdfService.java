package com.enicar.projet.services.interfaces;

import com.enicar.projet.dtos.ConventionRequestDTO;
import com.enicar.projet.dtos.LettreRequestDTO;

public interface PdfService {

    byte[] generateLettre(Long demandeStageId, LettreRequestDTO dto) throws Exception;


    byte[] signerLettre(Long documentId) throws Exception;

    byte[] signerProlongation(Long documentId) throws Exception;

    byte[] generateConvention(Long demandeStageId, ConventionRequestDTO dto) throws Exception;

    byte[] signerConvention(Long documentId) throws Exception;

    byte[] generateAvenant(Long demandeStageId) throws Exception;
     byte[] generateJournal(Long demandeId) throws Exception ;



}