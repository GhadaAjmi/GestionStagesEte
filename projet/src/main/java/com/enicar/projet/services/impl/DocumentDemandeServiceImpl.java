package com.enicar.projet.services.impl;

import com.enicar.projet.dtos.DocumentDemandeDTO;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
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
    private static final Logger log = LogManager.getLogger(DocumentDemandeServiceImpl.class);

    @Override
    public DocumentDemandeDTO ajouterDocument(Long demandeStageId,
                                              MultipartFile fichier,
                                              TypeDocument type) throws IOException {
    	log.info("Ajout document — demandeId={}, type={}, fichier={}",
                demandeStageId, type,
                fichier != null ? fichier.getOriginalFilename() : "null");
        DemandeStage demande = demandeStageRepo.findById(demandeStageId)
                .orElseThrow(() -> {
                    log.error("Demande introuvable pour ajout document — id={}", demandeStageId);
                    return new NotFoundException("Demande introuvable : " + demandeStageId);
                });


        if (fichier == null || fichier.isEmpty())
        {
            log.warn("Fichier vide ou manquant — demandeId={}", demandeStageId);
            throw new BadRequestException("Fichier vide ou manquant");
        }

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
    	log.debug("Récupération des documents archives (RAPPORT, POSTER, PRESENTATION)");

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
    	log.debug("Récupération des documents — demandeId={}", demandeStageId);
        return documentRepo.findByDemandeStageIdWithEtudiant(demandeStageId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public byte[] ouvrirDocument(Long id) {
    	log.info("Ouverture document — id={}", id);
        return documentRepo.findById(id)
                .orElseThrow(() -> {
                    log.error("Document introuvable pour ouverture — id={}", id);
                    return new NotFoundException("Document introuvable : " + id);
                })
                .getContenu();
    }

    @Override
    public byte[] telechargerDocument(Long id) {
    	log.info("Téléchargement document — id={}", id);
        return documentRepo.findById(id)
                .orElseThrow(() -> {
                    log.error("Document introuvable pour téléchargement — id={}", id);
                    return new NotFoundException("Document introuvable : " + id);
                })
                .getContenu();
    }

    @Override
    public DocumentDemandeDTO getDocumentById(Long id) {
    	log.debug("Récupération document par id — id={}", id);
        Document doc = documentRepo.findById(id)
                .orElseThrow(() ->{
                    log.error("Document introuvable — id={}", id);
                    return new NotFoundException("Document introuvable : " + id);
                });


        if (doc.getDemandeStage() != null && doc.getDemandeStage().getEtudiant() != null) {
            doc.getDemandeStage().getEtudiant().getNom();
        }

        return toDTO(doc);
    }

    @Override
    public DocumentDemandeDTO modifierDocument(Long id,
                                               MultipartFile fichier,
                                               TypeDocument type) throws IOException {
    	log.info("Modification document — id={}, nouveauType={}, nouveauFichier={}",
                id, type, fichier != null ? fichier.getOriginalFilename() : "inchangé");
        Document doc = documentRepo.findById(id)
                .orElseThrow(() -> {
                    log.error("Document introuvable pour modification — id={}", id);
                    return new NotFoundException("Document introuvable : " + id);
                });

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
    	log.info("Suppression document — id={}", id);
        if (!documentRepo.existsById(id))
        {
            log.error("Document introuvable pour suppression — id={}", id);
            throw new NotFoundException("Document introuvable : " + id);
        }


        documentRepo.deleteById(id);
        log.info("Document supprimé avec succès — id={}", id);
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
    	log.info("Validation document — id={}", id);

        Document doc = documentRepo.findById(id)
                .orElseThrow(() -> {
                    log.error("Document introuvable pour validation — id={}", id);
                    return new RuntimeException("Document introuvable");
                });
        if (doc.getStatut() != StatutDocument.SOUMIS) {
        	log.warn("Tentative de validation sur document non soumis — id={}, statut={}", id, doc.getStatut());
            throw new RuntimeException("Seuls les documents soumis peuvent être validès");
        }
        doc.setStatut(StatutDocument.VALIDE);
        doc.setDateDecision(LocalDateTime.now());
        log.info("Document validé avec succès — id={}", id);

        return  toDTO(documentRepo.save(doc));
    }

}