package com.enicar.projet.repositories;

import com.enicar.projet.entities.Journal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JournalStageRepository extends JpaRepository<Journal, Long> {
    List<Journal> findByDemandeStageIdOrderByDateDesc(Long demandeStageId);
    List<Journal> findByDemandeStageIdOrderByDateAsc(Long demandeStageId);

}