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

    private final UtilisateurRepository repository;
    private final MembreJuryRepository juryRepository;
    private final PasswordEncoder passwordEncoder;

    // =========================================================
    // SAVE
    // =========================================================
    @Override
    public Utilisateur save(Utilisateur utilisateur) {

        if (utilisateur.getMotDePasse() != null
                && !utilisateur.getMotDePasse().isBlank()
                && !utilisateur.getMotDePasse().startsWith("$2")) {
            utilisateur.setMotDePasse(passwordEncoder.encode(utilisateur.getMotDePasse()));
        }

        return repository.save(utilisateur);
    }

    // =========================================================
    // FIND ALL
    // =========================================================
    @Override
    public List<UtilisateurDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // =========================================================
    // FIND BY ID ENTITY
    // =========================================================
    @Override
    public Utilisateur findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé avec id : " + id));
    }

    // =========================================================
    // FIND BY ID DTO
    // =========================================================
    @Override
    public UtilisateurDTO findId(Long id) {
        return mapToDTO(findById(id));
    }

    // =========================================================
    // DELETE
    // =========================================================
    @Override
    public void delete(Long id) {
        Utilisateur utilisateur = findById(id);
        repository.delete(utilisateur);
    }

    // =========================================================
    // CREATE FROM DTO
    // =========================================================
    @Override
    public UtilisateurDTO createUtilisateur(UtilisateurDTO dto) {

        RoleUtilisateur role = parseRole(dto.getRole());

        Utilisateur user = createEntityByRole(role);

        mapBaseFromDTO(dto, user, true);
        mapSpecificFieldsFromDTO(dto, user);

        Utilisateur saved = save(user);
        return mapToDTO(saved);
    }

    // =========================================================
    // UPDATE ENTITY
    // =========================================================
    @Override
    public Utilisateur update(Utilisateur utilisateur) {

        if (utilisateur.getId() == null) {
            throw new BadRequestException("L'id de l'utilisateur est obligatoire pour la mise à jour");
        }

        Utilisateur existing = findById(utilisateur.getId());

        existing.setCin(utilisateur.getCin());
        existing.setNom(utilisateur.getNom());
        existing.setPrenom(utilisateur.getPrenom());
        existing.setEmail(utilisateur.getEmail());
        existing.setActif(utilisateur.getActif());
        existing.setDepartement(utilisateur.getDepartement());
        existing.setTelephone(utilisateur.getTelephone());
        existing.setLieuDelivranceCin(utilisateur.getLieuDelivranceCin());
        existing.setDateDelivranceCin(utilisateur.getDateDelivranceCin());

        if (utilisateur.getMotDePasse() != null && !utilisateur.getMotDePasse().isBlank()) {
            existing.setMotDePasse(passwordEncoder.encode(utilisateur.getMotDePasse()));
        }

        if (existing instanceof Etudiant existingEtudiant && utilisateur instanceof Etudiant newEtudiant) {
            existingEtudiant.setNiveau(newEtudiant.getNiveau());
            existingEtudiant.setSpecialite(newEtudiant.getSpecialite());
            existingEtudiant.setGroupe(newEtudiant.getGroupe());
            existingEtudiant.setNumeroInscription(newEtudiant.getNumeroInscription());
        }

        if (existing instanceof Enseignant existingEnseignant && utilisateur instanceof Enseignant newEnseignant) {
            existingEnseignant.setGrade(newEnseignant.getGrade());
            existingEnseignant.setDomaine(newEnseignant.getDomaine());
        }

        return repository.save(existing);
    }

    // =========================================================
    // UPDATE FROM DTO
    // =========================================================
    public UtilisateurDTO updateUtilisateur(Long id, UtilisateurDTO dto) {

        Utilisateur existing = findById(id);

        mapBaseFromDTO(dto, existing, false);
        mapSpecificFieldsFromDTO(dto, existing);

        Utilisateur saved = save(existing);
        return mapToDTO(saved);
    }

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================
    @Override
    public void changePassword(Long userId, ChangePasswordRequest request) {

        Utilisateur user = findById(userId);

        if (!passwordEncoder.matches(request.getAncienMotDePasse(), user.getMotDePasse())) {
            throw new BadRequestException("Ancien mot de passe incorrect");
        }

        if (!request.getNouveauMotDePasse().equals(request.getConfirmationMotDePasse())) {
            throw new BadRequestException("Confirmation du mot de passe incorrecte");
        }

        user.setMotDePasse(passwordEncoder.encode(request.getNouveauMotDePasse()));
        repository.save(user);
    }

    // =========================================================
    // FIND BY ROLE
    // =========================================================
    @Override
    public List<UtilisateurDTO> findByRole(RoleUtilisateur role) {
        return repository.findByRole(role)
                .stream()
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

    // =========================================================
    // ENSEIGNANTS DISPONIBLES
    // =========================================================
    @Override
    public List<UtilisateurDTO> getEnseignantsDisponibles(String departement,
                                                          LocalDate date,
                                                          LocalTime heureDebut,
                                                          Integer duree) {

        List<Enseignant> enseignants = repository.findEnseignantsByDepartement(departement);

        boolean verifierCreneau = date != null
                && heureDebut != null
                && duree != null
                && duree > 0;

        if (!verifierCreneau) {
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

                    return soutenances.stream().noneMatch(soutenance -> {
                        LocalTime soutenanceDebut = LocalTime.parse(soutenance.getHeureDebut());
                        LocalTime soutenanceFin = soutenanceDebut.plusMinutes(soutenance.getDuree());

                        return heureDebut.isBefore(soutenanceFin)
                                && heureFin.isAfter(soutenanceDebut);
                    });
                })
                .map(this::mapToDTO)
                .toList();
    }

    // =========================================================
    // CREATE ENTITY BY ROLE
    // =========================================================
    private Utilisateur createEntityByRole(RoleUtilisateur role) {
        return switch (role) {
            case ETUDIANT -> new Etudiant();
            case ENSEIGNANT -> new Enseignant();
            case CHEF_DEPARTEMENT -> new ChefDepartement();
            case RESPONSABLE -> new Responsable();
            case SERVICE_STAGE -> new ServiceStage();
            case ADMIN -> new Admin();
        };
    }

    // =========================================================
    // ROLE PARSER
    // =========================================================
    private RoleUtilisateur parseRole(String role) {

        if (role == null || role.isBlank()) {
            throw new BadRequestException("Le champ 'role' est obligatoire");
        }

        try {
            return RoleUtilisateur.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Rôle invalide : " + role);
        }
    }

    // =========================================================
    // MAP BASE DTO -> ENTITY
    // =========================================================
    private void mapBaseFromDTO(UtilisateurDTO dto, Utilisateur user, boolean creation) {

        if (dto.getCin() != null) {
            user.setCin(dto.getCin());
        }

        if (dto.getNom() != null) {
            user.setNom(dto.getNom());
        }

        if (dto.getPrenom() != null) {
            user.setPrenom(dto.getPrenom());
        }

        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail());
        }

        if (dto.getActif() != null) {
            user.setActif(dto.getActif());
        } else if (creation) {
            user.setActif(true);
        }

        if (dto.getDepartement() != null) {
            user.setDepartement(dto.getDepartement());
        }

        if (dto.getTelephone() != null) {
            user.setTelephone(dto.getTelephone());
        }

        if (dto.getLieuDelivranceCin() != null) {
            user.setLieuDelivranceCin(dto.getLieuDelivranceCin());
        }

        if (dto.getDateDelivranceCin() != null) {
            user.setDateDelivranceCin(dto.getDateDelivranceCin());
        }

        if (creation) {
            RoleUtilisateur role = parseRole(dto.getRole());
            user.setRole(role);
        }

        if (dto.getMotDePasse() != null && !dto.getMotDePasse().isBlank()) {
            user.setMotDePasse(dto.getMotDePasse());
        }
    }

    // =========================================================
    // MAP SPECIFIC DTO -> ENTITY
    // =========================================================
    private void mapSpecificFieldsFromDTO(UtilisateurDTO dto, Utilisateur user) {

        if (user instanceof Etudiant etudiant) {
            etudiant.setNiveau(dto.getNiveau());
            etudiant.setSpecialite(dto.getSpecialite());
            etudiant.setGroupe(dto.getGroupe());
            etudiant.setNumeroInscription(dto.getNumeroInscription());
        }

        if (user instanceof Enseignant enseignant) {
            enseignant.setGrade(dto.getGrade());
            enseignant.setDomaine(dto.getDomaine());
        }
    }

    // =========================================================
    // MAP ENTITY -> DTO
    // =========================================================
    public UtilisateurDTO mapToDTO(Utilisateur user) {

        if (user == null) {
            return null;
        }

        UtilisateurDTO dto = new UtilisateurDTO();

        dto.setId(user.getId());

        if (user.getRole() != null) {
            dto.setRole(user.getRole().name());
        } else {
            dto.setRole(resolveRoleFromInstance(user));
        }

        dto.setCin(user.getCin());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setEmail(user.getEmail());
        dto.setActif(user.getActif());
        dto.setDepartement(user.getDepartement());
        dto.setTelephone(user.getTelephone());
        dto.setLieuDelivranceCin(user.getLieuDelivranceCin());
        dto.setDateDelivranceCin(user.getDateDelivranceCin());

        dto.setMotDePasse(null);

        if (user instanceof Etudiant etudiant) {
            dto.setNiveau(etudiant.getNiveau());
            dto.setSpecialite(etudiant.getSpecialite());
            dto.setGroupe(etudiant.getGroupe());
            dto.setNumeroInscription(etudiant.getNumeroInscription());
        }

        /*
         * ChefDepartement hérite de Enseignant, donc ce bloc fonctionne
         * pour Enseignant et ChefDepartement.
         */
        if (user instanceof Enseignant enseignant) {
            dto.setGrade(enseignant.getGrade());
            dto.setDomaine(enseignant.getDomaine());
        }

        return dto;
    }

    // =========================================================
    // FALLBACK ROLE FROM INSTANCE
    // =========================================================
    private String resolveRoleFromInstance(Utilisateur user) {

        if (user instanceof ChefDepartement) {
            return RoleUtilisateur.CHEF_DEPARTEMENT.name();
        }

        if (user instanceof ServiceStage) {
            return RoleUtilisateur.SERVICE_STAGE.name();
        }

        if (user instanceof Responsable) {
            return RoleUtilisateur.RESPONSABLE.name();
        }

        if (user instanceof Admin) {
            return RoleUtilisateur.ADMIN.name();
        }

        if (user instanceof Etudiant) {
            return RoleUtilisateur.ETUDIANT.name();
        }

        if (user instanceof Enseignant) {
            return RoleUtilisateur.ENSEIGNANT.name();
        }

        return null;
    }
}