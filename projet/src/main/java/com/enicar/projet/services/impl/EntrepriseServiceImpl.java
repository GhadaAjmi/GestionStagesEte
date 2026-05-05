package com.enicar.projet.services.impl;

import com.enicar.projet.entities.Entreprise;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import com.enicar.projet.exceptions.NotFoundException;
import com.enicar.projet.repositories.EntrepriseRepository;
import com.enicar.projet.services.interfaces.EntrepriseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EntrepriseServiceImpl implements EntrepriseService {
    private static final Logger log = LogManager.getLogger(EntrepriseServiceImpl.class);


    private final EntrepriseRepository repository;

    @Override
    public Entreprise save(Entreprise entreprise) {
        log.info("Création entreprise — nom={}", entreprise.getNom());
        Entreprise saved = repository.save(entreprise);
        log.info("Entreprise créée avec succès — id={}, nom={}", saved.getId(), saved.getNom());
        return saved;
    }

    @Override
    public List<Entreprise> findAll() {
        log.debug("Récupération de toutes les entreprises");
        return repository.findAll();
    }

    @Override
    public Entreprise findById(Long id) {
        log.debug("Récupération entreprise — id={}", id);
        return repository.findById(id)
                .orElseThrow(() -> {
                    log.error("Entreprise introuvable — id={}", id);
                    return new NotFoundException("Entreprise introuvable : " + id);
                });
    }

    @Override
    public Entreprise update(Long id, Entreprise entreprise) {
        log.info("Mise à jour entreprise — id={}, nouveauNom={}", id, entreprise.getNom());
        Entreprise existing = repository.findById(id)
                .orElseThrow(() -> {
                    log.error("Entreprise introuvable pour mise à jour — id={}", id);
                    return new NotFoundException("Entreprise introuvable : " + id);
                });

        existing.setNom(entreprise.getNom());
        existing.setAdresse(entreprise.getAdresse());
        existing.setRepresentant(entreprise.getRepresentant());
        existing.setEmail(entreprise.getEmail());
        existing.setTelephone(entreprise.getTelephone());
        existing.setFax(entreprise.getFax());

        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        log.info("Suppression entreprise — id={}", id);
        if (!repository.existsById(id)) {
            log.error("Entreprise introuvable pour suppression — id={}", id);
            throw new NotFoundException("Entreprise introuvable : " + id);
        }

        repository.deleteById(id);
    }

    @Override
    public Entreprise searchByNom(String nom) {
        log.debug("Recherche entreprise par nom — nom={}", nom);
        return repository.findByNomIgnoreCase(nom);
    }
}