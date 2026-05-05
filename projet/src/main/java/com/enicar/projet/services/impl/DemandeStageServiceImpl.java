package com.enicar.projet.services.impl;

import com.enicar.projet.dtos.*;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import com.enicar.projet.entities.*;
import com.enicar.projet.exceptions.NotFoundException;
import com.enicar.projet.repositories.DemandeStageRepository;
import com.enicar.projet.repositories.EntrepriseRepository;
import com.enicar.projet.repositories.UtilisateurRepository;
import com.enicar.projet.services.interfaces.DemandeStageService;
import com.enicar.projet.services.interfaces.DocumentDemandeService;
import com.enicar.projet.services.interfaces.PdfService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@RequiredArgsConstructor
public class DemandeStageServiceImpl implements DemandeStageService {

    private final DemandeStageRepository repository;
    private final UtilisateurRepository etudiantRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final DemandeStageRepository demandeStageRepository;
    private final DocumentDemandeService documentService;

    private final PdfService pdfService;
    private static final Logger log =
            LogManager.getLogger(DemandeStageServiceImpl.class);

    @Override
    public DemandeStageDTO save(DemandeStageDTO dto) {
    	log.info("Création demande de stage pour étudiant id={}",
                dto.getEtudiantId());

        Etudiant etudiant = (Etudiant) etudiantRepository.findById(dto.getEtudiantId())
                .orElseThrow(() ->{
                    log.error("Etudiant introuvable id={}", dto.getEtudiantId());
                    return new NotFoundException("Etudiant introuvable");
                });

        
        Optional<DemandeStage> existante = repository.findByEtudiantId(dto.getEtudiantId());

        DemandeStage ds = existante.orElse(new DemandeStage());

        ds.setSujet(dto.getSujet());
        ds.setDateDebut(dto.getDateDebut());
        ds.setDateFin(dto.getDateFin());
        ds.setTuteurStage(dto.getTuteurStage());

        ds.setStatut(dto.getStatut());
        ds.setEtudiant(etudiant);

        
        if (ds.getId() == null) {
            ds.setDateDemande(LocalDateTime.now());
            log.info("Nouvelle demande créée pour étudiant id={}",
                    dto.getEtudiantId());
        }

        DemandeStage saved = repository.save(ds);
        log.info("Demande id={} sauvegardée avec statut={}",
                saved.getId(), saved.getStatut());
        return toDTO(saved);
    }

    @Override
    public List<DemandeStageDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(DemandeStageServiceImpl::toDTO)
                .toList();
    }

    @Override
    public DemandeStageDTO findById(Long id) {
        DemandeStage ds = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Demande introuvable"));
        return toDTO(ds);
    }
    @Override
    public DemandeStageDTO findByEtudiantId(Long id) {
    	log.debug("Recherche demande pour étudiant id={}", id);
        DemandeStage ds = repository.findByEtudiantId(id)
                .orElseThrow(() -> {
                    log.warn("Aucune demande pour étudiant id={}", id);
                    return new NotFoundException(
                        "Demande introuvable pour cet etudiant");
                });
        return toDTO(ds);
    }


    @Override
    public void delete(Long id) {
    	log.info("Suppression demande id={}", id);
        if (!repository.existsById(id)) {
        	log.error("Demande id={} introuvable pour suppression", id);
            throw new NotFoundException("Demande introuvable");
        }
        repository.deleteById(id);
        log.info("Demande id={} supprimée", id);
    }

    @Override
    public DemandeStageDTO update(Long id, DemandeStageDTO dto) {

        DemandeStage ds = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Demande introuvable"));

        Etudiant etudiant = (Etudiant) etudiantRepository.findById(dto.getEtudiantId())
                .orElseThrow(() -> {
                    log.error("Etudiant introuvable id={}", dto.getEtudiantId());
                    return new NotFoundException("Etudiant introuvable");
                });

        ds.setSujet(dto.getSujet());

        ds.setStatut(dto.getStatut());
        ds.setDateDebut(dto.getDateDebut());
        ds.setDateFin(dto.getDateFin());
        ds.setTuteurStage(dto.getTuteurStage());

        ds.setEtudiant(etudiant);

        DemandeStage updated = repository.save(ds);

        return toDTO(updated);
    }

    public static DemandeStageDTO toDTO(DemandeStage ds) {
        if (ds == null) return null;

        DemandeStageDTO dto = new DemandeStageDTO();
        dto.setTuteurStage(ds.getTuteurStage());

        dto.setId(ds.getId());
        dto.setSujet(ds.getSujet());
        dto.setStatut(ds.getStatut());
        dto.setDateDemande(ds.getDateDemande());
        dto.setDateDebut(ds.getDateDebut());
        dto.setDateFin(ds.getDateFin());
        dto.setAnneeUniversitaire(
                ds.getDateDemande() != null
                        ? String.valueOf(ds.getDateDemande().getYear())
                        : ""
        );
        
        if (ds.getEntreprise() != null) {
            dto.setEntreprise(ds.getEntreprise().getNom());
        } else {
            dto.setEntreprise(null);
        }

        if (ds.getEtudiant() != null) {
            dto.setEtudiantId(ds.getEtudiant().getId());
        }

        if (ds.getSoutenance() != null) {
            dto.setSoutenanceId(ds.getSoutenance().getId());
        }

        return dto;
    }

    @Override
    public DemandeStageDTO updateStatut(Long id, StatutDemande statut) {

        DemandeStage ds = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Demande introuvable"));

        ds.setStatut(statut);

        DemandeStage updated = repository.save(ds);

        return toDTO(updated);
    }
@Transactional
    @Override
    public byte[]  soumettreDemandeComplete(DemandeRequestDTO request) {

        // 1. Récupérer l'étudiant
        Etudiant etudiant = (Etudiant) etudiantRepository.findById(request.getEtudiantId())
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));

        // 2. Créer l'entreprise
        Entreprise entreprise = new Entreprise();
        entreprise.setNom(request.getEntreprise());
        entreprise.setAdresse(request.getAdresseEntreprise());
        entreprise.setRepresentant(request.getRepresentantEntreprise());
        entreprise.setEmail(request.getEmailEntreprise());
        entreprise.setTelephone(request.getTelephoneEntreprise());
        entreprise.setFax(request.getFaxEntreprise());

        entreprise = entrepriseRepository.save(entreprise);

        // 3. Créer la demande
        DemandeStage demande = new DemandeStage();
        demande.setSujet(request.getSujet());
        demande.setDateDebut(LocalDate.parse(request.getDateDebut()));
        demande.setDateFin(LocalDate.parse(request.getDateFin()));
        demande.setStatut(StatutDemande.SOUMISE);
        demande.setDateDemande(LocalDateTime.now());
        demande.setEtudiant(etudiant);
        demande.setEntreprise(entreprise);
        demande.setTuteurStage(request.getTuteurStage());
        demande = demandeStageRepository.save(demande);

        // 4. Préparer LettreRequestDTO
        LettreRequestDTO lettreDTO = new LettreRequestDTO();
        lettreDTO.setNomEtudiant(etudiant.getNom());
        lettreDTO.setPrenomEtudiant(etudiant.getPrenom());
        lettreDTO.setCin(etudiant.getCin());
        lettreDTO.setDateDelivranceCin(etudiant.getDateDelivranceCin());
        lettreDTO.setLieuDelivranceCin(etudiant.getLieuDelivranceCin());
        lettreDTO.setNiveau(etudiant.getNiveau());
        lettreDTO.setSpecialite(etudiant.getSpecialite());
        lettreDTO.setEntreprise(entreprise.getNom());
        lettreDTO.setDateDebut(formatDateFr(demande.getDateDebut()));
        lettreDTO.setDateFin(formatDateFr(demande.getDateFin()));

        // 5. Générer et enregistrer lettre
        byte[] lettrePdf;

        try {
            lettrePdf = pdfService.generateLettre(demande.getId(), lettreDTO);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Erreur lors de la génération de la lettre d'affectation pour la demande ID : "
                            + demande.getId(),
                    e
            );
        }

        // 6. Préparer ConventionRequestDTO
        ConventionRequestDTO conventionDTO = new ConventionRequestDTO();

        conventionDTO.setEntreprise(entreprise.getNom());
        conventionDTO.setAdresseEntreprise(entreprise.getAdresse());
        conventionDTO.setRepresentantEntreprise(entreprise.getRepresentant());
        conventionDTO.setTuteurStage(demande.getTuteurStage());
        conventionDTO.setEmailEntreprise(entreprise.getEmail());
        conventionDTO.setTelephoneEntreprise(entreprise.getTelephone());
        conventionDTO.setFaxEntreprise(entreprise.getFax());

        conventionDTO.setNomEtudiant(etudiant.getNom());
        conventionDTO.setPrenomEtudiant(etudiant.getPrenom());
        conventionDTO.setCin(etudiant.getCin());
        conventionDTO.setTelephone(etudiant.getTelephone());
        conventionDTO.setEmail(etudiant.getEmail());
        conventionDTO.setSpecialite(etudiant.getSpecialite());

        conventionDTO.setDateDebut(formatDateFr(demande.getDateDebut()));
        conventionDTO.setDateFin(formatDateFr(demande.getDateFin()));

        conventionDTO.setIng(isIngenieur(etudiant.getNiveau()));
        conventionDTO.setMastere(isMastere(etudiant.getNiveau()));

        conventionDTO.setInfo(isInfo(etudiant.getSpecialite()));
        conventionDTO.setElectrique(isElectrique(etudiant.getSpecialite()));
        conventionDTO.setIndus(isIndus(etudiant.getSpecialite()));

        conventionDTO.setPremiere(isPremiereAnnee(etudiant.getNiveau()));
        conventionDTO.setDeuxieme(isDeuxiemeAnnee(etudiant.getNiveau()));

      

        byte[] conventionPdf;
        try {
           conventionPdf =  pdfService.generateConvention(demande.getId(), conventionDTO);

        } catch (Exception e) {
            throw new RuntimeException(
                    "Erreur lors de la génération de la lettre de convetion pour la demande ID : "
                            + demande.getId(),
                    e
            );
        }

      
        return creerZipDocuments(lettrePdf, conventionPdf);

    }
    private byte[] creerZipDocuments(byte[] lettrePdf, byte[] conventionPdf) {
        try {
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();

            try (ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream)) {

                ZipEntry lettreEntry = new ZipEntry("lettre_affectation.pdf");
                zipOutputStream.putNextEntry(lettreEntry);
                zipOutputStream.write(lettrePdf);
                zipOutputStream.closeEntry();

                ZipEntry conventionEntry = new ZipEntry("convention.pdf");
                zipOutputStream.putNextEntry(conventionEntry);
                zipOutputStream.write(conventionPdf);
                zipOutputStream.closeEntry();
            }

            return byteArrayOutputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création du fichier ZIP", e);
        }
    }
    private String formatDateFr(LocalDate date) {
        if (date == null) {
            return "";
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return date.format(formatter);
    }

    private String formatDateFr(String date) {
        if (date == null || date.isBlank()) {
            return "";
        }

        LocalDate localDate = LocalDate.parse(date);
        return formatDateFr(localDate);
    }

    private boolean isMastere(String niveau) {
        if (niveau == null) return false;

        String value = niveau.toLowerCase();
        return value.contains("master") || value.contains("mastère");
    }

    private boolean isIngenieur(String niveau) {
        return !isMastere(niveau);
    }

    private boolean isInfo(String specialite) {
        if (specialite == null) return false;

        String value = specialite.toLowerCase();
        return value.contains("info") ||
                value.contains("informatique") ||
                value.contains("data") ||
                value.contains("logiciel");
    }

    private boolean isElectrique(String specialite) {
        if (specialite == null) return false;

        String value = specialite.toLowerCase();
        return value.contains("electrique") ||
                value.contains("électrique") ||
                value.contains("electronique") ||
                value.contains("électronique");
    }

    private boolean isIndus(String specialite) {
        if (specialite == null) return false;

        String value = specialite.toLowerCase();
        return value.contains("indus") ||
                value.contains("industriel");
    }

    private boolean isPremiereAnnee(String niveau) {
        if (niveau == null) return false;

        String value = niveau.toLowerCase();

        return value.equals("1")   ;
    }

    private boolean isDeuxiemeAnnee(String niveau) {
        if (niveau == null) return false;

        String value = niveau.toLowerCase();

        return value.equals("2") ;


    }
}