import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DemandeStage } from '../../models/demandeStage';
import { Etudiant } from '../../models/etudiant';
import { DemandeService } from '../../services/demande.service';
import { UtilisateurService } from '../../services/utilisateur.service';


interface EtudiantFilter {
  niveau?: string;
  departement?: string;
  specialite?: string;
  groupe?: string;
  statutStage?: string; // AVEC_STAGE | SANS_STAGE
}

@Component({
  selector: 'app-all-etudiants',
  templateUrl: './all-etudiants.component.html',
  styleUrls: ['./all-etudiants.component.css'],
  standalone: false
})
export class AllEtudiantsComponent implements OnInit {

  etudiants: Etudiant[] = [];
  etudiantsFiltres: Etudiant[] = [];

  demandes: DemandeStage[] = [];

  searchTerm: string = '';

  isGridView: boolean = true;
  isSearchOpen: boolean = false;
  showFilters: boolean = false;
  showStats: boolean = true;

  filter: EtudiantFilter = {};

  photos: { [id: number]: SafeUrl | string } = {};
  readonly defaultPhoto: string = 'assets/images/avatar/undefined.jpg';

  loading: boolean = false;
  errorMessage: string = '';

  niveauxDisponibles: string[] = [];
  departementsDisponibles: string[] = [];
  specialitesDisponibles: string[] = [];
  groupesDisponibles: string[] = [];

  constructor(
    private utilisateurService: UtilisateurService,
    private demandeService: DemandeService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadEtudiants();
  }

  // ─────────────────────────────────────────────
  // Chargement
  // ─────────────────────────────────────────────

  loadEtudiants(): void {
    this.loading = true;
    this.errorMessage = '';

    this.utilisateurService.getUtilisateursByRole('ETUDIANT').subscribe({
      next: (data) => {
        this.etudiants = (data as Etudiant[]) || [];

        this.loadDemandesEtStages();
        this.loadPhotos();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des étudiants :', err);
        this.errorMessage = 'Erreur lors du chargement des étudiants.';
        this.loading = false;
      }
    });
  }

  private loadDemandesEtStages(): void {
    this.demandeService.getAllDemandes().subscribe({
      next: (demandes) => {
        this.demandes = demandes || [];
        this.enrichirEtudiantsAvecDemandes();
        this.prepareFilterOptions();
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des demandes :', err);

        // Même si les demandes échouent, on affiche les étudiants comme sans stage.
        this.demandes = [];
        this.enrichirEtudiantsAvecDemandes();
        this.prepareFilterOptions();
        this.appliquerFiltres();
        this.loading = false;
      }
    });
  }

  private enrichirEtudiantsAvecDemandes(): void {
    this.etudiants = this.etudiants.map(etudiant => {
      const demande = this.demandes.find(d => d.etudiantId === etudiant.id);

      return {
        ...etudiant,
        hasStage: !!demande,
        demandeId: demande?.id,
        sujetDemande: demande?.sujet,
        statutDemande: demande?.statut
      };
    });

    this.etudiantsFiltres = [...this.etudiants];
  }

  private loadPhotos(): void {
    this.etudiants.forEach(user => {
      if (!user || user.id == null) {
        return;
      }

      const id = user.id;

      this.utilisateurService.getPhoto(id).subscribe({
        next: (blob) => {
          const objectURL = URL.createObjectURL(blob);
          this.photos[id] = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        },
        error: () => {
          this.photos[id] = this.defaultPhoto;
        }
      });
    });
  }

  private prepareFilterOptions(): void {
    this.niveauxDisponibles = this.uniqueValues(this.etudiants.map(e => e.niveau));
    this.departementsDisponibles = this.uniqueValues(this.etudiants.map(e => e.departement));
    this.specialitesDisponibles = this.uniqueValues(this.etudiants.map(e => e.specialite));
    this.groupesDisponibles = this.uniqueValues(this.etudiants.map(e => e.groupe));
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
  // Filtres / recherche
  // ─────────────────────────────────────────────

  appliquerFiltres(): void {
    const term = this.searchTerm?.trim().toLowerCase();
    const f = this.filter;

    this.etudiantsFiltres = this.etudiants.filter(e => {

      if (term) {
        const nomComplet1 = `${e.prenom || ''} ${e.nom || ''}`.toLowerCase();
        const nomComplet2 = `${e.nom || ''} ${e.prenom || ''}`.toLowerCase();
        const email = (e.email || '').toLowerCase();
        const cin = (e.cin || '').toLowerCase();
        const groupe = (e.groupe || '').toLowerCase();
        const specialite = (e.specialite || '').toLowerCase();
        const sujet = (e.sujetDemande || '').toLowerCase();

        if (
          !nomComplet1.includes(term) &&
          !nomComplet2.includes(term) &&
          !email.includes(term) &&
          !cin.includes(term) &&
          !groupe.includes(term) &&
          !specialite.includes(term) &&
          !sujet.includes(term)
        ) {
          return false;
        }
      }

      if (f.niveau?.trim()) {
        if ((e.niveau || '').trim() !== f.niveau.trim()) return false;
      }

      if (f.departement?.trim()) {
        if ((e.departement || '').trim() !== f.departement.trim()) return false;
      }

      if (f.specialite?.trim()) {
        if ((e.specialite || '').trim() !== f.specialite.trim()) return false;
      }

      if (f.groupe?.trim()) {
        if ((e.groupe || '').trim() !== f.groupe.trim()) return false;
      }

      if (f.statutStage === 'AVEC_STAGE') {
        if (!e.hasStage) return false;
      }

      if (f.statutStage === 'SANS_STAGE') {
        if (e.hasStage) return false;
      }

      return true;
    });
  }

  resetFiltres(): void {
    this.searchTerm = '';
    this.filter = {};
    this.etudiantsFiltres = [...this.etudiants];
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.appliquerFiltres();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleStats(): void {
    this.showStats = !this.showStats;
  }

  get filtresActifsCount(): number {
    const champs: Array<keyof EtudiantFilter> = [
      'niveau',
      'departement',
      'specialite',
      'groupe',
      'statutStage'
    ];

    const countFilters = champs.filter(k => !!this.filter[k]?.trim()).length;
    const countSearch = this.searchTerm?.trim() ? 1 : 0;

    return countFilters + countSearch;
  }

  // ─────────────────────────────────────────────
  // Stats
  // ─────────────────────────────────────────────

  get totalEtudiants(): number {
    return this.etudiants.length;
  }

  get totalFiltres(): number {
    return this.etudiantsFiltres.length;
  }

  get etudiantsAvecStage(): number {
    return this.etudiants.filter(e => e.hasStage).length;
  }

  get etudiantsSansStage(): number {
    return this.etudiants.filter(e => !e.hasStage).length;
  }

  get etudiantsSansStageFiltres(): number {
    return this.etudiantsFiltres.filter(e => !e.hasStage).length;
  }

  get pourcentageSansStage(): string {
    if (!this.etudiants.length) return '0';
    return ((this.etudiantsSansStage / this.etudiants.length) * 100).toFixed(1);
  }

  countByNiveau(niveau: string): number {
    return this.etudiantsFiltres.filter(
      e => (e.niveau || '').trim().toLowerCase() === niveau.toLowerCase()
    ).length;
  }

  // ─────────────────────────────────────────────
  // Photo / UI
  // ─────────────────────────────────────────────

  getPhoto(id?: number): SafeUrl | string {
    if (id == null) {
      return this.defaultPhoto;
    }

    return this.photos[id] || this.defaultPhoto;
  }

  setGridView(): void {
    this.isGridView = true;
  }

  setListView(): void {
    this.isGridView = false;
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  statutStageLabel(e: Etudiant): string {
    if (!e.hasStage) {
      return 'Sans stage';
    }

    return e.statutDemande || 'Avec stage';
  }

  statutStageBadgeClass(e: Etudiant): string {
    if (!e.hasStage) {
      return 'badge bg-soft-danger text-danger';
    }

    switch (e.statutDemande) {
      case 'VALIDEE':
        return 'badge bg-soft-success text-success';
      case 'REFUSEE':
        return 'badge bg-soft-danger text-danger';
      case 'SOUMISE':
      case 'EN_ATTENTE':
        return 'badge bg-soft-warning text-warning';
      default:
        return 'badge bg-soft-primary text-primary';
    }
  }
}