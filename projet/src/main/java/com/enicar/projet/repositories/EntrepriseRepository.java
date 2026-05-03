package com.enicar.projet.repositories;

import com.enicar.projet.entities.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {
    Entreprise findByNomIgnoreCase(String nom);
    Optional<Entreprise> findByNom(String nom);
    boolean existsByNom(String nom);
}