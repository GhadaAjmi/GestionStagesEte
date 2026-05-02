package com.enicar.projet.services.interfaces;


import com.enicar.projet.entities.Salle;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface SalleService {
    Salle save(Salle s);
    List<Salle> findAll();
    Salle findById(Long id);
    void delete(Long id);
    boolean verifierDisponibilite(Long salleId, LocalDate date, LocalTime heureDebut, int duree);
    List<String> getConflits(Long salleId, LocalDate date, LocalTime heureDebut, int duree);
    List<Salle> getSallesParLocalisation(String localisation);
}
