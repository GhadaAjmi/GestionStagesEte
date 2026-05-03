package com.enicar.projet.services.interfaces;

import com.enicar.projet.entities.Entreprise;

import java.util.List;

public interface EntrepriseService {

    Entreprise save(Entreprise entreprise);

    List<Entreprise> findAll();

    Entreprise findById(Long id);

    Entreprise update(Long id, Entreprise entreprise);

    void delete(Long id);

    Entreprise searchByNom(String nom);
}