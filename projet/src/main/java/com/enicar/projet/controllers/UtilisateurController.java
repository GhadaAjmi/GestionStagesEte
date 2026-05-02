package com.enicar.projet.controllers;

import com.enicar.projet.dtos.ChangePasswordRequest;
import com.enicar.projet.dtos.UtilisateurDTO;
import com.enicar.projet.entities.RoleUtilisateur;
import com.enicar.projet.entities.Utilisateur;
import com.enicar.projet.services.interfaces.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
@CrossOrigin("*")
public class UtilisateurController {

    private final UtilisateurService service;

    // =========================================================
    // CREATE
    // =========================================================
    @PostMapping("/new")
    public ResponseEntity<UtilisateurDTO> ajouter(@RequestBody UtilisateurDTO dto) {
        return ResponseEntity.status(201).body(service.createUtilisateur(dto));
    }

    // =========================================================
    // UPDATE
    // =========================================================
    @PutMapping("/{id}")
    public ResponseEntity<UtilisateurDTO> update(
            @PathVariable Long id,
            @RequestBody UtilisateurDTO dto) {

        return ResponseEntity.ok(service.updateUtilisateur(id, dto));
    }

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================
    @PutMapping("/{id}/password")
    public ResponseEntity<String> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request) {

        service.changePassword(id, request);
        return ResponseEntity.ok("Mot de passe mis à jour avec succès");
    }

    // =========================================================
    // FIND ALL
    // =========================================================
    @GetMapping
    public ResponseEntity<List<UtilisateurDTO>> all() {
        return ResponseEntity.ok(service.findAll());
    }

    // =========================================================
    // FIND BY ID
    // =========================================================
    @GetMapping("/{id}")
    public ResponseEntity<UtilisateurDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.findId(id));
    }

    // =========================================================
    // FIND BY ROLE
    // =========================================================
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UtilisateurDTO>> getByRole(@PathVariable RoleUtilisateur role) {
        return ResponseEntity.ok(service.findByRole(role));
    }

    // =========================================================
    // DELETE
    // =========================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // UPDATE PHOTO
    // =========================================================
    @PutMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UtilisateurDTO> updatePhoto(
            @PathVariable Long id,
            @RequestParam("photoProfil") MultipartFile photoProfil) throws IOException {

        Utilisateur user = service.findById(id);

        if (photoProfil != null && !photoProfil.isEmpty()) {
            user.setPhotoProfil(photoProfil.getBytes());
            service.save(user);
        }

        return ResponseEntity.ok(service.findId(id));
    }

    // =========================================================
    // GET PHOTO
    // =========================================================
    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long id) {

        Utilisateur user = service.findById(id);

        if (user.getPhotoProfil() == null || user.getPhotoProfil().length == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(user.getPhotoProfil());
    }

    // =========================================================
    // FILTERS
    // =========================================================
    @GetMapping("/departements")
    public ResponseEntity<List<String>> getDepartements() {
        return ResponseEntity.ok(service.getDepartements());
    }

    @GetMapping("/niveaux")
    public ResponseEntity<List<String>> getNiveaux(
            @RequestParam(required = false) String departement,
            @RequestParam(required = false) String specialite) {

        return ResponseEntity.ok(service.getNiveaux(departement, specialite));
    }

    @GetMapping("/specialites")
    public ResponseEntity<List<String>> getSpecialites(
            @RequestParam(required = false) String departement,
            @RequestParam(required = false) String niveau) {

        return ResponseEntity.ok(service.getSpecialites(departement, niveau));
    }

    @GetMapping("/groupes")
    public ResponseEntity<List<String>> getGroupes(
            @RequestParam(required = false) String departement,
            @RequestParam(required = false) String specialite,
            @RequestParam(required = false) String niveau) {

        return ResponseEntity.ok(service.getGroupes(departement, specialite, niveau));
    }

    // =========================================================
    // ETUDIANTS
    // =========================================================
    @GetMapping("/etudiants")
    public ResponseEntity<List<UtilisateurDTO>> getEtudiantsByFiltre(
            @RequestParam(required = false) String departement,
            @RequestParam(required = false) String specialite,
            @RequestParam(required = false) String niveau,
            @RequestParam(required = false) String groupe) {

        return ResponseEntity.ok(
                service.getEtudiantsByFiltre(departement, specialite, niveau, groupe)
        );
    }

    @GetMapping("/etudiants/sans-soutenance")
    public ResponseEntity<List<UtilisateurDTO>> getEtudiantsSansSoutenance(
            @RequestParam(required = false) String departement,
            @RequestParam(required = false) String specialite,
            @RequestParam(required = false) String niveau) {

        return ResponseEntity.ok(
                service.getEtudiantsSansSoutenance(departement, specialite, niveau)
        );
    }

    /*
     * Ancien endpoint gardé pour compatibilité avec le frontend existant :
     * /api/utilisateurs/etudiants/sansSoutenance
     */
    @GetMapping("/etudiants/sansSoutenance")
    public ResponseEntity<List<UtilisateurDTO>> getEtudiantsSansSoutenanceOld(
            @RequestParam(required = false) String departement,
            @RequestParam(required = false) String specialite,
            @RequestParam(required = false) String niveau) {

        return ResponseEntity.ok(
                service.getEtudiantsSansSoutenance(departement, specialite, niveau)
        );
    }

    // =========================================================
    // ENSEIGNANTS DISPONIBLES
    // =========================================================
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
            Integer duree) {

        return ResponseEntity.ok(
                service.getEnseignantsDisponibles(departement, date, heureDebut, duree)
        );
    }
}