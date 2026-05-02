package com.enicar.projet.entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents_demande")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TypeDocument type;

    @Column(name = "nom_fichier", nullable = false, length = 500)
    private String nomFichier;
    @Lob
    @Column(name = "contenu", columnDefinition = "LONGBLOB")
    private byte[] contenu;
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = true)
    private StatutDocument statut;

    @Column(name = "date_depot", nullable = false)
    private LocalDateTime dateDepot;
    @Column(name = "date_decision", nullable = true)
    private LocalDateTime dateDecision;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_stage_id")
    private DemandeStage demandeStage;
    @Column(length = 255, nullable = true)
    private String motifRejet;

}
