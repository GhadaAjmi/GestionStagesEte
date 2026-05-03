import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { DemandeService } from '../../services/demande.service';
import { AuthService } from '../../services/auth.service';
import { UtilisateurService } from '../../services/utilisateur.service';
import { DemandeStage } from '../../models/demandeStage';
import { DocumentDemande } from '../../models/document';
import { Utilisateur } from '../../models/utilisateur.models';

@Component({
  selector: 'app-mes-documents',
  templateUrl: './mes-documents.component.html',
  styleUrl: './mes-documents.component.css',
  standalone: false,
  
})
export class MesDocumentsComponent implements OnInit {

  loading = true;
  stage: DemandeStage | null = null;
  etudiant: Utilisateur | null = null;
  documents: DocumentDemande[] = [];
  etudiantId: number = 0;
  documentsRequis: any[] = [];

  constructor(
    private demandeService: DemandeService,
    private documentService: DocumentService,
    private authService: AuthService,
    private utilisateurService: UtilisateurService
  ) {}

  ngOnInit() {
    this.etudiantId = this.authService.getUserId() ?? 0;
    this.chargerProfil();
    this.chargerDonnees();
  }

  chargerProfil() {
    this.utilisateurService.getUtilisateurById(this.etudiantId).subscribe({
      next: (user) => {
        this.etudiant = user;
        // Recalculer si le stage est déjà chargé
        if (this.stage) {
          this.initialiserDocumentsRequis(user.niveau ?? '');
        }
      },
      error: () => {}
    });
  }

  chargerDonnees() {
    this.demandeService.getDemandesByEtudiant(this.etudiantId).subscribe({
      next: (demande) => {
        if (demande) {
          this.stage = demande;
          // Initialiser avec le niveau si déjà chargé
          if (this.etudiant) {
            this.initialiserDocumentsRequis(this.etudiant.niveau ?? '');
          } else {
            // Sera appelé depuis chargerProfil quand le profil arrive
            this.utilisateurService.getUtilisateurById(this.etudiantId).subscribe({
              next: (user) => {
                this.etudiant = user;
                this.initialiserDocumentsRequis(user.niveau ?? '');
              }
            });
          }

          this.documentService.getDocumentsByDemande(demande.id).subscribe({
            next: (docs) => {
              this.documents = docs;
              this.loading = false;
              this.initFeather();
            },
            error: () => this.loading = false
          });
        } else {
          this.loading = false;
        }
      },
      error: () => this.loading = false
    });
  }

  initialiserDocumentsRequis(niveau: string) {
    const estNiveau1 = niveau === '1' || niveau === '1A'
                    || niveau.startsWith('1') || niveau === 'première';

    this.documentsRequis = [
      {
        type: 'LETTRE_AFFECTATION',
        label: 'Lettre d\'affectation',
        obligatoire: true,
        accept: '.pdf'
      },
      {
        type: 'CONVENTION',
        label: 'Convention de stage',
        obligatoire: true,
        accept: '.pdf'
      },
      {
        type: 'JOURNAL',
        label: 'Journal de stage',
        obligatoire: true,
        accept: '.pdf'
      },
      {
        type: 'ATTESTATION',
        label: 'Attestation de stage',
        obligatoire: true,
        accept: '.pdf'
      },
      // Poster ou Présentation selon niveau
      estNiveau1
        ? { type: 'POSTER',       label: 'Poster',        obligatoire: true, accept: '.pdf,.png,.jpg' }
        : { type: 'PRESENTATION', label: 'Présentation',  obligatoire: true, accept: '.pdf,.pptx' },
      // Rapport uniquement niveau 2
      ...(!estNiveau1
        ? [{ type: 'RAPPORT', label: 'Rapport de stage', obligatoire: true, accept: '.pdf' }]
        : []),
      // Avenant de prolongation uniquement si prolongation existe
      ...(this.stage && 'prolongationId' in this.stage && this.stage.prolongationId
        ? [{ type: 'PROLONGATION', label: 'Avenant de prolongation', obligatoire: false, accept: '.pdf' }]
        : [])
    ];
  }

  getDocument(type: string): DocumentDemande | undefined {
    return this.documents.find(d => d.type === type);
  }

  getStatut(type: string): string {
    const doc = this.getDocument(type);
    return doc ? doc.statut : 'EN_ATTENTE';
  }

  getBadgeClass(type: string): string {
    switch (this.getStatut(type)) {
      case 'SOUMIS': return 'bg-soft-primary text-primary';
      case 'VALIDE': return 'bg-soft-success text-success';
      case 'REJETE': return 'bg-soft-danger text-danger';
      default:       return 'bg-soft-secondary text-secondary';
    }
  }

  getBadgeLabel(type: string): string {
    switch (this.getStatut(type)) {
      case 'SOUMIS': return 'Soumis';
      case 'VALIDE': return 'Validé ✅';
      case 'REJETE': return 'Rejeté ❌';
      default:       return 'En attente';
    }
  }

  onFileSelected(event: Event, type: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.stage?.id) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('demandeStageId', this.stage.id.toString());
    formData.append('fichier', file);
    formData.append('type', type);

    this.documentService.deposerDocument(formData).subscribe({
      next: () => {
        this.chargerDonnees();
        alert('Document déposé avec succès');
      },
      error: () => alert('Erreur lors du dépôt')
    });
  }

  supprimerDocument(type: string) {
    const doc = this.getDocument(type);
    if (!doc?.id) return;
    if (!confirm('Confirmer la suppression ?')) return;

    this.documentService.supprimerDocument(doc.id).subscribe({
      next: () => this.chargerDonnees(),
      error: () => alert('Erreur lors de la suppression')
    });
  }

  initFeather() {
    setTimeout(() => {
      if ((window as any).feather) (window as any).feather.replace();
    }, 100);
  }
}