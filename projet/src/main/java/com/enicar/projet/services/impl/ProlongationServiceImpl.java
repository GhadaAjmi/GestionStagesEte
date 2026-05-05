package com.enicar.projet.services.impl;

import com.enicar.projet.dtos.ProlongationDTO;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import com.enicar.projet.entities.DemandeStage;
import com.enicar.projet.entities.Prolongation;
import com.enicar.projet.entities.StatutProlongation;
import com.enicar.projet.repositories.DemandeStageRepository;
import com.enicar.projet.repositories.ProlongationRepository;
import com.enicar.projet.services.interfaces.ProlongationService;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProlongationServiceImpl implements ProlongationService {
	private static final Logger log = LogManager.getLogger(ProlongationServiceImpl.class);

    private final ProlongationRepository prolongationRepository;
    private final DemandeStageRepository demandeRepository;

    // ── Conversion entité → DTO ──────────────────────────────────────────────
    private ProlongationDTO toDTO(Prolongation p) {
        if (p == null) {
            log.warn("Tentative de conversion d'une prolongation null");
            return null;
        }

        ProlongationDTO dto = new ProlongationDTO();
        dto.setId(p.getId());

        if (p.getDemandeStage() != null) {
            dto.setDemandeStageId(p.getDemandeStage().getId());

        }

        dto.setStatut(p.getStatut() != null ? p.getStatut().name() : null);
        dto.setDateFinProlongee(p.getDateFinProlongee());
        dto.setDateSoumission(p.getDateSoumission());

        return dto;
    }

    // ── Demander une prolongation ─────────────────────────────────────────────
    @Override
    public ProlongationDTO demanderProlongation(Long demandeId, LocalDate dateFinProlongee) {
    	log.info("Demande de prolongation pour demandeId={}", demandeId);
        DemandeStage demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> {
                    log.error("Demande non trouvée avec id={}", demandeId);
                    return new RuntimeException("Demande non trouvée");
                });

        if (prolongationRepository.existsByDemandeStage(demande)){
            log.warn("Une prolongation existe déjà pour demandeId={}", demandeId);
            throw new RuntimeException("Une prolongation existe déjà pour cette demande");
        }


        Prolongation p = new Prolongation();
        p.setDemandeStage(demande);
        p.setDateFinProlongee(dateFinProlongee);
        p.setDateSoumission(LocalDate.now());
        p.setStatut(StatutProlongation.EN_ATTENTE);

        Prolongation saved = prolongationRepository.save(p);
        log.info("Prolongation créée avec id={}", saved.getId());

        // ← Lier la prolongation à la demande
        demande.setProlongation(saved);
        demandeRepository.save(demande);   // ← met à jour prolongation_id

        return toDTO(saved);
    }
    // ── Approuver une prolongation ────────────────────────────────────────────
    @Override
    public ProlongationDTO approuver(Long id) {
    	log.info("Approbation de la prolongation id={}", id);
        Prolongation p = prolongationRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Prolongation non trouvée id={}", id);
                    return new RuntimeException("Prolongation non trouvée");
                });

        p.setStatut(StatutProlongation.APPROUVEE);

        // Mise à jour de la date de fin du stage
        DemandeStage d = p.getDemandeStage();
        d.setDateFin(p.getDateFinProlongee());

        return toDTO(prolongationRepository.save(p));
    }

    // ── Refuser une prolongation ──────────────────────────────────────────────
    @Override
    public ProlongationDTO refuser(Long id) {
    	log.info("Refus de la prolongation id={}", id);
        Prolongation p = prolongationRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Prolongation non trouvée id={}", id);
                    return new RuntimeException("Prolongation non trouvée");
                });

        p.setStatut(StatutProlongation.REFUSEE);

        return toDTO(prolongationRepository.save(p));
    }

    // ── Obtenir prolongation par demande ──────────────────────────────────────
    @Override
    public ProlongationDTO getByDemande(Long demandeId) {
    	log.info("Recherche prolongation pour demandeId={}", demandeId);
        DemandeStage demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> {
                    log.error("Demande non trouvée id={}", demandeId);
                    return new RuntimeException("Demande non trouvée");
                });

        Prolongation p = prolongationRepository.findByDemandeStage(demande)
                .orElseThrow(() ->{
                    log.warn("Aucune prolongation trouvée pour demandeId={}", demandeId);
                    return new RuntimeException("Aucune prolongation trouvée");
                });

        return toDTO(p);
    }

    // ── Obtenir toutes les prolongations ──────────────────────────────────────
    @Override
    public List<ProlongationDTO> getAll() {
    	 log.info("Récupération de toutes les prolongations");
    	
        return prolongationRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}