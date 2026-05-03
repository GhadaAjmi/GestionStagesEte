package com.enicar.projet.services.interfaces;


import com.enicar.projet.dtos.ChangePasswordRequest;
import com.enicar.projet.dtos.UtilisateurDTO;
import com.enicar.projet.entities.RoleUtilisateur;
import com.enicar.projet.entities.Utilisateur;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface UtilisateurService {

    Utilisateur save(Utilisateur utilisateur);

    List<UtilisateurDTO> findAll();

    public List<UtilisateurDTO> findByRole(RoleUtilisateur role);

    Utilisateur findById(Long id);

    UtilisateurDTO findId(Long id);
    UtilisateurDTO updateUtilisateur(Long id, UtilisateurDTO dto);

    void delete(Long id);

    Utilisateur update( Utilisateur utilisateur);
    void changePassword(Long userId, ChangePasswordRequest request);
    UtilisateurDTO createUtilisateur(UtilisateurDTO dto);
   List<String> getDepartements() ;

    List<String> getNiveaux(String departement, String specialite) ;
    List<String> getSpecialites(String departement, String niveau);
     List<String> getGroupes(String departement, String specialite, String niveau) ;

     List<UtilisateurDTO> getEtudiantsByFiltre(String departement, String specialite, String niveau, String groupe) ;
     List<UtilisateurDTO> getEtudiantsSansSoutenance(String departement, String specialite, String niveau) ;

    List<UtilisateurDTO> getEnseignantsDisponibles(
            String departement,
            LocalDate date,
            LocalTime heureDebut,
            Integer duree
    );

    }
