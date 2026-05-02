package com.enicar.projet.services.impl;

import com.enicar.projet.dtos.ChangePasswordRequest;
import com.enicar.projet.dtos.UtilisateurDTO;
import com.enicar.projet.entities.*;
import com.enicar.projet.exceptions.BadRequestException;
import com.enicar.projet.exceptions.NotFoundException;
import com.enicar.projet.repositories.MembreJuryRepository;
import com.enicar.projet.repositories.UtilisateurRepository;
import com.enicar.projet.services.interfaces.UtilisateurService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UtilisateurServiceImpl implements UtilisateurService {
    private final MembreJuryRepository juryRepository;

    private final UtilisateurRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Utilisateur save(Utilisateur utilisateur) {

        if (utilisateur.getMotDePasse() != null
                && !utilisateur.getMotDePasse().isBlank()
                && !utilisateur.getMotDePasse().startsWith("$2")) {
            utilisateur.setMotDePasse(passwordEncoder.encode(utilisateur.getMotDePasse()));
        }

        return repository.save(utilisateur);
    }

    @Override
    public List<UtilisateurDTO> findAll() {
        return repository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public Utilisateur findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));
    }

    @Override
    public UtilisateurDTO findId(Long id) {
        return mapToDTO(findById(id));
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    // ================= CREATE =================
    @Override
    public UtilisateurDTO createUtilisateur(UtilisateurDTO dto) {

        if (dto.getRole() == null || dto.getRole().isBlank())
            throw new BadRequestException("Le champ 'role' est obligatoire");

        Utilisateur user = switch (dto.getRole().toUpperCase()) {

            case "ETUDIANT" -> {
                Etudiant etu = new Etudiant();
                mapBase(dto, etu);
                etu.setNiveau(dto.getNiveau());
                etu.setSpecialite(dto.getSpecialite());
                etu.setGroupe(dto.getGroupe());
                yield etu;
            }

            case "ENSEIGNANT" -> {
                Enseignant ens = new Enseignant();
                mapBase(dto, ens);
                ens.setGrade(dto.getGrade());
                ens.setDomaine(dto.getDomaine());
                yield ens;
            }

            case "CHEF_DEPARTEMENT" -> {
                ChefDepartement chef = new ChefDepartement();
                mapBase(dto, chef);
                chef.setGrade(dto.getGrade());
                chef.setDomaine(dto.getDomaine());
                yield chef;
            }

            case "ADMIN" -> {
                Admin admin = new Admin();
                mapBase(dto, admin);
                yield admin;
            }

            case "RESPONSABLE" -> {
                Responsable r = new Responsable();
                mapBase(dto, r);
                yield r;
            }

            case "SERVICE_STAGE" -> {
                ServiceStage ss = new ServiceStage();
                mapBase(dto, ss);
                yield ss;
            }

            default -> throw new BadRequestException("Rôle invalide : " + dto.getRole());
        };

        return mapToDTO(save(user));
    }

    // ================= UPDATE =================
    @Override
    public Utilisateur update(Utilisateur utilisateur) {

        Utilisateur existing = repository.findById(utilisateur.getId())
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        existing.setNom(utilisateur.getNom());
        existing.setPrenom(utilisateur.getPrenom());
        existing.setActif(utilisateur.getActif());
        existing.setDepartement(utilisateur.getDepartement());

        if (existing instanceof Etudiant etu && utilisateur instanceof Etudiant u) {
            etu.setNiveau(u.getNiveau());
            etu.setSpecialite(u.getSpecialite());
            etu.setGroupe(u.getGroupe());
        }

        if (existing instanceof ChefDepartement chef && utilisateur instanceof ChefDepartement u) {
            chef.setGrade(u.getGrade());
            chef.setDomaine(u.getDomaine());
        }

        if (existing instanceof Enseignant ens && utilisateur instanceof Enseignant u) {
            ens.setGrade(u.getGrade());
            ens.setDomaine(u.getDomaine());
        }

        return repository.save(existing);
    }

    // ================= PASSWORD =================
    @Override
    public void changePassword(Long userId, ChangePasswordRequest request) {

        Utilisateur user = repository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(request.getAncienMotDePasse(), user.getMotDePasse()))
            throw new BadRequestException("Ancien mot de passe incorrect");

        if (!request.getNouveauMotDePasse().equals(request.getConfirmationMotDePasse()))
            throw new BadRequestException("Confirmation incorrecte");

        user.setMotDePasse(passwordEncoder.encode(request.getNouveauMotDePasse()));
        repository.save(user);
    }
    // =========================================================
    // FIND BY ROLE
    // =========================================================
    @Override
    public List<UtilisateurDTO> findByRole(RoleUtilisateur role) {
        return repository.findByRole(role).stream()
                .map(this::mapToDTO)
                .toList();
    }

    // =========================================================
    // FILTER METHODS
    // =========================================================
    @Override
    public List<String> getDepartements() {
        return repository.findDepartements();
    }

    @Override
    public List<String> getNiveaux(String departement, String specialite) {
        return repository.findNiveaux(departement, specialite);
    }

    @Override
    public List<String> getSpecialites(String departement, String niveau) {
        return repository.findSpecialites(departement, niveau);
    }

    @Override
    public List<String> getGroupes(String departement, String specialite, String niveau) {
        return repository.findGroupes(departement, specialite, niveau);
    }

    @Override
    public List<UtilisateurDTO> getEtudiantsByFiltre(String departement,
                                                     String specialite,
                                                     String niveau,
                                                     String groupe) {

        return repository.findByFiltre(departement, specialite, niveau, groupe)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<UtilisateurDTO> getEtudiantsSansSoutenance(String departement,
                                                           String specialite,
                                                           String niveau) {

        return repository.findEtudiantsSansSoutenance(departement, specialite, niveau)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }
    @Override
    public List<UtilisateurDTO> getEnseignantsDisponibles(
            String departement,
            LocalDate date,
            LocalTime heureDebut,
            Integer duree
    ) {
        List<Enseignant> enseignants =
                repository.findEnseignantsByDepartement(departement);

        boolean avecVerificationCreneau =
                date != null &&
                        heureDebut != null &&
                        duree != null &&
                        duree > 0;


        if (!avecVerificationCreneau) {
            return enseignants.stream()
                    .map(this::mapToDTO)
                    .toList();
        }

        LocalTime heureFin = heureDebut.plusMinutes(duree);

        return enseignants.stream()
                .filter(enseignant -> {
                    List<Soutenance> soutenances =
                            juryRepository.findSoutenancesByEnseignantAndDate(
                                    enseignant.getId(),
                                    date
                            );

                    return soutenances.stream().noneMatch(s -> {
                        LocalTime sDebut = LocalTime.parse(s.getHeureDebut());
                        LocalTime sFin = sDebut.plusMinutes(s.getDuree());

                        return heureDebut.isBefore(sFin) && heureFin.isAfter(sDebut);
                    });
                })
                .map(this::mapToDTO)
                .toList();
    }
    // ================= MAPPING =================
    private void mapBase(UtilisateurDTO dto, Utilisateur user) {
        user.setCin(dto.getCin());
        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setEmail(dto.getEmail());
        user.setMotDePasse(dto.getMotDePasse());
        user.setActif(dto.getActif() != null ? dto.getActif() : true);
        user.setDepartement(dto.getDepartement());
    }

    public UtilisateurDTO mapToDTO(Utilisateur user) {

        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId(user.getId());
        dto.setCin(user.getCin());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setEmail(user.getEmail());
        dto.setActif(user.getActif());
        System.out.println("Departement = " + (user != null ? user.getDepartement() : null));

        dto.setDepartement(user.getDepartement());

        if (user instanceof Etudiant e) {
            dto.setRole("ETUDIANT");
            dto.setNiveau(e.getNiveau());
            dto.setSpecialite(e.getSpecialite());
            dto.setGroupe(e.getGroupe());
        }

        if (user instanceof Enseignant e) {
            dto.setRole("ENSEIGNANT");
            dto.setGrade(e.getGrade());
            dto.setDomaine(e.getDomaine());
        }

        if (user instanceof ChefDepartement c) {
            dto.setRole("CHEF_DEPARTEMENT");
            dto.setGrade(c.getGrade());
            dto.setDomaine(c.getDomaine());
        }

        if (user instanceof Admin) dto.setRole("ADMIN");
        if (user instanceof Responsable) dto.setRole("RESPONSABLE");
        if (user instanceof ServiceStage) dto.setRole("SERVICE_STAGE");

        return dto;
    }

}