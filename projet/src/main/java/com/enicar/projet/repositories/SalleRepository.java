package com.enicar.projet.repositories;

import com.enicar.projet.entities.Salle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalleRepository extends JpaRepository<Salle, Long> {
    Optional<Salle> findByCode(String code);
    List<Salle> findByLocalisationContainingIgnoreCase(String localisation);
    @Query("""
    SELECT s
    FROM Salle s
    WHERE LOWER(s.localisation) LIKE LOWER(CONCAT('%', :localisation, '%'))
      AND s.supportePoster = true
""")
    List<Salle> findSallesPosterByLocalisation(@Param("localisation") String localisation);

    @Query("""
    SELECT s
    FROM Salle s
    WHERE LOWER(s.localisation) LIKE LOWER(CONCAT('%', :localisation, '%'))
      AND s.supportePresentation = true
""")
    List<Salle> findSallesPresentationByLocalisation(@Param("localisation") String localisation);
}
