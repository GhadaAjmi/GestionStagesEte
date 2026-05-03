import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JournalStage } from '../../models/journalStage';
import { DemandeStage } from '../../models/demandeStage';
import { AuthService } from '../../services/auth.service';
import { DemandeService } from '../../services/demande.service';
import { JournalService } from '../../services/journal.service';

@Component({
  selector: 'app-journal-stage',
  standalone: false,
  templateUrl: './journal-stage.component.html',
  styleUrl: './journal-stage.component.css'
})
export class JournalStageComponent implements OnInit {

  etudiantId: number = 0;
  demande: DemandeStage | null = null;
  entrees: JournalStage[] = [];
  loading: boolean = true;
  showFormulaire: boolean = false;

  nouvelleEntree = {
    dateEntree: new Date().toISOString().split('T')[0],
    activitesEtObservations: ''
  };

  entreeEnModification: JournalStage | null = null;

  constructor(
    private authService: AuthService,
    private demandeService: DemandeService,
    private journalService: JournalService
  ) {}

  ngOnInit() {
    this.etudiantId = this.authService.getUserId() ?? 0;
    this.chargerDonnees();
  }

  chargerDonnees() {
    this.demandeService.getDemandesByEtudiant(this.etudiantId).subscribe({
      next: (demande) => {
        this.demande = demande;
        if (demande?.id) {
          this.chargerJournal(demande.id);
        } else {
          this.loading = false;
        }
      },
      error: () => this.loading = false
    });
  }

  chargerJournal(demandeId: number) {
    this.journalService.getJournalByDemande(demandeId).subscribe({
      next: (entrees) => {
        this.entrees = entrees;
        this.loading = false;
        this.initFeather();
      },
      error: () => this.loading = false
    });
  }
ajouterEntree() {
  if (!this.demande?.id || !this.nouvelleEntree.activitesEtObservations.trim()) {
    return;
  }

  const entree: JournalStage = {
    demandeStageId: this.demande.id,
    date: this.nouvelleEntree.dateEntree,
    activitesEtObservations: this.nouvelleEntree.activitesEtObservations.trim(),
    vueResponsable: false,
    valideResponsable: false
  };

  console.log('PAYLOAD JOURNAL:', entree);

  this.journalService.ajouterEntree(entree).subscribe({
    next: () => {
      this.nouvelleEntree.activitesEtObservations = '';
      this.nouvelleEntree.dateEntree = new Date().toISOString().split('T')[0];
      this.showFormulaire = false;
      this.chargerJournal(this.demande!.id!);
    },
    error: (err: any) => {
      console.error('Erreur ajout journal:', err);
      alert('Erreur lors de l’ajout de l’entrée.');
    }
  });
}

  commencerModification(entree: JournalStage) {
    this.entreeEnModification = { ...entree };
  }

  sauvegarderModification() {
    if (!this.entreeEnModification?.id) return;
    this.journalService.modifierEntree(
      this.entreeEnModification.id,
      this.entreeEnModification
    ).subscribe({
      next: () => {
        this.entreeEnModification = null;
        this.chargerJournal(this.demande!.id!);
      },
      error: (err: any) => console.error(err)
    });
  }

  supprimerEntree(id?: number) {
    if (!id) return;
    if (!confirm('Supprimer cette entrée ?')) return;
    this.journalService.supprimerEntree(id).subscribe({
      next: () => this.chargerJournal(this.demande!.id!),
      error: (err: any) => console.error(err)
    });
  }

  telechargerJournalPDF() {
    if (!this.demande?.id) return;
    this.journalService.telechargerJournalPDF(this.demande.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'journal_stage.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Erreur téléchargement PDF')
    });
  }

  initFeather() {
    setTimeout(() => {
      if ((window as any).feather) {
        (window as any).feather.replace();
      }
    }, 100);
  }
}