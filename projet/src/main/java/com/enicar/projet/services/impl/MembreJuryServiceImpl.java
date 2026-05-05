package com.enicar.projet.services.impl;

import com.enicar.projet.dtos.MembreJuryDTO;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import com.enicar.projet.entities.Enseignant;
import com.enicar.projet.entities.MembreJury;
import com.enicar.projet.entities.Soutenance;
import com.enicar.projet.exceptions.BadRequestException;
import com.enicar.projet.exceptions.NotFoundException;
import com.enicar.projet.repositories.MembreJuryRepository;
import com.enicar.projet.repositories.SoutenanceRepository;
import com.enicar.projet.repositories.UtilisateurRepository;
import com.enicar.projet.services.interfaces.MembreJuryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MembreJuryServiceImpl implements MembreJuryService {
	private static final Logger log = LogManager.getLogger(MembreJuryServiceImpl.class);

    private final MembreJuryRepository repo;
    private final SoutenanceRepository soutenanceRepo;
    private final UtilisateurRepository enseignantRepo;

    @Override
    public MembreJuryDTO ajouter(MembreJuryDTO dto) {
    	log.info("Ajout membre jury - soutenanceId={}, enseignantId={}",
                dto.getSoutenanceId(), dto.getEnseignantId());

       
        if (repo.existsBySoutenanceIdAndEnseignantId(dto.getSoutenanceId(), dto.getEnseignantId())) {
            log.warn("Doublon détecté pour soutenanceId={} et enseignantId={}",
                    dto.getSoutenanceId(), dto.getEnseignantId());
            throw new BadRequestException("Enseignant déjà dans ce jury");
        }


        Soutenance soutenance = soutenanceRepo.findById(dto.getSoutenanceId())
                .orElseThrow(() -> {
                    log.error("Soutenance introuvable id={}", dto.getSoutenanceId());
                    return new NotFoundException("Soutenance introuvable");
                });

        Enseignant enseignant =(Enseignant) enseignantRepo.findById(dto.getEnseignantId())
                .orElseThrow(() -> {
                    log.error("Enseignant introuvable id={}", dto.getEnseignantId());
                    return new NotFoundException("Enseignant introuvable");
                });

        MembreJury m = new MembreJury();
        m.setSoutenance(soutenance);
        m.setEnseignant(enseignant);
        log.debug("Sauvegarde en cours...");

        return toDTO(repo.save(m));
    }

    @Override
    public MembreJuryDTO getById(Long id) {
        return toDTO(repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Membre introuvable")));
    }

    @Override
    public List<MembreJuryDTO> getAll() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    @Override
    public List<MembreJuryDTO> getBySoutenance(Long soutenanceId) {
        return repo.findBySoutenanceId(soutenanceId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public List<MembreJuryDTO> getByEnseignant(Long enseignantId) {
        return repo.findByEnseignantId(enseignantId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public void supprimer(Long id) {
    	log.info("Suppression membre jury id={}", id);
        if (!repo.existsById(id)) {
            log.error("Membre jury introuvable pour suppression id={}", id);
            throw new NotFoundException("Membre introuvable");
        }
        repo.deleteById(id);
        log.info("Membre jury supprimé id={}", id);
    }

   
    private MembreJuryDTO toDTO(MembreJury m) {
        return MembreJuryDTO.builder()
                .id(m.getId())
                .soutenanceId(m.getSoutenance().getId())
                .enseignantId(m.getEnseignant().getId())
                .nomEnseignant(m.getEnseignant().getNom())
                .prenomEnseignant(m.getEnseignant().getPrenom())

                .build();
    }
}