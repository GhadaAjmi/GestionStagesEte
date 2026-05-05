package com.enicar.projet.repositories;

import com.enicar.projet.entities.Soutenance;
import com.enicar.projet.entities.StatutSoutenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SoutenanceRepository extends JpaRepository<Soutenance, Long> {
    Optional<Soutenance> findByDemandeStageEtudiantId(Long etudiantId);
    Optional<Soutenance> findByDemandeStageId(Long demandeId);

    List<Soutenance> findBySalleIdAndDate(Long salleId, LocalDate date);
    List<Soutenance> findByDate(LocalDate date);
    List<Soutenance> findBySalleId(Long salleId);
    List<Soutenance> findByStatut(StatutSoutenance statut);
    @Query("""
    SELECT s
    FROM Soutenance s
    WHERE s.demandeStage IS NOT NULL
      AND s.demandeStage.etudiant IS NOT NULL
      AND LOWER(s.demandeStage.etudiant.niveau) = LOWER(:niveau)
""")
    List<Soutenance> findByEtudiantNiveau(@Param("niveau") String niveau);

    @Query("""
    select distinct s
    from Soutenance s
    join s.membresJury mj
    where mj.enseignant.id = :enseignantId
""")
    List<Soutenance> findByEnseignantId(@Param("enseignantId") Long enseignantId);
}
