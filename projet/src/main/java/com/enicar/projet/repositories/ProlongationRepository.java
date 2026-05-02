package com.enicar.projet.repositories;

import com.enicar.projet.entities.DemandeStage;
import com.enicar.projet.entities.Prolongation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProlongationRepository extends JpaRepository<Prolongation, Long> {
    Optional<Prolongation> findByDemandeStage(DemandeStage demandeStage);
    boolean existsByDemandeStage(DemandeStage demandeStage);
}