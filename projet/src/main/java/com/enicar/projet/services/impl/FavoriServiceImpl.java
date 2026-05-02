package com.enicar.projet.services.impl;

import com.enicar.projet.entities.Document;
import com.enicar.projet.entities.Favori;
import com.enicar.projet.entities.Utilisateur;
import com.enicar.projet.repositories.DocumentRepository;
import com.enicar.projet.repositories.FavoriRepository;
import com.enicar.projet.repositories.UtilisateurRepository;
import com.enicar.projet.services.interfaces.FavoriService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import com.enicar.projet.exceptions.NotFoundException;

import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriServiceImpl implements FavoriService {

    private final FavoriRepository favoriRepo;
    private final UtilisateurRepository userRepo;
    private final DocumentRepository travailRepo;

    // ── Helper : récupère l'utilisateur connecté ──
    private Utilisateur getConnecte() {
      //  String email = SecurityContextHolder.getContext()
           //     .getAuthentication().getName();
        return userRepo.findByEmail("eyaahhh@enicar.tn")
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
    }

    @Override
    @Transactional
    public boolean toggleFavori(Long travailId) {
        Utilisateur user = getConnecte();

        if (favoriRepo.existsByUtilisateurIdAndTravailId(user.getId(), travailId)) {
            favoriRepo.deleteByUtilisateurIdAndTravailId(user.getId(), travailId);
            return false;
        } else {
            Document travail = travailRepo.findById(travailId)
                    .orElseThrow(() -> new NotFoundException("Travail introuvable"));

            Favori f = new Favori();
            f.setUtilisateur(user);
            f.setTravail(travail);
            favoriRepo.save(f);
            return true;
        }
    }

    @Override
    public List<Long> getMesFavorisIds() {
        Utilisateur user = getConnecte();
        return favoriRepo.findByUtilisateurId(user.getId())
                .stream()
                .map(f -> f.getTravail().getId())
                .toList();
    }
}