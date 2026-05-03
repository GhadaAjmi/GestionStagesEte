import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { DemandeStage } from '../../../models/demandeStage';
import { StatutDemande } from '../../../models/enums';
import { DemandeService } from '../../../services/demande.service';
import { UtilisateurService } from '../../../services/utilisateur.service';

interface DemandeStageFilter {
  recherche?: string;
  statut?: string;
  departement?: string;
  niveau?: string;
  groupe?: string;
}

@Component({
  selector: 'app-demandesstage',
  templateUrl: './demandesstage.component.html',
  styleUrls: ['./demandesstage.component.css'],
  standalone: false
})
export class DemandesstageComponent implements OnInit {

  demandes: DemandeStage[] = [];
  filteredDemandes: DemandeStage[] = [];

  loading = false;
  error: string | null = null;

  showStats = false;
  showFilters = false;

  filter: DemandeStageFilter = {};

  statuts: StatutDemande[] = [
    'SOUMISE',
    'EN_ATTENTE_SIGNATURE',
    'VALIDEE',
    'REFUSEE',
    'EN_COURS',
    'PROLONGATION_DEMANDEE',
    'TERMINEE'
  ];

  departementsDisponibles: string[] = [];
  niveauxDisponibles: string[] = [];
  groupesDisponibles: string[] = [];

  constructor(
    private demandeService: DemandeService,
    private utilisateurService: UtilisateurService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.demandeService.getAllDemandes().subscribe({
      next: demandes => {
        const data = demandes || [];

        if (data.length === 0) {
          this.demandes = [];
          this.filteredDemandes = [];
          this.refreshFilterOptions();
          this.loading = false;
          return;
        }

        const requests = data.map(demande => {
          if (!demande.etudiantId) {
            return of(demande);
          }

          return this.utilisateurService.getUtilisateurById(demande.etudiantId).pipe(
            map((etudiant: any) => {
              demande.etudiantNom = etudiant.nom;
              demande.etudiantPrenom = etudiant.prenom;
              demande.etudiantDepartement = etudiant.departement;
              demande.etudiantNiveau = etudiant.niveau;
              demande.etudiantGroupe = etudiant.groupe;
              demande.etudiantSpecialite = etudiant.specialite;

              return demande;
            }),
            catchError(() => of(demande))
          );
        });

        forkJoin(requests).subscribe({
          next: demandesAvecEtudiants => {
            this.demandes = demandesAvecEtudiants;
            this.refreshFilterOptions();
            this.applyFilters();
            this.loading = false;
          },
          error: err => {
            console.error('[DemandesStage] Erreur chargement étudiants', err);
            this.error = 'Erreur lors du chargement des étudiants.';
            this.loading = false;
          }
        });
      },
      error: err => {
        console.error('[DemandesStage] Erreur getAllDemandes()', err);
        this.error =
          err?.error?.message ||
          err?.error ||
          'Erreur lors du chargement des demandes de stage.';
        this.loading = false;
      }
    });
  }

  private refreshFilterOptions(): void {
    this.departementsDisponibles = this.uniqueValues(
      this.demandes.map(d => d.etudiantDepartement)
    );

    this.niveauxDisponibles = this.uniqueValues(
      this.demandes
        .filter(d => !this.filter.departement || d.etudiantDepartement === this.filter.departement)
        .map(d => d.etudiantNiveau)
    );

    this.groupesDisponibles = this.uniqueValues(
      this.demandes
        .filter(d => !this.filter.departement || d.etudiantDepartement === this.filter.departement)
        .filter(d => !this.filter.niveau || d.etudiantNiveau === this.filter.niveau)
        .map(d => d.etudiantGroupe)
    );
  }

  private uniqueValues(values: Array<string | undefined>): string[] {
    return Array.from(
      new Set(
        values
          .filter((v): v is string => !!v && v.trim().length > 0)
          .map(v => v.trim())
      )
    ).sort((a, b) => a.localeCompare(b));
  }

  onDepartementChange(): void {
    this.filter.niveau = '';
    this.filter.groupe = '';
    this.refreshFilterOptions();
    this.applyFilters();
  }

  onNiveauChange(): void {
    this.filter.groupe = '';
    this.refreshFilterOptions();
    this.applyFilters();
  }

  applyFilters(): void {
    const f = this.filter;

    this.filteredDemandes = this.demandes.filter(d => {
      if (f.recherche?.trim()) {
        const q = f.recherche.trim().toLowerCase();

        const entreprise = (d.entreprise ?? '').toLowerCase();
        const sujet = (d.sujet ?? '').toLowerCase();
        const nom = (d.etudiantNom ?? '').toLowerCase();
        const prenom = (d.etudiantPrenom ?? '').toLowerCase();
        const departement = (d.etudiantDepartement ?? '').toLowerCase();
        const niveau = (d.etudiantNiveau ?? '').toLowerCase();
        const groupe = (d.etudiantGroupe ?? '').toLowerCase();
        const specialite = (d.etudiantSpecialite ?? '').toLowerCase();

        const nomComplet1 = `${prenom} ${nom}`.trim();
        const nomComplet2 = `${nom} ${prenom}`.trim();

        if (
          !entreprise.includes(q) &&
          !sujet.includes(q) &&
          !nom.includes(q) &&
          !prenom.includes(q) &&
          !nomComplet1.includes(q) &&
          !nomComplet2.includes(q) &&
          !departement.includes(q) &&
          !niveau.includes(q) &&
          !groupe.includes(q) &&
          !specialite.includes(q)
        ) {
          return false;
        }
      }

      if (f.statut?.trim()) {
        if (d.statut !== f.statut.trim()) {
          return false;
        }
      }

      if (f.departement?.trim()) {
        const dept = (d.etudiantDepartement ?? '').trim().toLowerCase();
        if (dept !== f.departement.trim().toLowerCase()) {
          return false;
        }
      }

      if (f.niveau?.trim()) {
        const niveau = (d.etudiantNiveau ?? '').trim().toLowerCase();
        if (niveau !== f.niveau.trim().toLowerCase()) {
          return false;
        }
      }

      if (f.groupe?.trim()) {
        const groupe = (d.etudiantGroupe ?? '').trim().toLowerCase();
        if (groupe !== f.groupe.trim().toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }

  resetFilters(): void {
    this.filter = {};
    this.refreshFilterOptions();
    this.applyFilters();
  }

  toggleStats(): void {
    this.showStats = !this.showStats;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  openDetail(demande: DemandeStage): void {
    if (!demande.id) {
      return;
    }

    this.router.navigate(['/responsable/demandes/details', demande.id]);
  }

  get demandesFiltrees(): DemandeStage[] {
    return this.filteredDemandes;
  }

  countByStatutFiltered(statut: string): number {
    return this.demandesFiltrees.filter(d => d.statut === statut).length;
  }

  get totalDemandes(): number {
    return this.demandes.length;
  }

  get valideePercentFiltered(): string {
    const total = this.demandesFiltrees.length;

    if (!total) {
      return '0';
    }

    return ((this.countByStatutFiltered('VALIDEE') / total) * 100).toFixed(1);
  }

  get refuseePercentFiltered(): string {
    const total = this.demandesFiltrees.length;

    if (!total) {
      return '0';
    }

    return ((this.countByStatutFiltered('REFUSEE') / total) * 100).toFixed(1);
  }

  statutBadgeClass(statut?: string): string {
    const classes: Record<string, string> = {
      SOUMISE: 'badge bg-soft-secondary text-secondary',
      EN_ATTENTE_SIGNATURE_STAGIAIRE: 'badge bg-soft-warning text-warning',
      EN_ATTENTE_SIGNATURE_RESPONSABLE: 'badge bg-soft-info text-info',
      VALIDEE: 'badge bg-soft-success text-success',
      REFUSEE: 'badge bg-soft-danger text-danger',
      EN_COURS: 'badge bg-soft-primary text-primary',
      PROLONGATION_DEMANDEE: 'badge bg-soft-warning text-warning',
      TERMINEE: 'badge bg-success text-white'
    };

    return classes[statut ?? ''] ?? 'badge bg-soft-secondary text-secondary';
  }

  statutLabel(statut?: string): string {
    const labels: Record<string, string> = {
      SOUMISE: 'Soumise',
      EN_ATTENTE_SIGNATURE_STAGIAIRE: 'Attente signature stagiaire',
      EN_ATTENTE_SIGNATURE_RESPONSABLE: 'Attente signature responsable',
      VALIDEE: 'Validée',
      REFUSEE: 'Refusée',
      EN_COURS: 'En cours',
      PROLONGATION_DEMANDEE: 'Prolongation demandée',
      TERMINEE: 'Terminée'
    };

    return labels[statut ?? ''] ?? (statut || '—');
  }

  formatDate(date?: string | Date): string {
    if (!date) {
      return '—';
    }

    if (date instanceof Date) {
      return date.toISOString().slice(0, 10);
    }

    return date.slice(0, 10);
  }

  trackById(index: number, demande: DemandeStage): number {
    return demande.id;
  }

  get filtresActifsCount(): number {
    const champsFiltres: Array<keyof DemandeStageFilter> = [
      'recherche',
      'statut',
      'departement',
      'niveau',
      'groupe'
    ];

    return champsFiltres.filter(k => !!this.filter[k]?.trim()).length;
  }
}