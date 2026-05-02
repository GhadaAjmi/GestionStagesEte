package com.enicar.projet.services.impl;

import com.enicar.projet.dtos.DemandeStageDTO;
import com.enicar.projet.entities.DemandeStage;
import com.enicar.projet.entities.Etudiant;
import com.enicar.projet.exceptions.NotFoundException;
import com.enicar.projet.repositories.DemandeStageRepository;
import com.enicar.projet.repositories.UtilisateurRepository;
import com.enicar.projet.services.interfaces.DemandeStageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DemandeStageServiceImpl implements DemandeStageService {

    private final DemandeStageRepository repository;
    private final UtilisateurRepository etudiantRepository;

    @Override
    public DemandeStageDTO save(DemandeStageDTO dto) {

        Etudiant etudiant = (Etudiant) etudiantRepository.findById(dto.getEtudiantId())
                .orElseThrow(() -> new NotFoundException("Etudiant introuvable"));

        // Chercher une demande existante pour cet étudiant
        Optional<DemandeStage> existante = repository.findByEtudiantId(dto.getEtudiantId());

        DemandeStage ds = existante.orElse(new DemandeStage());

        ds.setSujet(dto.getSujet());
        ds.setDateDebut(dto.getDateDebut());
        ds.setDateFin(dto.getDateFin());

        ds.setStatut(dto.getStatut());
        ds.setEtudiant(etudiant);

        // Seulement pour une nouvelle demande
        if (ds.getId() == null) {
            ds.setDateDemande(LocalDateTime.now());
        }

        DemandeStage saved = repository.save(ds);
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
        DemandeStage ds = repository.findByEtudiantId(id)
                .orElseThrow(() -> new NotFoundException("Demande introuvable pour cet etudiant"));
        return toDTO(ds);
    }


    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Demande introuvable");
        }
        repository.deleteById(id);
    }

    @Override
    public DemandeStageDTO update(Long id, DemandeStageDTO dto) {

        DemandeStage ds = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Demande introuvable"));

        Etudiant etudiant = (Etudiant) etudiantRepository.findById(dto.getEtudiantId())
                .orElseThrow(() -> new NotFoundException("Etudiant introuvable"));

        ds.setSujet(dto.getSujet());

        ds.setStatut(dto.getStatut());
        ds.setEntreprise(dto.getEntreprise());
        ds.setDateDebut(dto.getDateDebut());
        ds.setDateFin(dto.getDateFin());

        ds.setEtudiant(etudiant);

        DemandeStage updated = repository.save(ds);

        return toDTO(updated);
    }

    public static DemandeStageDTO toDTO(DemandeStage ds) {
        if (ds == null) return null;

        DemandeStageDTO dto = new DemandeStageDTO();
        dto.setId(ds.getId());
        dto.setSujet(ds.getSujet());
        dto.setDateDebut(ds.getDateDebut());

        dto.setDateFin(ds.getDateFin());

        dto.setStatut(ds.getStatut());
        dto.setDateDemande(ds.getDateDemande());
        dto.setEntreprise(ds.getEntreprise());
        if (ds.getEtudiant() != null) {
            dto.setEtudiantId(ds.getEtudiant().getId());
        }
        if (ds.getSoutenance() != null) {
            dto.setSoutenanceId(ds.getSoutenance().getId());
        }


        return dto;
    }
}