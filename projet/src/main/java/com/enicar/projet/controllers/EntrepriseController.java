package com.enicar.projet.controllers;

import com.enicar.projet.entities.Entreprise;
import com.enicar.projet.services.interfaces.EntrepriseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entreprises")
@RequiredArgsConstructor
@CrossOrigin("*")
public class EntrepriseController {

    private final EntrepriseService service;

    @PostMapping
    public Entreprise save(@RequestBody Entreprise entreprise) {
        return service.save(entreprise);
    }

    @GetMapping
    public List<Entreprise> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Entreprise findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public Entreprise update(@PathVariable Long id, @RequestBody Entreprise entreprise) {
        return service.update(id, entreprise);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/search")
    public Entreprise searchByNom(@RequestParam String nom) {
        return service.searchByNom(nom);
    }
}