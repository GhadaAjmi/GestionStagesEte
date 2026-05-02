package com.enicar.projet.entities;

public enum StatutDocument {
    GENERE,   // Créé par le système, en attente de dépôt
    SOUMIS,   // Déposé par l'étudiant (inclut l'idée qu'il est signé)
    VALIDE,   // Accepté par le responsable
    REJETE    // Refusé, à corriger et redéposer
}