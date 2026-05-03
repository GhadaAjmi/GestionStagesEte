import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { SoutenanceService } from '../../services/soutenance.service';
import { Soutenance, MembreJury } from '../../models/soutenance';

interface SoutenanceEnseignantFilter {
  recherche?: string;
  statut?: string;
  niveau?: string;
  departement?: string;
  specialite?: string;
  groupe?: string;
  salleCode?: string;
  date?: string;
}

@Component({
  selector: 'app-mes-soutenances',
  templateUrl: './mes-soutenances.component.html',
  styleUrls: ['./mes-soutenances.component.css'],
  standalone: false
})
export class MesSoutenancesComponent implements OnInit {

  enseignantId!: number;

  soutenances: Soutenance[] = [];
  filteredSoutenances: Soutenance[] = [];

  loading = false;
  error: string | null = null;

  filter: SoutenanceEnseignantFilter = {};

  niveauxDisponibles: string[] = [];
  departementsDisponibles: string[] = [];
  specialitesDisponibles: string[] = [];
  groupesDisponibles: string[] = [];
  sallesDisponibles: string[] = [];

  showDetailModal = false;
  selectedSoutenance: Soutenance | null = null;
  detailLoading = false;
  detailError: string | null = null;

  constructor(
    private authService: AuthService,
    private soutenanceService: SoutenanceService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.error = 'Enseignant non connecté.';
      return;
    }

    this.enseignantId = userId;
    this.load();
  }

  // ─────────────────────────────────────────────
  // Chargement des soutenances de l’enseignant
  // ─────────────────────────────────────────────

  load(): void {
    this.loading = true;
    this.error = null;

    this.soutenanceService.getSoutenancesByEnseignant(this.enseignantId).subscribe({
      next: data => {
        this.soutenances = (data || []).map(s => ({
          ...s,
          membresJury: s.membresJury || []
        }));

        this.filteredSoutenances = [...this.soutenances];

        this.prepareFilterOptions();
        this.applyFilters();

        this.loading = false;
      },
      error: err => {
        console.error('Erreur chargement soutenances enseignant :', err);
        this.error = 'Erreur lors du chargement de vos soutenances.';
        this.loading = false;
      }
    });
  }

  private prepareFilterOptions(): void {
    this.niveauxDisponibles = this.uniqueValues(
      this.soutenances.map(s => s.etudiantNiveau)
    );

    this.departementsDisponibles = this.uniqueValues(
      this.soutenances.map(s => s.etudiantDepartement)
    );

    this.specialitesDisponibles = this.uniqueValues(
      this.soutenances.map(s => s.etudiantSpecialite)
    );

    this.groupesDisponibles = this.uniqueValues(
      this.soutenances.map(s => s.etudiantGroupe)
    );

    this.sallesDisponibles = this.uniqueValues(
      this.soutenances.map(s => s.codeSalle)
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

  // ─────────────────────────────────────────────
  // Filtres
  // ─────────────────────────────────────────────

  applyFilters(): void {
    const f = this.filter;

    this.filteredSoutenances = this.soutenances.filter(s => {

      if (f.recherche?.trim()) {
        const q = f.recherche.trim().toLowerCase();

        const etudiant1 = `${s.etudiantPrenom || ''} ${s.etudiantNom || ''}`.toLowerCase();
        const etudiant2 = `${s.etudiantNom || ''} ${s.etudiantPrenom || ''}`.toLowerCase();
        const sujet = (s.sujetDemande || '').toLowerCase();
        const salle = (s.codeSalle || '').toLowerCase();
        const departement = (s.etudiantDepartement || '').toLowerCase();
        const specialite = (s.etudiantSpecialite || '').toLowerCase();

        if (
          !etudiant1.includes(q) &&
          !etudiant2.includes(q) &&
          !sujet.includes(q) &&
          !salle.includes(q) &&
          !departement.includes(q) &&
          !specialite.includes(q)
        ) {
          return false;
        }
      }

      if (f.statut?.trim()) {
        if (String(s.statut) !== f.statut.trim()) return false;
      }

      if (f.niveau?.trim()) {
        if ((s.etudiantNiveau || '').trim() !== f.niveau.trim()) return false;
      }

      if (f.departement?.trim()) {
        if ((s.etudiantDepartement || '').trim() !== f.departement.trim()) return false;
      }

      if (f.specialite?.trim()) {
        if ((s.etudiantSpecialite || '').trim() !== f.specialite.trim()) return false;
      }

      if (f.groupe?.trim()) {
        if ((s.etudiantGroupe || '').trim() !== f.groupe.trim()) return false;
      }

      if (f.salleCode?.trim()) {
        if ((s.codeSalle || '').trim() !== f.salleCode.trim()) return false;
      }

      if (f.date?.trim()) {
        if (s.date !== f.date.trim()) return false;
      }

      return true;
    });
  }

  resetFilters(): void {
    this.filter = {};
    this.filteredSoutenances = [...this.soutenances];
  }

  get filtresActifsCount(): number {
    const champs: Array<keyof SoutenanceEnseignantFilter> = [
      'recherche',
      'statut',
      'niveau',
      'departement',
      'specialite',
      'groupe',
      'salleCode',
      'date'
    ];

    return champs.filter(k => !!this.filter[k]?.trim()).length;
  }

  // ─────────────────────────────────────────────
  // Statistiques
  // Sans “ce mois-ci”
  // ─────────────────────────────────────────────

  get totalSoutenances(): number {
    return this.filteredSoutenances.length;
  }

  get soutenancesAVenir(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.filteredSoutenances.filter(s => {
      if (!s.date) return false;

      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);

      return d >= today && s.statut !== 'ANNULEE';
    }).length;
  }

  get soutenancesTerminees(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.filteredSoutenances.filter(s => {
      if (s.statut === 'VALIDEE') return true;

      if (!s.date) return false;

      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);

      return d < today && s.statut !== 'ANNULEE';
    }).length;
  }

  get soutenancesAnnulees(): number {
    return this.filteredSoutenances.filter(s => s.statut === 'ANNULEE').length;
  }

  countByStatut(statut: string): number {
    return this.filteredSoutenances.filter(s => s.statut === statut).length;
  }

  // ─────────────────────────────────────────────
  // Détails
  // ─────────────────────────────────────────────

  openDetail(soutenance: Soutenance): void {
    this.selectedSoutenance = soutenance;
    this.showDetailModal = true;
    this.detailError = null;
    document.body.style.overflow = 'hidden';

    if (!soutenance.id) {
      this.detailError = 'ID de soutenance introuvable.';
      return;
    }

    this.detailLoading = true;

    this.soutenanceService.getById(soutenance.id).subscribe({
      next: full => {
        this.selectedSoutenance = {
          ...full,
          membresJury: full.membresJury || []
        };

        this.detailLoading = false;
      },
      error: err => {
        console.error('Erreur détail soutenance :', err);
        this.detailLoading = false;
        this.detailError = 'Impossible de charger les détails de la soutenance.';
      }
    });
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedSoutenance = null;
    this.detailError = null;
    document.body.style.overflow = '';
  }

  // ─────────────────────────────────────────────
  // Helpers affichage
  // ─────────────────────────────────────────────

  heureFinCalc(heureDebut: string, duree: number): string {
    if (!heureDebut || !duree) return '--:--';

    const [h, m] = heureDebut.split(':').map(Number);

    if (Number.isNaN(h) || Number.isNaN(m)) {
      return '--:--';
    }

    const totalMin = h * 60 + m + duree;

    return `${String(Math.floor(totalMin / 60) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
  }

  initials(m: MembreJury): string {
    return ((m.prenomEnseignant?.[0] || '') + (m.nomEnseignant?.[0] || '')).toUpperCase() || '?';
  }

  statutBadgeClass(statut: string): string {
    switch (statut) {
      case 'PLANIFIEE':
        return 'badge bg-soft-warning text-warning';

      case 'VALIDEE':
        return 'badge bg-soft-success text-success';

      case 'ANNULEE':
        return 'badge bg-soft-danger text-danger';

      default:
        return 'badge bg-soft-secondary text-secondary';
    }
  }

  statutLabel(statut: string): string {
    switch (statut) {
      case 'PLANIFIEE':
        return 'Planifiée';

      case 'VALIDEE':
        return 'Validée';

      case 'ANNULEE':
        return 'Annulée';

      default:
        return statut || '—';
    }
  }

  monRole(soutenance: Soutenance): string {
    const membres = soutenance.membresJury || [];
    const index = membres.findIndex(m => m.enseignantId === this.enseignantId);

    if (index === -1) {
      return 'Membre jury';
    }

    return `Membre ${index + 1}`;
  }
}