package com.enicar.projet.controllers;

import com.enicar.projet.dtos.ProlongationDTO;
import com.enicar.projet.services.interfaces.ProlongationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/prolongations")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ProlongationController {

    private final ProlongationService service;

    // Demande prolongation
    @PostMapping
    public ProlongationDTO demander(
            @RequestParam Long demandeId,
            @RequestParam LocalDate dateFinProlongee
    ) {
        return service.demanderProlongation(
                demandeId,
                dateFinProlongee
        );
    }

    //  Approuver
    @PutMapping("/{id}/approuver")
    public ProlongationDTO approuver(@PathVariable Long id) {
        return service.approuver(id);
    }

    // ✅ Refuser
    @PutMapping("/{id}/refuser")
    public ProlongationDTO refuser(@PathVariable Long id) {
        return service.refuser(id);
    }

    // ✅ Get par demande
    @GetMapping("/demande/{demandeId}")
    public ProlongationDTO getByDemande(@PathVariable Long demandeId) {
        return service.getByDemande(demandeId);
    }

    // ✅ Get all
    @GetMapping
    public List<ProlongationDTO> getAll() {
        return service.getAll();
    }
}