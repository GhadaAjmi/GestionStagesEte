package com.enicar.projet.controllers;

import com.enicar.projet.services.interfaces.FavoriService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// FavoriController.java
@RestController
@RequestMapping("/api/favoris")
@RequiredArgsConstructor
@CrossOrigin("*")

public class FavoriController {

    private final FavoriService favoriService;

    // Toggle favori
    @PostMapping("/{travailId}/toggle")
    public ResponseEntity<Boolean> toggle(@PathVariable Long travailId) {
        return ResponseEntity.ok(favoriService.toggleFavori(travailId));
    }

    // Récupérer les IDs favoris de l'utilisateur connecté
    @GetMapping()
    public ResponseEntity<List<Long>> getMesIds() {
        return ResponseEntity.ok(favoriService.getMesFavorisIds());
    }
}