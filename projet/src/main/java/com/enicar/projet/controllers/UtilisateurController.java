package com.enicar.projet.controllers;

import com.enicar.projet.dtos.ChangePasswordRequest;
import com.enicar.projet.dtos.UtilisateurDTO;
import com.enicar.projet.entities.*;
import com.enicar.projet.services.interfaces.UtilisateurService;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
@CrossOrigin("*")
public class UtilisateurController {

    private final UtilisateurService service;

    @PostMapping("/new")
    public ResponseEntity<UtilisateurDTO> ajouter(@RequestBody UtilisateurDTO dto) {
        return ResponseEntity.status(201).body(service.createUtilisateur(dto));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<String> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request) {
        service.changePassword(id, request);
        return ResponseEntity.ok("Mot de passe mis à jour avec succès");
    }

    @GetMapping
    public List<UtilisateurDTO> all() {
        return service.findAll();
    }

    @GetMapping("/role/{role}")
    public List<UtilisateurDTO> getByRole(@PathVariable RoleUtilisateur role) {
        return service.findByRole(role);
    }

    @GetMapping("/{id}")
    public UtilisateurDTO get(@PathVariable Long id) {
        return service.findId(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UtilisateurDTO> update(
            @PathVariable Long id,
            @RequestBody UtilisateurDTO dto) {

        Utilisateur existing = service.findById(id);

        // champs communs
        existing.setNom(dto.getNom());
        existing.setPrenom(dto.getPrenom());
        existing.setActif(dto.getActif());
        existing.setDepartement(dto.getDepartement());

        // spécifiques (SAFE CAST via INSTANCEOF ENTITE)
        if (existing instanceof Etudiant etu) {
            etu.setNiveau(dto.getNiveau());
            etu.setSpecialite(dto.getSpecialite());
            etu.setGroupe(dto.getGroupe());
        }

        if (existing instanceof ChefDepartement chef) {
            chef.setGrade(dto.getGrade());
            chef.setDomaine(dto.getDomaine());
        }

        if (existing instanceof Enseignant ens) {
            ens.setGrade(dto.getGrade());
            ens.setDomaine(dto.getDomaine());
        }

        Utilisateur saved = service.save(existing);
        return ResponseEntity.ok(service.findId(saved.getId()));
    }

    @PutMapping(value = "/{id}/photo", consumes = "multipart/form-data")
    public Utilisateur updatePhoto(
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile photoProfil) throws IOException {

        Utilisateur user = service.findById(id);

        if (photoProfil != null && !photoProfil.isEmpty()) {
            user.setPhotoProfil(photoProfil.getBytes());
        }

        return service.save(user);
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long id) {
        Utilisateur user = service.findById(id);

        if (user.getPhotoProfil() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header("Content-Type", "image/jpeg")
                .body(user.getPhotoProfil());
    }

    @GetMapping("/departements")
    public List<String> getDepartements() {
        return service.getDepartements();
    }

    @GetMapping("/niveaux")
    public List<String> getNiveaux(
            @RequestParam(required = false) String departement,
            @RequestParam(required = false) String specialite) {
        return service.getNiveaux(departement, specialite);
    }

    @GetMapping("/specialites")
    public List<String> getSpecialites(
            @RequestParam(required = false) String departement,
            @RequestParam(required = false) String niveau) {
        return service.getSpecialites(departement, niveau);
    }

    @GetMapping("/groupes")
    public List<String> getGroupes(
            @RequestParam(required = false) String departement,
            @RequestParam(required = false) String specialite,
            @RequestParam(required = false) String niveau) {
        return service.getGroupes(departement, specialite, niveau);
    }

    @GetMapping("/etudiants")
    public List<UtilisateurDTO> getEtudiantsByFiltre(
            @RequestParam(required = false) String departement,
            @RequestParam(required = false) String specialite,
            @RequestParam(required = false) String niveau,
            @RequestParam(required = false) String groupe) {
        return service.getEtudiantsByFiltre(departement, specialite, niveau, groupe);
    }

    @GetMapping("/etudiants/sansSoutenance")
    public List<UtilisateurDTO> getEtudiantsSansSoutenance(
            @RequestParam(required = false) String departement,
            @RequestParam(required = false) String specialite,
            @RequestParam(required = false) String niveau) {
        return service.getEtudiantsSansSoutenance(departement, specialite, niveau);
    }
    @GetMapping("/enseignants/disponibles")
    public ResponseEntity<List<UtilisateurDTO>> getEnseignantsDisponibles(
            @RequestParam(required = false) String departement,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
            LocalTime heureDebut,

            @RequestParam(required = false)
            Integer duree
    ) {
        return ResponseEntity.ok(
                service.getEnseignantsDisponibles(departement, date, heureDebut, duree)
        );
    }
}