package com.enicar.projet.controllers;

import com.enicar.projet.dtos.MembreJuryDTO;
import com.enicar.projet.services.interfaces.MembreJuryService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jury")
@RequiredArgsConstructor
@CrossOrigin("*")
public class MembreJuryController {

    private final MembreJuryService service;

    // CREATE
    @PostMapping
    public MembreJuryDTO ajouter(@RequestBody MembreJuryDTO dto) {
        return service.ajouter(dto);
    }

    // GET ALL
    @GetMapping
    public List<MembreJuryDTO> all() {
        return service.getAll();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public MembreJuryDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // GET BY SOUTENANCE
    @GetMapping("/soutenance/{id}")
    public List<MembreJuryDTO> getBySoutenance(@PathVariable Long id) {
        return service.getBySoutenance(id);
    }

    // GET BY ENSEIGNANT
    @GetMapping("/enseignant/{id}")
    public List<MembreJuryDTO> getByEnseignant(@PathVariable Long id) {
        return service.getByEnseignant(id);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.supprimer(id);
    }
}