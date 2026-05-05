package com.enicar.projet.repositories;

import com.enicar.projet.entities.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    /** Évaluation d'un enseignant pour une soutenance donnée */
    Optional<Evaluation> findByEnseignant_IdAndSoutenance_Id(
            Long enseignantId, Long soutenanceId);

    /** Toutes les évaluations d'une soutenance */
    List<Evaluation> findBySoutenance_IdOrderByCreatedAtAsc(Long soutenanceId);

    /** Toutes les évaluations soumises par un enseignant */
    List<Evaluation> findByEnseignant_IdOrderByCreatedAtDesc(Long enseignantId);

    /** Vérifier si un enseignant a déjà évalué une soutenance */
    boolean existsByEnseignant_IdAndSoutenance_Id(Long enseignantId, Long soutenanceId);

    /** Moyenne de la note finale pour une soutenance */
    @Query("""
            SELECT AVG(e.noteFinale)
            FROM Evaluation e
            WHERE e.soutenance.id = :soutenanceId
              AND e.noteFinale IS NOT NULL
            """)
    Optional<Double> findMoyenneFinaleParSoutenance(@Param("soutenanceId") Long soutenanceId);

    /** Nombre d'évaluateurs ayant rendu leur évaluation pour une soutenance */
    long countBySoutenance_Id(Long soutenanceId);
}