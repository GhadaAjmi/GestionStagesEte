package com.enicar.projet.services.impl;

import com.enicar.projet.entities.Salle;
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

    private final SalleRepository repo;
    private final SoutenanceRepository soutenanceRepository;



    @Override
    public Salle save(Salle s) {
        return repo.save(s);
    }

    @Override
    public List<Salle> findAll() {
        return repo.findAll();
    }

    @Override
    public Salle findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Salle non trouvée avec l'id : " + id));
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new NotFoundException("Salle non trouvée avec l'id : " + id);
        }
        repo.deleteById(id);
    }
    @Override
    public boolean verifierDisponibilite(Long salleId, LocalDate date, LocalTime heureDebut, int duree) {
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
        return repo.findAll().stream()
                .filter(s -> s.getLocalisation().equalsIgnoreCase(localisation))
                .collect(Collectors.toList());
    }
}