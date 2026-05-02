package com.enicar.projet.repositories;

import com.enicar.projet.entities.Favori;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriRepository extends JpaRepository<Favori, Long> {
    List<Favori> findByUtilisateurId(Long userId);
    Optional<Favori> findByUtilisateurIdAndTravailId(Long userId, Long travailId);
    void deleteByUtilisateurIdAndTravailId(Long userId, Long travailId);
    boolean existsByUtilisateurIdAndTravailId(Long userId, Long travailId);
}
