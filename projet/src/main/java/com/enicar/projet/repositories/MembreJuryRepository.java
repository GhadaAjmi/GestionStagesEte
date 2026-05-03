package com.enicar.projet.repositories;

import com.enicar.projet.entities.MembreJury;
import com.enicar.projet.entities.Soutenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MembreJuryRepository extends JpaRepository<MembreJury, Long> {
    List<MembreJury> findBySoutenanceId(Long soutenanceId);
    List<MembreJury> findByEnseignantId(Long enseignantId);
    boolean existsBySoutenanceIdAndEnseignantId(Long soutenanceId, Long enseignantId);
    void deleteBySoutenanceId(Long soutenanceId);
    @Query("""
        SELECT mj.soutenance
        FROM MembreJury mj
        WHERE mj.enseignant.id = :enseignantId
          AND mj.soutenance.date = :date
    """)
    List<Soutenance> findSoutenancesByEnseignantAndDate(
            @Param("enseignantId") Long enseignantId,
            @Param("date") LocalDate date
    );

    List<MembreJury> findByEnseignant_Id(Long enseignantId);

    List<MembreJury> findBySoutenance_Id(Long soutenanceId);
}



