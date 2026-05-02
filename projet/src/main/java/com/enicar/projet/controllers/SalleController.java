package com.enicar.projet.controllers;

import com.enicar.projet.entities.Salle;
import com.enicar.projet.services.interfaces.SalleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salles")
@RequiredArgsConstructor
@CrossOrigin("*")
public class SalleController {

    private final SalleService service;

    @PostMapping
    public Salle save(@RequestBody Salle s){
        return service.save(s);
    }

    @GetMapping
    public List<Salle> all(){
        return service.findAll();
    }
    @GetMapping("/{id}")
    public Salle findById(@PathVariable Long id){
       return service.findById(id);
    }
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        service.delete(id);
    }

    @PutMapping("/{id}")
    public Salle update(@PathVariable Long id, @RequestBody Salle s){
        Salle existing = service.findById(id);
        existing.setCode(s.getCode());
        existing.setLocalisation(s.getLocalisation());
        return service.save(existing);
    }
    @GetMapping("/{salleId}/disponibilite")
    public ResponseEntity<?> verifierDisponibilite(
            @PathVariable Long salleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime heureDebut,
            @RequestParam int duree
    ) {
        List<String> conflits = service.getConflits(salleId, date, heureDebut, duree);
        Map<String, Object> response = new HashMap<>();
        response.put("disponible", conflits.isEmpty());
        if (!conflits.isEmpty()) response.put("conflits", conflits);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/localisation/{loc}")
    public ResponseEntity<List<Salle>> getSallesParLocalisation(@PathVariable("loc") String loc) {
        List<Salle> salles = service.getSallesParLocalisation(loc);
        return ResponseEntity.ok(salles);
    }

}
