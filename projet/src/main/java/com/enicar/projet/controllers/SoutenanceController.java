package com.enicar.projet.controllers;

import com.enicar.projet.dtos.PlanificationGroupeDTO;
import com.enicar.projet.dtos.SoutenanceDTO;
import com.enicar.projet.services.interfaces.SoutenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/soutenances")
@RequiredArgsConstructor
@CrossOrigin("*")
public class SoutenanceController {

    private final SoutenanceService service;

    @PostMapping
    public SoutenanceDTO save(@RequestBody SoutenanceDTO dto) {
        return service.ajouter(dto);
    }

    @GetMapping
    public List<SoutenanceDTO> all() {
        return service.getAll();
    }

    @GetMapping("/niveau/2")
    public List<SoutenanceDTO> getIng2() {
        return service.getAllIng2();
    }
    @GetMapping("/{id}")
    public SoutenanceDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }
    @GetMapping("/etudiant/{etudiantId}")
    public SoutenanceDTO getSoutenanceByEtudiant(@PathVariable Long etudiantId) {
        return service.getSoutenanceByEtudiant(etudiantId);
    }

    @GetMapping("/enseignant/{enseignantId}")
    public List<SoutenanceDTO> getSoutenancesByEnseignant(@PathVariable Long enseignantId) {
        return service.getSoutenancesByEnseignant(enseignantId);
    }
    @PutMapping("/{id}")
    public SoutenanceDTO update(@PathVariable Long id, @RequestBody SoutenanceDTO dto) {
        return service.modifier(id, dto);
    }
    @PutMapping("/{id}/statut")
    public SoutenanceDTO updateStatut(
            @PathVariable Long id,
            @RequestBody String statut
    ) {
        statut = statut.replace("\"", "").trim();
        return service.modifierStatut(id, statut);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.supprimer(id);
    }

    @PostMapping("/groupe")
    public ResponseEntity<List<SoutenanceDTO>> planifierGroupe(
            @RequestBody PlanificationGroupeDTO dto) {
        return ResponseEntity.ok(service.planifierGroupe(dto));
    }
    @PutMapping("/groupe/{soutenanceId}")
    public ResponseEntity<List<SoutenanceDTO>> updateGroupeDepuisSoutenance(
            @PathVariable Long soutenanceId,
            @RequestBody PlanificationGroupeDTO dto
    ) {
        return ResponseEntity.ok(
                service.updateGroupeDepuisSoutenance(soutenanceId, dto)
        );
    }
}
