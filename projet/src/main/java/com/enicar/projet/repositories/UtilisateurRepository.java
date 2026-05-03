package com.enicar.projet.repositories;

import com.enicar.projet.entities.Enseignant;
import com.enicar.projet.entities.Etudiant;
import com.enicar.projet.entities.RoleUtilisateur;
import com.enicar.projet.entities.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);
    Boolean existsByEmail(String email);

    Optional<Etudiant> findByNumeroInscription(String num);

    List<Utilisateur> findAll();
    Utilisateur  findById(long id);
    List<Utilisateur> findByRole(RoleUtilisateur role);
    @Query("""
        SELECT DISTINCT u.departement FROM Etudiant u
    """)
    List<String> findDepartements();
    // 🔹 NIVEAUX (filtre: departement + specialite)
    @Query("""
        SELECT DISTINCT u.niveau FROM Etudiant u
        WHERE u.niveau IS NOT NULL
        AND (:departement IS NULL OR u.departement = :departement)
        AND (:specialite IS NULL OR u.specialite = :specialite)
    """)
    List<String> findNiveaux(String departement, String specialite);

    // 🔹 SPECIALITES (filtre: departement + niveau)
    @Query("""
        SELECT DISTINCT u.specialite FROM Etudiant u
        WHERE u.specialite IS NOT NULL
        AND (:departement IS NULL OR u.departement = :departement)
        AND (:niveau IS NULL OR u.niveau = :niveau)
    """)
    List<String> findSpecialites(String departement, String niveau);

    // 🔹 GROUPES (filtre: departement + niveau + specialite)
    @Query("""
        SELECT DISTINCT u.groupe FROM Etudiant u
        WHERE u.groupe IS NOT NULL
        AND (:departement IS NULL OR u.departement = :departement)
        AND (:niveau IS NULL OR u.niveau = :niveau)
        AND (:specialite IS NULL OR u.specialite = :specialite)
    """)
    List<String> findGroupes(String departement, String specialite, String niveau);
    @Query("SELECT e FROM Etudiant e " +
            "WHERE (:departement IS NULL OR e.departement = :departement) " +
            "AND (:specialite IS NULL OR e.specialite = :specialite) " +
            "AND (:niveau IS NULL OR e.niveau = :niveau) " +
            "AND (:groupe IS NULL OR e.groupe = :groupe)")
    List<Etudiant> findByFiltre(
            @Param("departement") String departement,
            @Param("specialite") String specialite,
            @Param("niveau") String niveau,
            @Param("groupe") String groupe
    );
    @Query("""
SELECT e FROM Etudiant e
WHERE e.departement = :departement
AND e.specialite = :specialite
AND e.niveau = :niveau
AND e.id NOT IN (
    SELECT s.demandeStage.etudiant.id FROM Soutenance s
)
""")
    List<Etudiant> findEtudiantsSansSoutenance(
            String departement,
            String specialite,
            String niveau
    );
    List<Enseignant> findByActifTrue();
    @Query("""
    SELECT e
    FROM Enseignant e
    WHERE e.actif = true
      AND (:departement IS NULL OR :departement = '' OR e.departement = :departement)
""")
    List<Enseignant> findEnseignantsByDepartement(
            @Param("departement") String departement
    );
    @Query("""
    SELECT e
    FROM Etudiant e
    WHERE e.departement = :departement
      AND e.specialite = :specialite
      AND e.niveau = :niveau
      AND e.groupe = :groupe
""")
    List<Etudiant> findEtudiantsDuGroupe(
            @Param("departement") String departement,
            @Param("specialite") String specialite,
            @Param("niveau") String niveau,
            @Param("groupe") String groupe
    );
    @Query("""
    SELECT e
    FROM Enseignant e
    WHERE e.actif = true
      AND (:departement IS NULL OR :departement = '' OR e.departement = :departement)
""")
    List<Enseignant> findEnseignantsActifsByDepartement(
            @Param("departement") String departement
    );

}
