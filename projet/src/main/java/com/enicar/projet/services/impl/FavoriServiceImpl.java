package com.enicar.projet.services.impl;

import com.enicar.projet.entities.Document;
import com.enicar.projet.entities.Favori;
import com.enicar.projet.entities.Utilisateur;
import com.enicar.projet.exceptions.NotFoundException;
import com.enicar.projet.repositories.DocumentRepository;
import com.enicar.projet.repositories.FavoriRepository;
import com.enicar.projet.repositories.UtilisateurRepository;
import com.enicar.projet.services.interfaces.FavoriService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriServiceImpl implements FavoriService {

    private final FavoriRepository favoriRepo;
    private final UtilisateurRepository userRepo;
    private final DocumentRepository travailRepo;

    @Override
    @Transactional
    public boolean toggleFavori(Long utilisateurId, Long travailId) {

        Utilisateur user = userRepo.findById(utilisateurId)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        if (favoriRepo.existsByUtilisateurIdAndTravailId(user.getId(), travailId)) {
            favoriRepo.deleteByUtilisateurIdAndTravailId(user.getId(), travailId);
            return false;
        }

        Document travail = travailRepo.findById(travailId)
                .orElseThrow(() -> new NotFoundException("Travail introuvable"));

        Favori favori = new Favori();
        favori.setUtilisateur(user);
        favori.setTravail(travail);

        favoriRepo.save(favori);

        return true;
    }

    @Override
    public List<Long> getMesFavorisIds(Long utilisateurId) {

        Utilisateur user = userRepo.findById(utilisateurId)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        return favoriRepo.findByUtilisateurId(user.getId())
                .stream()
                .map(f -> f.getTravail().getId())
                .toList();
    }
}