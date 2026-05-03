package com.enicar.projet.controllers;

import com.enicar.projet.dtos.DemandeRequestDTO;
import com.enicar.projet.dtos.DemandeSoumissionResponseDTO;
import com.enicar.projet.dtos.DemandeStageDTO;
import com.enicar.projet.entities.StatutDemande;
import com.enicar.projet.services.interfaces.DemandeStageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demandes")
@RequiredArgsConstructor
@CrossOrigin("*")
public class DemandeStageController {

    private final DemandeStageService service;

    @PostMapping
    public DemandeStageDTO save(@RequestBody DemandeStageDTO dto) {
      return service.save(dto);

    }


    @PostMapping("/soumettre")
    public ResponseEntity<byte[]> soumettreDemande(
            @RequestBody DemandeRequestDTO request
    ) {
        byte[] zipBytes = service.soumettreDemandeComplete(request);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"documents_stage.zip\""
                )
                .contentType(MediaType.parseMediaType("application/zip"))
                .body(zipBytes);
    }
    @GetMapping
    public List<DemandeStageDTO> all(){
        return service.findAll();
    }

    @GetMapping("etudiant/{id}")
    public DemandeStageDTO getByEtudiant(@PathVariable Long id){
        return service.findByEtudiantId(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        service.delete(id);
    }

    @GetMapping("/{id}")
    public DemandeStageDTO getById(@PathVariable Long id){
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public DemandeStageDTO update(@PathVariable Long id, @RequestBody DemandeStageDTO dto){
        return service.update(id, dto);
    }
    @PutMapping("/{id}/approuver")
    public DemandeStageDTO approuver(@PathVariable Long id) {
        return service.updateStatut(id, StatutDemande.VALIDEE);
    }

    @PutMapping("/{id}/rejeter")
    public DemandeStageDTO rejeter(@PathVariable Long id) {
        return service.updateStatut(id, StatutDemande.REFUSEE);
    }

    @PutMapping("/{id}/statut")
    public DemandeStageDTO modifierStatut(@PathVariable Long id, @RequestBody DemandeStageDTO dto) {
        return service.updateStatut(id, dto.getStatut());
    }
}
