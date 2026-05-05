package com.enicar.projet.services.impl;


import com.enicar.projet.dtos.UtilisateurDTO;
import com.enicar.projet.entities.*;
import com.enicar.projet.repositories.UtilisateurRepository;
import com.enicar.projet.services.interfaces.UtilisateurImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class UtilisateurImportServiceImpl implements UtilisateurImportService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
   @Override
    public Map<String, Object> importBulk(List<UtilisateurDTO> dtos) {
        int success = 0;
        List<Map<String, Object>> errors = new ArrayList<>();

        for (int i = 0; i < dtos.size(); i++) {
            UtilisateurDTO dto = dtos.get(i);
            try {
                Utilisateur entity = buildEntity(dto);
                utilisateurRepository.save(entity);
                success++;
            } catch (Exception e) {
                errors.add(Map.of(
                        "ligne",   i + 2,
                        "message", e.getMessage() != null ? e.getMessage() : "Erreur inconnue"
                ));
            }
        }

        return Map.of(
                "total",   dtos.size(),
                "success", success,
                "errors",  errors
        );
    }

    private Utilisateur buildEntity(UtilisateurDTO dto) {
        String motDePasseHash = passwordEncoder.encode(dto.getMotDePasse());

        return switch (dto.getRole().toUpperCase()) {
            case "ETUDIANT" -> {
                Etudiant e = new Etudiant();
                fillCommon(e, dto, motDePasseHash);
                e.setNiveau(dto.getNiveau());
                e.setSpecialite(dto.getSpecialite());
                e.setGroupe(dto.getGroupe());
                e.setNumeroInscription(dto.getNumeroInscription());
                yield e;
            }
            case "ENSEIGNANT" -> {
                Enseignant e = new Enseignant();
                fillCommon(e, dto, motDePasseHash);
                e.setGrade(dto.getGrade());
                e.setDomaine(dto.getDomaine());
                yield e;
            }
            case "ADMIN" -> {
                Admin a = new Admin();
                fillCommon(a, dto, motDePasseHash);
                yield a;
            }
            case "RESPONSABLE" -> {
                Responsable r = new Responsable();
                fillCommon(r, dto, motDePasseHash);
                yield r;
            }
            case "CHEF_DEPARTEMENT" -> {
                ChefDepartement c = new ChefDepartement();
                fillCommon(c, dto, motDePasseHash);
                yield c;
            }
            case "SERVICE_STAGE" -> {
                ServiceStage s = new ServiceStage();
                fillCommon(s, dto, motDePasseHash);
                yield s;
            }
            default -> throw new IllegalArgumentException("Rôle inconnu : " + dto.getRole());
        };
    }

    private void fillCommon(Utilisateur u, UtilisateurDTO dto, String hashedPassword) {
        u.setCin(dto.getCin());
        u.setNom(dto.getNom());
        u.setPrenom(dto.getPrenom());
        u.setEmail(dto.getEmail());
        u.setTelephone(dto.getTelephone());
        u.setMotDePasse(hashedPassword);
        u.setLieuDelivranceCin(dto.getLieuDelivranceCin());
        u.setDateDelivranceCin(dto.getDateDelivranceCin());
        u.setDepartement(dto.getDepartement());
        u.setActif(dto.getActif() != null ? dto.getActif() : true);
    }
}