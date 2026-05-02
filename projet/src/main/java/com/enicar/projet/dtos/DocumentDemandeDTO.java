package com.enicar.projet.dtos;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;
import net.enicar.gestionsoutenances.entities.StatutDocument;
import net.enicar.gestionsoutenances.entities.TypeDocumentDemande;

@Data
@Builder
public class DocumentDemandeDTO {

    private Long id;
    private Long demandeStageId;

    // Infos de la demande
    private String sujetDemande;
    private String typeDemande;

    // Infos du document
    private TypeDocumentDemande type;
    private String nomFichier;
    private String motifRejet;
    private LocalDateTime dateDepot;
    private LocalDateTime dateDecision;

    private StatutDocument statut;


    // Infos de l’étudiant
    private String nomEtudiant;
    private String prenomEtudiant;

    // Année du dépôt
    private Integer anneeDepot;

}