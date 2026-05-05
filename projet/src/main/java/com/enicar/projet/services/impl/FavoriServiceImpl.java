package com.enicar.projet.services.impl;

import com.enicar.projet.entities.Document;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
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
    private static final Logger log =
            LogManager.getLogger(FavoriServiceImpl.class);

    private final FavoriRepository favoriRepo;
    private final UtilisateurRepository userRepo;
    private final DocumentRepository travailRepo;

    @Override
    @Transactional
    public boolean toggleFavori(Long utilisateurId, Long travailId) {
        log.info("Toggle favori — utilisateur id={} / document id={}",
                utilisateurId, travailId);

        Utilisateur user = userRepo.findById(utilisateurId)
                .orElseThrow(() -> {
                    log.error("Utilisateur introuvable id={}", utilisateurId);
                    return new NotFoundException("Utilisateur introuvable");
                });


        if (favoriRepo.existsByUtilisateurIdAndTravailId(user.getId(), travailId)) {
            favoriRepo.deleteByUtilisateurIdAndTravailId(user.getId(), travailId);
            log.info("Favori supprimé — utilisateur id={} / document id={}",
                    utilisateurId, travailId);
            return false;
        }

        Document travail = travailRepo.findById(travailId)
                .orElseThrow(() -> {
                    log.error("Document introuvable id={}", travailId);
                    return new NotFoundException("Travail introuvable");
                });

        Favori favori = new Favori();
        favori.setUtilisateur(user);
        favori.setTravail(travail);

        favoriRepo.save(favori);
        log.info("Favori ajouté — utilisateur id={} / document id={}",
                utilisateurId, travailId);

        return true;
    }

    @Override
    public List<Long> getMesFavorisIds(Long utilisateurId) {
        log.debug("Récupération favoris pour utilisateur id={}", utilisateurId);

        Utilisateur user = userRepo.findById(utilisateurId)
                .orElseThrow(() -> {
                    log.error("Utilisateur introuvable id={}", utilisateurId);
                    return new NotFoundException("Utilisateur introuvable");
                });


        return favoriRepo.findByUtilisateurId(user.getId())
                .stream()
                .map(f -> f.getTravail().getId())
                .toList();
    }
}