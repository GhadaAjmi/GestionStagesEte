package com.enicar.projet.services.interfaces;

import com.enicar.projet.dtos.DocumentDemandeDTO;
import com.enicar.projet.entities.TypeDocument;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface DocumentDemandeService {
    DocumentDemandeDTO ajouterDocument(Long demandeStageId, MultipartFile fichier,
                                       TypeDocument type) throws IOException;
    List<DocumentDemandeDTO> getDocumentsByDemande(Long demandeStageId);
    byte[] ouvrirDocument(Long id);
    byte[] telechargerDocument(Long id);
    DocumentDemandeDTO modifierDocument(Long id, MultipartFile fichier,
                                        TypeDocument type) throws IOException;
    void supprimerDocument(Long id);
    DocumentDemandeDTO getDocumentById(Long id) ;
    List<DocumentDemandeDTO> getDocumentsArchives();
    DocumentDemandeDTO refuserDocument(Long id, String motif) ;
    DocumentDemandeDTO validerDocument(Long id) ;


    }
