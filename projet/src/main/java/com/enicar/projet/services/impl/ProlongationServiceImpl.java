package com.enicar.projet.services.impl;

import com.enicar.projet.dtos.ProlongationDTO;
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

    private final ProlongationRepository prolongationRepository;
    private final DemandeStageRepository demandeRepository;

    // ── Conversion entité → DTO ──────────────────────────────────────────────
    private ProlongationDTO toDTO(Prolongation p) {
        if (p == null) return null;

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
        DemandeStage demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (prolongationRepository.existsByDemandeStage(demande)) {
            throw new RuntimeException("Une prolongation existe déjà pour cette demande");
        }

        Prolongation p = new Prolongation();
        p.setDemandeStage(demande);
        p.setDateFinProlongee(dateFinProlongee);
        p.setDateSoumission(LocalDate.now());
        p.setStatut(StatutProlongation.EN_ATTENTE);

        return toDTO(prolongationRepository.save(p));
    }

    // ── Approuver une prolongation ────────────────────────────────────────────
    @Override
    public ProlongationDTO approuver(Long id) {
        Prolongation p = prolongationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prolongation non trouvée"));

        p.setStatut(StatutProlongation.APPROUVEE);

        // Mise à jour de la date de fin du stage
        DemandeStage d = p.getDemandeStage();
        d.setDateFin(p.getDateFinProlongee());

        return toDTO(prolongationRepository.save(p));
    }

    // ── Refuser une prolongation ──────────────────────────────────────────────
    @Override
    public ProlongationDTO refuser(Long id) {
        Prolongation p = prolongationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prolongation non trouvée"));

        p.setStatut(StatutProlongation.REFUSEE);

        return toDTO(prolongationRepository.save(p));
    }

    // ── Obtenir prolongation par demande ──────────────────────────────────────
    @Override
    public ProlongationDTO getByDemande(Long demandeId) {
        DemandeStage demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        Prolongation p = prolongationRepository.findByDemandeStage(demande)
                .orElseThrow(() -> new RuntimeException("Aucune prolongation trouvée"));

        return toDTO(p);
    }

    // ── Obtenir toutes les prolongations ──────────────────────────────────────
    @Override
    public List<ProlongationDTO> getAll() {
        return prolongationRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}