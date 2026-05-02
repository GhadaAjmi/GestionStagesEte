package com.enicar.projet.controllers;


import com.enicar.projet.dtos.JournalStageDTO;
import com.enicar.projet.services.interfaces.JournalStageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/journal")
@RequiredArgsConstructor
public class JournalStageController {

    private final JournalStageService service;

    // GET /api/journal-stage/demande/{id}
    @GetMapping("/demande/{id}")
    public ResponseEntity<List<JournalStageDTO>> getByDemande(@PathVariable Long id) {
        return ResponseEntity.ok(service.getByDemande(id));
    }

    // GET /api/journal-stage/{id}
    @GetMapping("/{id}")
    public ResponseEntity<JournalStageDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // POST /api/journal-stage
    @PostMapping
    public ResponseEntity<JournalStageDTO> create(@RequestBody JournalStageDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    // PUT /api/journal/{id}
    @PutMapping("/{id}")
    public ResponseEntity<JournalStageDTO> update(@PathVariable Long id, @RequestBody JournalStageDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // DELETE /api/journal/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Put /api/journal/{id}/vue
    @PutMapping("/{id}/vue")
    public ResponseEntity<JournalStageDTO> marquerVue(@PathVariable Long id) {
        return ResponseEntity.ok(service.marquerVue(id));
    }

    // Put /api/journal/{id}/valider
    @PutMapping("commenter/{id}")
    public ResponseEntity<JournalStageDTO> commenter(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String commentaire = body.getOrDefault("commentaire", "");
        return ResponseEntity.ok(service.commenter(id, commentaire));
    }
    // PATCH /api/journal/{id}/valider
    @PutMapping("valider/{id}")
    public ResponseEntity<JournalStageDTO> valider(
            @PathVariable Long id) {
        return ResponseEntity.ok(service.valider(id));
    }
}