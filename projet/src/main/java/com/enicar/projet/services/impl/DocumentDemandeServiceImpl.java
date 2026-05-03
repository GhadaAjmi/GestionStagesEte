package com.enicar.projet.services.impl;

import com.enicar.projet.dtos.DocumentDemandeDTO;
import com.enicar.projet.entities.DemandeStage;
import com.enicar.projet.entities.Document;
import com.enicar.projet.entities.StatutDocument;
import com.enicar.projet.entities.TypeDocument;
import com.enicar.projet.exceptions.BadRequestException;
import com.enicar.projet.exceptions.NotFoundException;
import com.enicar.projet.repositories.DemandeStageRepository;
import com.enicar.projet.repositories.DocumentRepository;
import com.enicar.projet.services.interfaces.DocumentDemandeService;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentDemandeServiceImpl implements DocumentDemandeService {

    private final DocumentRepository documentRepo;
    private final DemandeStageRepository demandeStageRepo;

    @Override
    public DocumentDemandeDTO ajouterDocument(Long demandeStageId,
                                              MultipartFile fichier,
                                              TypeDocument type) throws IOException {
        DemandeStage demande = demandeStageRepo.findById(demandeStageId)
                .orElseThrow(() -> new  NotFoundException("Demande introuvable : " + demandeStageId));

        if (fichier == null || fichier.isEmpty())
            throw new BadRequestException("Fichier vide ou manquant");

        Document doc = new Document();
        doc.setType(type);
        doc.setNomFichier(fichier.getOriginalFilename());
        doc.setContenu(fichier.getBytes());
        doc.setDateDepot(LocalDateTime.now());

        doc.setDemandeStage(demande);
        doc.setStatut(StatutDocument.SOUMIS);


        return toDTO(documentRepo.save(doc));
    }
    @Override
    public List<DocumentDemandeDTO> getDocumentsArchives() {

        List<TypeDocument> typesArchives = List.of(
                TypeDocument.RAPPORT,
                TypeDocument.POSTER,
                TypeDocument.PRESENTATION
        );

        return documentRepo.findByTypeIn(typesArchives)
                .stream()
                .map(this::toDTO)
                .toList();
    }
    @Override
    public List<DocumentDemandeDTO> getDocumentsByDemande(Long demandeStageId) {
        return documentRepo.findByDemandeStageIdWithEtudiant(demandeStageId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public byte[] ouvrirDocument(Long id) {
        return documentRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Document introuvable : " + id))
                .getContenu();
    }

    @Override
    public byte[] telechargerDocument(Long id) {
        return documentRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Document introuvable : " + id))
                .getContenu();
    }

    @Override
    public DocumentDemandeDTO getDocumentById(Long id) {
        Document doc = documentRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Document introuvable : " + id));

        if (doc.getDemandeStage() != null && doc.getDemandeStage().getEtudiant() != null) {
            doc.getDemandeStage().getEtudiant().getNom();
        }

        return toDTO(doc);
    }

    @Override
    public DocumentDemandeDTO modifierDocument(Long id,
                                               MultipartFile fichier,
                                               TypeDocument type) throws IOException {
        Document doc = documentRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Document introuvable : " + id));

        if (type != null) doc.setType(type);

        if (fichier != null && !fichier.isEmpty()) {
            doc.setNomFichier(fichier.getOriginalFilename());
            doc.setContenu(fichier.getBytes());
            doc.setDateDepot(LocalDateTime.now());
        }

        return toDTO(documentRepo.save(doc));
    }

    @Override
    public void supprimerDocument(Long id) {
        if (!documentRepo.existsById(id))
            throw new NotFoundException("Document introuvable : " + id);

        documentRepo.deleteById(id);
    }

    private DocumentDemandeDTO toDTO(Document doc) {
        if (doc == null) return null;

        DemandeStage demande = doc.getDemandeStage();
        String nomEtudiant = null;
        String prenomEtudiant = null;

        if (demande != null && demande.getEtudiant() != null) {
            nomEtudiant = demande.getEtudiant().getNom();
            prenomEtudiant = demande.getEtudiant().getPrenom();
        }

        return DocumentDemandeDTO.builder()
                .id(doc.getId())
                .demandeStageId(demande != null ? demande.getId() : null)
                .sujetDemande(demande != null ? demande.getSujet() : null)

                .type(doc.getType())
                .motifRejet(doc.getMotifRejet())
                .nomFichier(doc.getNomFichier())
                .dateDepot(doc.getDateDepot())
                .dateDecision(doc.getDateDecision())
                .statut(doc.getStatut())
                .nomEtudiant(nomEtudiant)
                .prenomEtudiant(prenomEtudiant)
                .anneeDepot(doc.getDateDepot() != null ? doc.getDateDepot().getYear() : null)
                .build();
    }
    @Override
    public DocumentDemandeDTO refuserDocument(Long id, String motif) {

        Document doc = documentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable"));
        if (doc.getStatut() != StatutDocument.SOUMIS) {
            throw new RuntimeException("Seuls les documents soumis peuvent être rejetés");
        }
        doc.setStatut(StatutDocument.REJETE);
        doc.setMotifRejet(motif);
        doc.setDateDecision(LocalDateTime.now());

        return  toDTO(documentRepo.save(doc));
    }
    @Override
    public DocumentDemandeDTO validerDocument(Long id) {

        Document doc = documentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable"));
        if (doc.getStatut() != StatutDocument.SOUMIS) {
            throw new RuntimeException("Seuls les documents soumis peuvent être validès");
        }
        doc.setStatut(StatutDocument.VALIDE);
        doc.setDateDecision(LocalDateTime.now());

        return  toDTO(documentRepo.save(doc));
    }

}