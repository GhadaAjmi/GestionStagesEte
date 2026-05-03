import { Component, OnInit } from '@angular/core';

import { DemandeService } from '../../services/demande.service';
import { DocumentService } from '../../services/document.service';
import { Utilisateur } from '../../models/utilisateur.models';
import { DemandeStage } from '../../models/demandeStage';
import { DocumentDemande } from '../../models/document';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: false
})
export class DashboardComponent implements OnInit {

  etudiantId: number = 0;
  etudiant: Utilisateur | null = null;
  demande: DemandeStage | null = null;
  documents: DocumentDemande[] = [];
  joursRestants: number = 0;
  loading: boolean = true;

  constructor(
    private demandeService: DemandeService,
    private documentService: DocumentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
   this.etudiantId = this.authService.getUserId() ?? 0;  // ← vrai id
    this.chargerDonnees();
  }

  chargerDonnees() {
    this.demandeService.getDemandesByEtudiant(this.etudiantId)
      .subscribe({
        next: (demande) => {  // ← objet unique, plus tableau
          if (demande) {
            this.demande = demande;
            this.calculerJoursRestants();
            if (this.demande.id) {
              this.documentService
                .getDocumentsByDemande(this.demande.id)
                .subscribe({
                  next: (docs) => {
                    this.documents = docs as unknown as DocumentDemande[];
                    this.loading = false;
                    this.initFeather();
                  },
                  error: () => this.loading = false
                });
            }
          } else {
            this.loading = false;
          }
        },
        error: () => this.loading = false
      });
  }
  calculerJoursRestants() {
    if (this.demande?.dateFin) {
      const dateFin = new Date(this.demande.dateFin);
      const today = new Date();
      const diff = dateFin.getTime() - today.getTime();
      this.joursRestants = Math.ceil(diff / (1000 * 3600 * 24));
    }
  }

  getStatutLabel(): string {
    switch(this.demande?.statut) {
      case 'SOUMISE': return 'Soumise';
      case 'EN_ATTENTE_SIGNATURE': return 'En attente de signature';
      case 'VALIDEE': return 'Validée';
      case 'REFUSEE': return 'Refusée';
      case 'EN_COURS': return 'En cours';
      case 'PROLONGATION_DEMANDEE': return 'Prolongation demandée';
      case 'TERMINEE': return 'Terminée';
      default: return 'Non soumise';
    }
  }

  getStatutBadgeClass(): string {
    switch(this.demande?.statut) {
      case 'VALIDEE':
      case 'TERMINEE': return 'bg-soft-success text-success';
      case 'EN_COURS': return 'bg-soft-primary text-primary';
      case 'REFUSEE': return 'bg-soft-danger text-danger';
      case 'SOUMISE':
      case 'EN_ATTENTE_SIGNATURE': return 'bg-soft-warning text-warning';
      default: return 'bg-soft-secondary text-secondary';
    }
  }

  getDocumentStatut(type: string): string {
    const doc = this.documents.find(d => d.type === type);
    return doc ? doc.statut || 'GENERE' : 'GENERE';
  }

  getBadgeClass(type: string): string {
    const statut = this.getDocumentStatut(type);
    switch(statut) {
      case 'SOUMIS': return 'bg-soft-primary text-primary';
      case 'VALIDE': return 'bg-soft-success text-success';
      case 'REJETE': return 'bg-soft-danger text-danger';
      default: return 'bg-soft-warning text-warning';
    }
  }

  getBadgeLabel(type: string): string {
    const statut = this.getDocumentStatut(type);
    switch(statut) {
      case 'GENERE': return 'Généré';
      case 'SOUMIS': return 'Soumis';
      case 'VALIDE': return 'Validé ✅';
      case 'REJETE': return 'Rejeté ❌';
      default: return 'En attente';
    }
  }
  // Retourne 'done' | 'active' | 'pending' selon le statut de la demande
getStepStatus(step: number): 'done' | 'active' | 'pending' | 'refused' {
  const statut = this.demande?.statut;

  switch (statut) {

    // Étape 1 active — demande soumise mais pas encore validée
    case 'SOUMISE':
    case 'EN_ATTENTE_SIGNATURE':
      if (step === 1) return 'active';
      return 'pending';

    // Étape 1 échouée
    case 'REFUSEE':
      if (step === 1) return 'refused';
      return 'pending';

    // Étape 1 done, étape 2 active
    case 'VALIDEE':
    case 'EN_COURS':
    case 'PROLONGATION_DEMANDEE':
      if (step === 1) return 'done';
      if (step === 2) return 'active';
      return 'pending';

    // Étape 1 & 2 done, étape 3 active
    case 'TERMINEE':
      if (step <= 2) return 'done';
      if (step === 3) return 'active';
      // Étape 4 (soutenance) : done si soutenanceId existe
      if (step === 4) return this.demande?.soutenanceId ? 'done' : 'pending';
      return 'pending';

    default:
      return 'pending';
  }
}
getStepIconClass(step: number): string {
  switch (this.getStepStatus(step)) {
    case 'done':    return 'bg-soft-success text-success';
    case 'active':  return 'bg-soft-primary text-primary';
    case 'refused': return 'bg-soft-danger text-danger';
    default:        return 'bg-soft-secondary text-secondary';
  }
}

getStepBadgeClass(step: number): string {
  switch (this.getStepStatus(step)) {
    case 'done':    return 'bg-soft-success text-success';
    case 'active':  return 'bg-soft-primary text-primary';
    case 'refused': return 'bg-soft-danger text-danger';
    default:        return 'bg-soft-secondary text-secondary';
  }
}

getStepLabel(step: number): string {
  switch (this.getStepStatus(step)) {
    case 'done':    return 'Complété';
    case 'active':
      // Label spécifique selon le statut exact
      if (step === 1) {
        return this.demande?.statut === 'EN_ATTENTE_SIGNATURE'
          ? 'En attente signature'
          : 'Soumise';
      }
      if (step === 2) {
        return this.demande?.statut === 'PROLONGATION_DEMANDEE'
          ? 'Prolongation demandée'
          : 'En cours';
      }
      return 'En cours';
    case 'refused': return 'Refusée';
    default:        return 'En attente';
  }
}

getStepIcon(step: number): string {
  const status = this.getStepStatus(step);
  if (status === 'done')    return 'check-circle';
  if (status === 'refused') return 'x-circle';
  const icons: Record<number, string> = {
    1: 'file-text',
    2: 'clock',
    3: 'upload',
    4: 'award'
  };
  return icons[step] ?? 'circle';
}

getConnectorClass(step: number): string {
  const status = this.getStepStatus(step);
  if (status === 'done')    return 'border-success';
  if (status === 'refused') return 'border-danger';
  return 'border-secondary';
}

  initFeather() {
    setTimeout(() => {
      if ((window as any).feather) {
        (window as any).feather.replace();
      }
    }, 100);
  }
}