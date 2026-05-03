package com.enicar.projet.controllers;

import com.enicar.projet.services.interfaces.FavoriService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favoris")
@RequiredArgsConstructor
public class FavoriController {

    private final FavoriService favoriService;

    // Toggle favori
    @PostMapping("/{travailId}/toggle")
    public ResponseEntity<Boolean> toggle(
            @PathVariable Long travailId,
            @RequestParam Long utilisateurId
    ) {
        return ResponseEntity.ok(
                favoriService.toggleFavori(utilisateurId, travailId)
        );
    }

    // Récupérer les IDs favoris d'un utilisateur
    @GetMapping
    public ResponseEntity<List<Long>> getMesIds(
            @RequestParam Long utilisateurId
    ) {
        return ResponseEntity.ok(
                favoriService.getMesFavorisIds(utilisateurId)
        );
    }
}