package com.enicar.projet.services.impl;

import com.enicar.projet.entities.Salle;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import com.enicar.projet.entities.Soutenance;
import com.enicar.projet.exceptions.NotFoundException;
import com.enicar.projet.repositories.SalleRepository;
import com.enicar.projet.repositories.SoutenanceRepository;
import com.enicar.projet.services.interfaces.SalleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalleServiceImpl implements SalleService {
	private static final Logger log = LogManager.getLogger(SalleServiceImpl.class);

    private final SalleRepository repo;
    private final SoutenanceRepository soutenanceRepository;



    @Override
    public Salle save(Salle s) {
    	log.info("Sauvegarde d'une salle: code={}, localisation={}", s.getCode(), s.getLocalisation());
        return repo.save(s);
    }

    @Override
    public List<Salle> findAll() {
    	log.info("Récupération de toutes les salles");
        return repo.findAll();
    }

    @Override
    public Salle findById(Long id) {
    	log.info("Recherche de la salle id={}", id);
        return repo.findById(id)
                .orElseThrow(() ->  {
                    log.error("Salle introuvable id={}", id);
                    return new NotFoundException("Salle non trouvée avec l'id : " + id);
                });
    }

    @Override
    public void delete(Long id) {
    	 log.warn("Suppression de la salle id={}", id);

        if (!repo.existsById(id))  {
            log.error("Tentative de suppression d'une salle inexistante id={}", id);
            throw new NotFoundException("Salle non trouvée avec l'id : " + id);
        }
        repo.deleteById(id);
    }
    @Override
    public boolean verifierDisponibilite(Long salleId, LocalDate date, LocalTime heureDebut, int duree) {
    	log.info("Vérification disponibilité salleId={} date={} heureDebut={} durée={}",
                salleId, date, heureDebut, duree);
        return getConflits(salleId, date, heureDebut, duree).isEmpty();
    }

    @Override
    public List<String> getConflits(Long salleId, LocalDate date, LocalTime heureDebut, int duree) {
        List<Soutenance> soutenances = soutenanceRepository.findBySalleIdAndDate(salleId, date);
        List<String> conflits = new ArrayList<>();
        LocalTime heureFin = heureDebut.plusMinutes(duree);

        for (Soutenance s : soutenances) {
            LocalTime sDebut = LocalTime.parse(s.getHeureDebut());
            LocalTime sFin = sDebut.plusMinutes(s.getDuree());

            if (!(heureFin.isBefore(sDebut) || heureDebut.isAfter(sFin))) {
                conflits.add("Soutenance existante de " + sDebut + " à " + sFin);
            }
        }
        return conflits;
    }

    @Override
    public List<Salle> getSallesParLocalisation(String localisation) {
    	log.info("Recherche salles par localisation={}", localisation);
        return repo.findAll().stream()
                .filter(s -> s.getLocalisation().equalsIgnoreCase(localisation))
                .collect(Collectors.toList());
    }
}