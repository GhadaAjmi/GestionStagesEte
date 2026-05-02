package com.enicar.projet.repositories;


import com.enicar.projet.entities.Document;
import com.enicar.projet.entities.TypeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    // Récupérer documents avec DemandeStage et Etudiant chargés
    @Query("SELECT d FROM DocumentDemande d " +
            "JOIN FETCH d.demandeStage ds " +
            "JOIN FETCH ds.etudiant " +
            "WHERE ds.id = :demandeStageId")
    List<Document> findByDemandeStageIdWithEtudiant(@Param("demandeStageId") Long demandeStageId);
    List<Document> findByTypeIn(List<TypeDocument> types);
    List<Document> findByType(TypeDocument type);
    List<Document> findByDemandeStageId(Long demandeStageId);
}
