package com.enicar.projet.services.interfaces;

import com.enicar.projet.dtos.ConventionRequestDTO;
import com.enicar.projet.dtos.LettreRequestDTO;
import com.enicar.projet.entities.Document;

public interface PdfService {

    // ── Lettre d'affectation ──────────────────────────────────────────

    /**
     * Génère la lettre d'affectation à partir des données du DTO,
     * la sauvegarde en base liée à la demande de stage,
     * et retourne l'entité Document créée (statut GENERE, sans signature).
     */
    Document generateLettre(Long demandeStageId, LettreRequestDTO dto) throws Exception;

    /**
     * Récupère la lettre en base par son id,
     * y appose le bloc signature + cachet,
     * met à jour le statut à VALIDE et retourne le PDF signé en bytes.
     */
    byte[] signerLettre(Long documentId) throws Exception;

    byte[] signerProlongation(Long documentId) throws Exception;

    // ── Convention de stage ───────────────────────────────────────────

    /**
     * Génère la convention de stage à partir des données du DTO,
     * la sauvegarde en base liée à la demande de stage,
     * et retourne l'entité Document créée (statut GENERE, sans signature).
     */
    Document generateConvention(Long demandeStageId, ConventionRequestDTO dto) throws Exception;

    /**
     * Récupère la convention en base par son id,
     * y appose le bloc signature + cachet,
     * met à jour le statut à VALIDE et retourne le PDF signé en bytes.
     */
    byte[] signerConvention(Long documentId) throws Exception;

    Document generateAvenant(Long demandeStageId) throws Exception;
}