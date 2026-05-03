package com.enicar.projet.controllers;

import com.enicar.projet.dtos.ConventionRequestDTO;
import com.enicar.projet.dtos.LettreRequestDTO;
import com.enicar.projet.entities.Document;
import com.enicar.projet.services.interfaces.PdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pdf")
@RequiredArgsConstructor
@CrossOrigin("*")

public class PdfController {

    private final PdfService pdfService;

    // ----------------------------------------------------------------
    // LETTRE D'AFFECTATION
    // ----------------------------------------------------------------

    /**
     * Génère la lettre liée à une demande de stage et la sauvegarde en base.
     * POST /api/pdf/demande/{demandeId}/lettre-affectation
     * Retourne l'ID du DocumentDemande créé.
     */
    @PostMapping(value = "/demande/{demandeId}/lettre-affectation",
            consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Long> generateLettre(@PathVariable Long demandeId,
                                               @RequestBody LettreRequestDTO dto) throws Exception {
        Document doc = pdfService.generateLettre(demandeId, dto);
        return ResponseEntity.ok(doc.getId());
    }

    /**
     * Signe la lettre identifiée par {documentId}.
     * POST /api/pdf/lettre-affectation/{documentId}/signer
     * Retourne le PDF signé en téléchargement.
     */
    @PostMapping("/lettre-affectation/{documentId}/signer")
    public ResponseEntity<byte[]> signerLettre(@PathVariable Long documentId) throws Exception {
        byte[] pdfSigne = pdfService.signerLettre(documentId);
        return pdfResponse(pdfSigne, "lettre_affectation_signee.pdf");
    }

    // ----------------------------------------------------------------
    // CONVENTION
    // ----------------------------------------------------------------

    /**
     * Génère la convention liée à une demande de stage et la sauvegarde en base.
     * POST /api/pdf/demande/{demandeId}/convention
     * Retourne l'ID du DocumentDemande créé.
     */
    @PostMapping(value = "/demande/{demandeId}/convention",
            consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Long> generateConvention(@PathVariable Long demandeId,
                                                   @RequestBody ConventionRequestDTO dto) throws Exception {
        Document doc = pdfService.generateConvention(demandeId, dto);
        return ResponseEntity.ok(doc.getId());
    }
    @PostMapping(value = "/demande/{demandeId}/prolongation",
            consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Long> generateProlongation(@PathVariable Long demandeId,
                                                   @RequestBody ConventionRequestDTO dto) throws Exception {
        Document doc = pdfService.generateAvenant(demandeId);
        return ResponseEntity.ok(doc.getId());
    }

    /**
     * Signe la convention identifiée par {documentId}.
     * POST /api/pdf/convention/{documentId}/signer
     * Retourne le PDF signé en téléchargement.
     */
    @PostMapping("/convention/{documentId}/signer")
    public ResponseEntity<byte[]> signerConvention(@PathVariable Long documentId) throws Exception {
        byte[] pdfSigne = pdfService.signerConvention(documentId);
        return pdfResponse(pdfSigne, "convention_signee.pdf");
    }
    /**
     * Signe la convention identifiée par {documentId}.
     * POST /api/pdf/prolongation/{documentId}/signer
     * Retourne le PDF signé en téléchargement.
     */
    @PostMapping("/prolongation/{documentId}/signer")
    public ResponseEntity<byte[]> signerProlongation(@PathVariable Long documentId) throws Exception {
        byte[] pdfSigne = pdfService.signerProlongation(documentId);
        return pdfResponse(pdfSigne, "convention_signee.pdf");
    }

    // ----------------------------------------------------------------
    // Prévisualiser un document stocké en base
    // ----------------------------------------------------------------



    private ResponseEntity<byte[]> pdfResponse(byte[] content, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(content);
    }
}