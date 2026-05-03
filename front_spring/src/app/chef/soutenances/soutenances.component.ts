import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StatutSoutenance } from '../../models/enums';
import { Soutenance, SoutenanceFilter } from '../../models/soutenance';
import { Enseignant } from '../../models/enseignant';
import { Salle } from '../../models/salle copy';
import { SoutenanceService } from '../../services/soutenance.service';
import { UtilisateurService } from '../../services/utilisateur.service';


@Component({
  selector: 'app-soutenances',
  templateUrl: './soutenances.component.html',
  styleUrl: './soutenances.component.css',
  standalone: false 
})
export class SoutenancesComponent implements OnInit {


  // Données brutes ING2
  soutenances: Soutenance[] = [];

  // Données affichées après filtre
  filteredSoutenances: Soutenance[] = [];

  // UI
  loading = false;
  error: string | null = null;

  showStats = false;
  showFilters = false;

  // Filtres
  filter: SoutenanceFilter = {};

  // Modal détail
  showDetailModal = false;
  selectedSoutenance: Soutenance | null = null;
  detailLoading = false;
  detailError: string | null = null;

  // Référentiels
  salles: Salle[] = [];
  enseignantsDisponibles: Enseignant[] = [];

  // Options dynamiques
  groupesDisponibles: string[] = [];
  departementsDisponibles: string[] = [];
  specialitesDisponibles: string[] = [];

  constructor(
    private soutenanceService: SoutenanceService,
    private utilisateurService: UtilisateurService,
    private groupeService: UtilisateurService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadSalles();
    this.loadEnseignants();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHARGEMENT DES SOUTENANCES ING2
  // ═══════════════════════════════════════════════════════════════════════════

  load(): void {
    this.loading = true;
    this.error = null;

    this.soutenanceService.getIng2().subscribe({
      next: (data) => {
        this.soutenances = data;
        this.filteredSoutenances = [...data];
        this.loading = false;

        console.log(
          `%c[Soutenances ING2] ${data.length} chargées`,
          'color:#2196F3;font-weight:bold'
        );

        if (data.length > 0) {
          console.log('[Soutenances ING2] Objet brut [0] :', JSON.parse(JSON.stringify(data[0])));

          console.table(
            data.slice(0, 10).map(s => ({
              id: s.id,
              statut: s.statut,
              etudiantNom: s.etudiantNom ?? 'vide',
              etudiantPrenom: s.etudiantPrenom ?? 'vide',
              etudiantNiveau: s.etudiantNiveau ?? 'vide',
              etudiantGroupe: s.etudiantGroupe ?? 'vide',
              etudiantDepartement: s.etudiantDepartement ?? 'vide',
              etudiantSpecialite: s.etudiantSpecialite ?? 'vide',
            }))
          );
        }

        this.loadDepartements();
        this.loadGroupes();
        this.loadSpecialites();
        this.applyFilters();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des soutenances ING2.';
        this.loading = false;
        console.error('[Soutenances ING2] getIng2()', err);
      }
    });
  }

  private loadSalles(): void {
    this.soutenanceService.getSalles().subscribe({
      next: (salles) => {
        this.salles = salles;
      },
      error: (err) => {
        console.error('[Soutenances ING2] getSalles()', err);
      }
    });
  }

  private loadEnseignants(): void {
    this.utilisateurService.getUtilisateursByRole('ENSEIGNANT').subscribe({
      next: (enseignants) => {
        this.enseignantsDisponibles = enseignants as Enseignant[];
      },
      error: (err) => {
        console.error('[Soutenances ING2] getEnseignants()', err);
      }
    });
  }

private loadGroupes(): void {
    this.groupeService.getGroupes(this.filter).subscribe({
      next:  (g) => { this.groupesDisponibles = g; },
      error: (e) => console.error('[Soutenances] ❌ getGroupes()', e)
    });
  }
  private loadSpecialites(): void {
    this.groupeService.getSpecialites(this.filter).subscribe({
      next:  (s) => { this.specialitesDisponibles = s; },
      error: (e) => console.error('[Soutenances] ❌ getSpecialites()', e)
    });
  }
    private loadDepartements(): void {
    this.groupeService.getDepartements().subscribe({
      next:  (d) => { this.departementsDisponibles = d; },
      error: (e) => console.error('[Soutenances] ❌ getDepartements()', e)
    });
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // FILTRAGE
  // ═══════════════════════════════════════════════════════════════════════════

  applyFilters(): void {
    const f = this.filter;

    this.filteredSoutenances = this.soutenances.filter(s => {

      // Sécurité : garder seulement ING2 même si le backend renvoie autre chose
      if ((s.etudiantNiveau ?? '').trim().toLowerCase() !== 'ing2') {
        return false;
      }

      // Groupe
      if (f.groupe?.trim()) {
        const groupe = (s.etudiantGroupe ?? '').trim().toLowerCase();
        if (!groupe.includes(f.groupe.trim().toLowerCase())) return false;
      }

      // Département
      if (f.departement?.trim()) {
        const departement = (s.etudiantDepartement ?? '').trim().toLowerCase();
        if (!departement.includes(f.departement.trim().toLowerCase())) return false;
      }

      // Spécialité
      if (f.specialite?.trim()) {
        const specialite = (s.etudiantSpecialite ?? '').trim().toLowerCase();
        if (!specialite.includes(f.specialite.trim().toLowerCase())) return false;
      }

      // Statut
      if (f.statut?.trim()) {
        if (s.statut !== f.statut.trim()) return false;
      }

      // Date
      if (f.date?.trim()) {
        if (s.date !== f.date.trim()) return false;
      }

      // Salle
      if (f.salleCode?.trim()) {
        if ((s.codeSalle ?? '').trim() !== f.salleCode.trim()) return false;
      }

      // Recherche étudiant ou sujet
      if (f.etudiant?.trim()) {
        const q = f.etudiant.trim().toLowerCase();
        const nomComplet = `${s.etudiantPrenom ?? ''} ${s.etudiantNom ?? ''}`.toLowerCase();
        const sujet = (s.sujetDemande ?? '').toLowerCase();

        if (!nomComplet.includes(q) && !sujet.includes(q)) return false;
      }

      // Heure début
      if (f.heureDebut?.trim()) {
        if ((s.heureDebut ?? '') < f.heureDebut) return false;
      }

      // Heure fin
      if (f.heureFin?.trim()) {
        if (this.heureFinCalc(s.heureDebut, s.duree) > f.heureFin) return false;
      }

      return true;
    });

    console.log(
      `[Soutenances ING2] applyFilters → ${this.filteredSoutenances.length}/${this.soutenances.length}`,
      f
    );
  }

  resetFilters(): void {
    this.filter = {};
    this.filteredSoutenances = [...this.soutenances];

    console.log(
      '[Soutenances ING2] reset → toutes les soutenances ING2 affichées :',
      this.filteredSoutenances.length
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════════════════════════════════════════

  toggleStats(): void {
    this.showStats = !this.showStats;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  countByStatutFiltered(statut: string): number {
    return this.filteredSoutenances.filter(s => s.statut === statut).length;
  }

  annuleePercentFiltered(): string {
    const total = this.filteredSoutenances.length;

    if (!total) return '0';

    return ((this.countByStatutFiltered('ANNULEE') / total) * 100).toFixed(1);
  }

  soutenancesING2Count(): number {
    return this.filteredSoutenances.length;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  openEdit(s: Soutenance): void {
    this.router.navigate(['/chef_departement/soutenances/edit', s.id]);
  }

  changerStatut(id: number, statut: string): void {
    console.log(`[Soutenances ING2] changerStatut #${id} → ${statut}`);

    this.soutenanceService.updateStatut(id, statut).subscribe({
      next: () => {
        console.log(`[Soutenances ING2] Statut #${id} mis à jour`);
        this.load();
      },
      error: (err) => {
        console.error(`[Soutenances ING2] changerStatut #${id}`, err);
      }
    });
  }

  supprimer(s: Soutenance): void {
    if (!confirm(`Supprimer la soutenance #${s.id} ?`)) return;

    const id = s.id;

    if (id == null) {
      alert('ID introuvable.');
      return;
    }

    this.soutenanceService.delete(id).subscribe({
      next: () => {
        this.soutenances = this.soutenances.filter(x => x.id !== id);
        this.loadDepartements();
        this.loadGroupes();
        this.loadSpecialites();
        this.applyFilters();
      },
      error: (err) => {
        console.error(`[Soutenances ING2] supprimer #${id}`, err);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODAL DÉTAIL
  // ═══════════════════════════════════════════════════════════════════════════

  openDetail(s: Soutenance): void {
    this.selectedSoutenance = s;
    this.showDetailModal = true;
    this.detailError = null;
    document.body.style.overflow = 'hidden';

    if (s.id == null) {
      alert('ID introuvable.');
      return;
    }

    this.detailLoading = true;

    this.soutenanceService.getById(s.id).subscribe({
      next: (full) => {
        this.selectedSoutenance = full;
        this.detailLoading = false;
      },
      error: (err) => {
        this.detailLoading = false;
        this.detailError = 'Impossible de charger les détails.';
        console.error('[Soutenances ING2] getById()', err);
      }
    });
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedSoutenance = null;
    this.detailError = null;
    document.body.style.overflow = '';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  heureFinCalc(heureDebut: string, duree: number): string {
    if (!heureDebut || !duree) return '--:--';

    const [h, m] = heureDebut.split(':').map(Number);
    const totalMin = h * 60 + m + duree;

    return `${String(Math.floor(totalMin / 60) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
  }

  initials(m: { nomEnseignant?: string; prenomEnseignant?: string }): string {
    return ((m.prenomEnseignant?.[0] ?? '') + (m.nomEnseignant?.[0] ?? '')).toUpperCase() || '?';
  }

  statutBadgeClass(statut: string): string {
    return ({
      PLANIFIEE: 'badge bg-soft-warning text-warning',
      VALIDEE: 'badge bg-soft-success text-success',
      ANNULEE: 'badge bg-soft-danger text-danger',
    } as Record<string, string>)[statut] ?? 'badge bg-soft-secondary text-secondary';
  }

  statutLabel(statut: string): string {
    return ({
      PLANIFIEE: 'Planifiée',
      VALIDEE: 'Validée',
      ANNULEE: 'Annulée',
    } as Record<string, string>)[statut] ?? statut;
  }

  get filtresActifsCount(): number {
    const f = this.filter as any;
    const champsFiltres = [
      'date',
      'salleCode',
      'statut',
      'groupe',
      'departement',
      'specialite',
      'etudiant',
      'heureDebut',
      'heureFin'
    ];

    return champsFiltres.filter(k => !!f[k]?.trim?.()).length;
  }
}