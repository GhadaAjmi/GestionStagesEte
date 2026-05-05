package com.enicar.projet.services.interfaces;

import com.enicar.projet.dtos.UtilisateurDTO;

import java.util.List;
import java.util.Map;

public interface UtilisateurImportService {
    Map<String, Object> importBulk(List<UtilisateurDTO> dtos) ;

    }
