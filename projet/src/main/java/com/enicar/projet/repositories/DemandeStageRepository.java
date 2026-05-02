package com.enicar.projet.repositories;

import com.enicar.projet.entities.DemandeStage;
import com.enicar.projet.entities.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DemandeStageRepository extends JpaRepository<DemandeStage, Long> {
    Optional<DemandeStage> findByEtudiantId(Long etudiantId);
    @Query("SELECT d FROM DemandeStage d JOIN FETCH d.etudiant e " +
            "WHERE d.statut = :statut AND d.soutenance IS NULL")
    List<DemandeStage> findByStatutAndSoutenanceIsNull(StatutDemande statut);

}
