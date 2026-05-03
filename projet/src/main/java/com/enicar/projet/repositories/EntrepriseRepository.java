package com.enicar.projet.repositories;

import com.enicar.projet.entities.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;


public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {
    Entreprise findByNomIgnoreCase(String nom);
}