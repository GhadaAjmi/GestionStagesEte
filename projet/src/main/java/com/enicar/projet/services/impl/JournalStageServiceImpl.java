package com.enicar.projet.services.impl;


import com.enicar.projet.dtos.JournalStageDTO;
import com.enicar.projet.entities.DemandeStage;
import com.enicar.projet.entities.Journal;
import com.enicar.projet.repositories.DemandeStageRepository;
import com.enicar.projet.repositories.JournalStageRepository;
import com.enicar.projet.services.interfaces.JournalStageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JournalStageServiceImpl implements JournalStageService {

    private final JournalStageRepository journalRepo;
    private final DemandeStageRepository demandeRepo;

    // ── Mapper ────────────────────────────────────────────────────────────────

    private JournalStageDTO toDTO(Journal entity) {
        JournalStageDTO dto = new JournalStageDTO();
        dto.setId(entity.getId());
        dto.setDemandeStageId(entity.getDemandeStage().getId());
        dto.setDate(entity.getDate());
        dto.setActivitesEtObservations(entity.getActivitesEtObservations());
        dto.setCommentaireResponsable(entity.getCommentaireResponsable());
        dto.setVueResponsable(entity.isVueResponsable());
        dto.setValideResponsable(entity.isValideResponsable());
        return dto;
    }

    private Journal toEntity(JournalStageDTO dto, DemandeStage demande) {
        Journal entity = new Journal();
        entity.setDemandeStage(demande);
        entity.setDate(dto.getDate());
        entity.setActivitesEtObservations(dto.getActivitesEtObservations());
        entity.setCommentaireResponsable(dto.getCommentaireResponsable());
        entity.setVueResponsable(dto.isVueResponsable());
        entity.setValideResponsable(dto.isValideResponsable());
        return entity;
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @Override
    public List<JournalStageDTO> getByDemande(Long demandeId) {
        return journalRepo.findByDemandeStageIdOrderByDateDesc(demandeId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public JournalStageDTO getById(Long id) {
        return journalRepo.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Entrée journal introuvable : " + id));
    }

    @Override
    public JournalStageDTO create(JournalStageDTO dto) {
        DemandeStage demande = demandeRepo.findById(dto.getDemandeStageId())
                .orElseThrow(() -> new RuntimeException("Demande introuvable : " + dto.getDemandeStageId()));
        Journal entity = toEntity(dto, demande);
        return toDTO(journalRepo.save(entity));
    }

    @Override
    public JournalStageDTO update(Long id, JournalStageDTO dto) {
        Journal entity = journalRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Entrée journal introuvable : " + id));
        entity.setDate(dto.getDate());
        entity.setActivitesEtObservations(dto.getActivitesEtObservations());
        entity.setCommentaireResponsable(dto.getCommentaireResponsable());
        entity.setVueResponsable(dto.isVueResponsable());
        entity.setValideResponsable(dto.isValideResponsable());
        return toDTO(journalRepo.save(entity));
    }

    @Override
    public void delete(Long id) {
        journalRepo.deleteById(id);
    }

    // ── Actions métier ────────────────────────────────────────────────────────

    @Override
    public JournalStageDTO marquerVue(Long id) {
        Journal entity = journalRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Entrée journal introuvable : " + id));
        entity.setVueResponsable(true);
        return toDTO(journalRepo.save(entity));
    }

    @Override
    public JournalStageDTO commenter(Long id, String commentaire) {
        Journal entity = journalRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Entrée journal introuvable : " + id));
        entity.setValideResponsable(true);
        entity.setCommentaireResponsable(commentaire);
        return toDTO(journalRepo.save(entity));
    }
    @Override
    public JournalStageDTO valider(Long id) {
        Journal entity = journalRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Entrée journal introuvable : " + id));
        entity.setValideResponsable(true);
        return toDTO(journalRepo.save(entity));
    }
}