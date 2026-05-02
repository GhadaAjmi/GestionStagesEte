package com.enicar.projet.dtos;

import java.time.LocalDateTime;

import com.enicar.projet.entities.StatutDocument;
import com.enicar.projet.entities.TypeDocument;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentDemandeDTO {

    private Long id;
    private Long demandeStageId;

    // Infos de la demande
    private String sujetDemande;
    private String typeDemande;

    // Infos du document
    private TypeDocument type;
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