package com.enicar.projet.entities;

public enum StatutDemande {
    SOUMISE,   // formulaire rempli
    EN_ATTENTE_SIGNATURE, // conv+lettre signes de entreprise et deposes par etudiant
    VALIDEE,        // Responsable a validé la demande (conv+lettre signees)
    REFUSEE,        // Responsable a rejeté la demande (conv + lettre refusees)--> soumise
    EN_COURS,// Stage commencé, activités en cours
    PROLONGATION_DEMANDEE,// de "en cours" etudiant depose demande prolongation ,
    TERMINEE
}
