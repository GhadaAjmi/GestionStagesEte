package com.enicar.projet.services.impl;

import com.enicar.projet.entities.Entreprise;
import com.enicar.projet.exceptions.NotFoundException;
import com.enicar.projet.repositories.EntrepriseRepository;
import com.enicar.projet.services.interfaces.EntrepriseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EntrepriseServiceImpl implements EntrepriseService {

    private final EntrepriseRepository repository;

    @Override
    public Entreprise save(Entreprise entreprise) {
        return repository.save(entreprise);
    }

    @Override
    public List<Entreprise> findAll() {
        return repository.findAll();
    }

    @Override
    public Entreprise findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Entreprise introuvable : " + id));
    }

    @Override
    public Entreprise update(Long id, Entreprise entreprise) {
        Entreprise existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Entreprise introuvable : " + id));

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
        if (!repository.existsById(id)) {
            throw new NotFoundException("Entreprise introuvable : " + id);
        }

        repository.deleteById(id);
    }

    @Override
    public Entreprise searchByNom(String nom) {
        return repository.findByNomIgnoreCase(nom);
    }
}