package com.enicar.projet.services.interfaces;



import com.enicar.projet.dtos.PlanificationGroupeDTO;
import com.enicar.projet.dtos.SoutenanceDTO;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface SoutenanceService {
    SoutenanceDTO ajouter(SoutenanceDTO dto);

    SoutenanceDTO modifier(Long id, SoutenanceDTO dto);

    void supprimer(Long id);

    SoutenanceDTO getById(Long id);
     SoutenanceDTO modifierStatut(Long id, String statut) ;

    List<SoutenanceDTO> getAll();
    List<SoutenanceDTO> planifierGroupe(PlanificationGroupeDTO dto);
    List<SoutenanceDTO> getAllIng2();
    List<SoutenanceDTO> updateGroupeDepuisSoutenance(
            Long soutenanceId,
            PlanificationGroupeDTO dto
    );
    SoutenanceDTO getSoutenanceByEtudiant(Long etudiantId);

    List<SoutenanceDTO> getSoutenancesByEnseignant(Long enseignantId);
}
