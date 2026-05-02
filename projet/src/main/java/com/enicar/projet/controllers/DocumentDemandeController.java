package com.enicar.projet.controllers;

import com.enicar.projet.dtos.DocumentDemandeDTO;
import com.enicar.projet.entities.TypeDocument;
import com.enicar.projet.services.interfaces.DocumentDemandeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("api/documents")
@RequiredArgsConstructor
@CrossOrigin("*")

public class DocumentDemandeController {

    private final DocumentDemandeService service;

    // ✅ POST : Ajouter document
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentDemandeDTO ajouter(
            @RequestParam Long demandeStageId,
            @RequestParam MultipartFile fichier,
            @RequestParam TypeDocument type
    ) throws IOException {

        return service.ajouterDocument(demandeStageId, fichier, type);
    }

    // ✅ GET : documents d'une demande
    @GetMapping("/demande/{id}")
    public List<DocumentDemandeDTO> getByDemande(@PathVariable Long id) {
        return service.getDocumentsByDemande(id);
    }

    @GetMapping("/archives")
    public List<DocumentDemandeDTO> getDocumentsArchives() {
        return service.getDocumentsArchives();
    }
    // ✅ GET : document par id
    @GetMapping("/{id}")
    public DocumentDemandeDTO getById(@PathVariable Long id) {
        return service.getDocumentById(id);
    }

    // ✅ GET : ouvrir document (affichage navigateur)
    @GetMapping("/ouvrir/{id}")
    public ResponseEntity<byte[]> ouvrir(@PathVariable Long id) {

        byte[] data = service.ouvrirDocument(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    // ✅ GET : télécharger document
    @GetMapping("/telecharger/{id}")
    public ResponseEntity<byte[]> telecharger(@PathVariable Long id) {

        byte[] data = service.telechargerDocument(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=document")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    // ✅ PUT : modifier document
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentDemandeDTO modifier(
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile fichier,
            @RequestParam(required = false) TypeDocument type
    ) throws IOException {

        return service.modifierDocument(id, fichier, type);
    }
    @PutMapping(value = "/refuser/{id}")
    public DocumentDemandeDTO refuser(
            @PathVariable Long id,
            @RequestParam(required = false) String motif
    ) throws IOException {

        return service.refuserDocument(id, motif);
    }
    @PutMapping(value = "/valider/{id}")
    public DocumentDemandeDTO valider(
            @PathVariable Long id
    ) throws IOException {

        return service.validerDocument(id);
    }


    // ✅ DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.supprimerDocument(id);
    }

}
