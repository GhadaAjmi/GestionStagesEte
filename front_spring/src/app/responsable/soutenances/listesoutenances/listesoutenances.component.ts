import { Component, OnInit } from '@angular/core';
import { Soutenance, SoutenanceFilter } from '../../../models/soutenance';
import { Enseignant } from '../../../models/enseignant';
import { StatutSoutenance } from '../../../models/enums';
import { Router } from '@angular/router';
import { Salle } from '../../../models/salle copy';
import { SoutenanceService } from '../../../services/soutenance.service';
import { UtilisateurService } from '../../../services/utilisateur.service';


interface GroupeING1 {
  nom: string;
  departement: string;
  specialite: string;
  soutenances: Soutenance[];
}


@Component({
  selector: 'app-listesoutenances',
  templateUrl: './listesoutenances.component.html',
  styleUrl: './listesoutenances.component.css',
  standalone: false
})
export class ListesoutenancesComponent implements OnInit {


  // ── Données brutes (jamais modifiées après load) ──────────────────────────
  soutenances: Soutenance[] = [];

  // ── Données affichées (résultat du filtre) ────────────────────────────────
  filteredSoutenances: Soutenance[] = [];

  // ── Niveau actif (header dropdown) ───────────────────────────────────────
  selectedNiveau = '';

  // ── Panneaux ──────────────────────────────────────────────────────────────
  showStats   = false;
  showFilters = false;

  // ── Filtre courant ────────────────────────────────────────────────────────
  filter: SoutenanceFilter = {};

  // ── UI state ──────────────────────────────────────────────────────────────
  loading = false;
  error: string | null = null;

  // ── Accordéon ING1 ────────────────────────────────────────────────────────
  private openedGroupes = new Set<string>();

  // ── Modal détail ──────────────────────────────────────────────────────────
  showDetailModal    = false;
  selectedSoutenance: Soutenance | null = null;
  detailLoading      = false;
  detailError: string | null = null;

  // ── Référentiels ──────────────────────────────────────────────────────────
  salles: Salle[] = [];
  enseignantsDisponibles: Enseignant[] = [];

  // ── Listes dynamiques pour les <select> des filtres ───────────────────────
  niveauxDisponibles:      string[] = [];
  groupesDisponibles:      string[] = [];
  departementsDisponibles: string[] = [];
  specialitesDisponibles:  string[] = [];

  constructor(
    private soutenanceService: SoutenanceService,
    private utilisateurService: UtilisateurService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadSalles();
    this.loadEnseignants();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHARGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  load(): void {
    this.loading = true;
    this.error   = null;

    this.soutenanceService.getAll().subscribe({
      next: (data) => {
        this.soutenances = data;
        this.loading     = false;

        // ── LOG DIAGNOSTIC ────────────────────────────────────────────────
        console.log(`%c[Soutenances] ${data.length} chargées`, 'color:#2196F3;font-weight:bold');

        if (data.length > 0) {
          // Objet brut complet du premier élément — révèle les vrais noms de champs backend
          console.log('[Soutenances] Objet brut [0] :', JSON.parse(JSON.stringify(data[0])));

          // Table récap : vérifier que les champs "étudiant" sont bien remplis
          console.table(
            data.slice(0, 10).map(s => ({
              id:                  s.id,
              statut:              s.statut,
              etudiantNom:         s.etudiantNom         ?? '⚠️ vide',
              etudiantPrenom:      s.etudiantPrenom      ?? '⚠️ vide',
              etudiantNiveau:      s.etudiantNiveau      ?? '⚠️ vide',
              etudiantGroupe:      s.etudiantGroupe      ?? '⚠️ vide',
              etudiantDepartement: s.etudiantDepartement ?? '⚠️ vide',
              etudiantSpecialite:  s.etudiantSpecialite  ?? '⚠️ vide',
            }))
          );
        }
        // ─────────────────────────────────────────────────────────────────

        this.loadGroupes();
        this.loadSpecialites();
        this.loadDepartements();

        this.applyFilters();
      },
      error: (err) => {
        this.error   = 'Erreur lors du chargement des soutenances.';
        this.loading = false;
        console.error('[Soutenances] ❌ getAll()', err);
      }
    });
  }

  private loadSalles(): void {
    this.soutenanceService.getSalles().subscribe({
      next:  (s) => { this.salles = s; },
      error: (e) => console.error('[Soutenances] ❌ getSalles()', e)
    });
  }

  private loadEnseignants(): void {
    this.utilisateurService.getUtilisateursByRole('ENSEIGNANT').subscribe({
      next:  (e) => { this.enseignantsDisponibles = e as Enseignant[]; },
      error: (e) => console.error('[Soutenances] ❌ getEnseignants()', e)
    });
  }
private loadGroupes(): void {
    this.utilisateurService.getGroupes(this.filter).subscribe({
      next:  (g) => { this.groupesDisponibles = g; },
      error: (e) => console.error('[Soutenances] ❌ getGroupes()', e)
    });
  }
  private loadSpecialites(): void {
    this.utilisateurService.getSpecialites(this.filter).subscribe({
      next:  (s) => { this.specialitesDisponibles = s; },
      error: (e) => console.error('[Soutenances] ❌ getSpecialites()', e)
    });
  }
    private loadDepartements(): void {
    this.utilisateurService.getDepartements().subscribe({
      next:  (d) => { this.departementsDisponibles = d; },
      error: (e) => console.error('[Soutenances] ❌ getDepartements()', e)
    });
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // FILTRAGE  ← tout passe par ici, règle = filtre vide = inactif
  // ═══════════════════════════════════════════════════════════════════════════

  applyFilters(): void {
    const f = this.filter;

    // Niveau : le header dropdown a priorité sur le champ filtre
    const niveauActif = (this.selectedNiveau || f.niveau || '').trim().toLowerCase();

    this.filteredSoutenances = this.soutenances.filter(s => {

      // Niveau
      if (niveauActif) {
        if ((s.etudiantNiveau ?? '').trim().toLowerCase() !== niveauActif) return false;
      }

      // Groupe (contient, insensible à la casse)
      if (f.groupe?.trim()) {
        const gr = (s.etudiantGroupe ?? '').trim().toLowerCase();
        if (!gr.includes(f.groupe.trim().toLowerCase())) return false;
      }

      // Département
      if (f.departement?.trim()) {
        const dept = (s.etudiantDepartement ?? '').trim().toLowerCase();
        if (!dept.includes(f.departement.trim().toLowerCase())) return false;
      }

      // Spécialité
      if (f.specialite?.trim()) {
        const spec = (s.etudiantSpecialite ?? '').trim().toLowerCase();
        if (!spec.includes(f.specialite.trim().toLowerCase())) return false;
      }

      // Statut
      if (f.statut?.trim()) {
        if (s.statut !== f.statut.trim()) return false;
      }

      // Date (égalité stricte sur la chaîne ISO)
      if (f.date?.trim()) {
        if (s.date !== f.date.trim()) return false;
      }

      // Salle
      if (f.salleCode?.trim()) {
        if ((s.codeSalle ?? '').trim() !== f.salleCode.trim()) return false;
      }

      // Sujet OU nom/prénom étudiant
      if (f.etudiant?.trim()) {
        const q     = f.etudiant.trim().toLowerCase();
        const nom   = `${s.etudiantPrenom ?? ''} ${s.etudiantNom ?? ''}`.toLowerCase();
        const sujet = (s.sujetDemande ?? '').toLowerCase();
        if (!nom.includes(q) && !sujet.includes(q)) return false;
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
      `[Soutenances] applyFilters → ${this.filteredSoutenances.length}/${this.soutenances.length}`,
      { niveauActif: niveauActif || '(tous)', ...f }
    );
  }

  resetFilters(): void {
    this.filter              = {};
    this.selectedNiveau      = '';
    this.filteredSoutenances = [...this.soutenances];
    console.log('[Soutenances] reset → toutes les soutenances affichées :', this.filteredSoutenances.length);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NIVEAU (header dropdown)
  // ═══════════════════════════════════════════════════════════════════════════

  setNiveau(niveau: string): void {
    this.selectedNiveau = niveau;
    this.filter.niveau  = niveau;
    console.log('[Soutenances] setNiveau →', niveau || '(tous)');
    this.applyFilters();
  }

  onFilterNiveauChange(): void {
    this.selectedNiveau = this.filter.niveau ?? '';
    this.applyFilters();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════════════════════════════════════════

  toggleStats():   void { this.showStats   = !this.showStats;   }
  toggleFilters(): void { this.showFilters = !this.showFilters; }

  get soutenancesFiltreesNiveau(): Soutenance[] {
    if (!this.selectedNiveau) return this.soutenances;
    return this.soutenances.filter(
      s => (s.etudiantNiveau ?? '').trim().toLowerCase() === this.selectedNiveau.toLowerCase()
    );
  }

  countByStatutFiltered(statut: string): number {
    return this.soutenancesFiltreesNiveau.filter(s => s.statut === statut).length;
  }

  annuleePercentFiltered(): string {
    const total = this.soutenancesFiltreesNiveau.length;
    if (!total) return '0';
    return ((this.countByStatutFiltered('ANNULEE') / total) * 100).toFixed(1);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ING1 GROUPES
  // ═══════════════════════════════════════════════════════════════════════════

get groupesING1(): GroupeING1[] {
  const ing1 = this.filteredSoutenances.filter(
    s => (s.etudiantNiveau ?? '').trim().toLowerCase() === 'ing1'
  );

  const map = new Map<string, GroupeING1>();

  for (const s of ing1) {
    const groupe = (s.etudiantGroupe ?? 'Sans groupe').trim();
    const departement = (s.etudiantDepartement ?? 'Sans département').trim();
    const specialite = (s.etudiantSpecialite ?? 'Sans spécialité').trim();

    // Clé unique : groupe + département + spécialité
    const key = `${groupe}|${departement}|${specialite}`;

    if (!map.has(key)) {
      map.set(key, {
        nom: groupe,
        departement,
        specialite,
        soutenances: []
      });
    }

    map.get(key)!.soutenances.push(s);
  }

  return [...map.values()].sort((a, b) => {
    const cmpDept = a.departement.localeCompare(b.departement);
    if (cmpDept !== 0) return cmpDept;

    const cmpSpec = a.specialite.localeCompare(b.specialite);
    if (cmpSpec !== 0) return cmpSpec;

    return a.nom.localeCompare(b.nom);
  });
}

  groupesING1Count(): number { return this.groupesING1.length; }

  soutenancesING2Count(): number {
    return this.filteredSoutenances.filter(
      s => (s.etudiantNiveau ?? '').trim().toLowerCase() === 'ing2'
    ).length;
  }

  toggleGroupe(nom: string): void {
    this.openedGroupes.has(nom) ? this.openedGroupes.delete(nom) : this.openedGroupes.add(nom);
  }

  groupeOuvert(nom: string): boolean { return this.openedGroupes.has(nom); }
 
  replanifierGroupe(groupe: GroupeING1): void {
  if (!groupe.soutenances || groupe.soutenances.length === 0) {
    alert('Aucune soutenance trouvée pour ce groupe.');
    return;
  }

  const soutenanceRef = groupe.soutenances[0];

  if (!soutenanceRef.id) {
    alert('ID de soutenance introuvable.');
    return;
  }

  this.router.navigate([
    '/responsable/soutenances/edit-groupe',
    soutenanceRef.id
  ]);
}
  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  openEdit(s: Soutenance): void {
    this.router.navigate(['/responsable/soutenances/edit', s.id]);
  }

  changerStatut(id: number, statut: string): void {
    console.log(`[Soutenances] changerStatut #${id} → ${statut}`);
    this.soutenanceService.updateStatut(id, statut).subscribe({
      next: () => {
        console.log(`[Soutenances] ✅ Statut #${id} mis à jour`);
        this.load(); // rechargement complet → données fraîches
      },
      error: (err) => console.error(`[Soutenances] ❌ changerStatut #${id}`, err)
    });
  }

  supprimer(s: Soutenance): void {
    if (!confirm(`Supprimer la soutenance #${s.id} ?`)) return;
    const id = s.id;
    if (id == null) { alert('ID introuvable.'); return; }

    this.soutenanceService.delete(id).subscribe({
      next: () => {
        this.soutenances = this.soutenances.filter(x => x.id !== id);
        this.applyFilters();
      },
      error: (err) => console.error(`[Soutenances] ❌ supprimer #${id}`, err)
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODAL DÉTAIL
  // ═══════════════════════════════════════════════════════════════════════════

  openDetail(s: Soutenance): void {
    this.selectedSoutenance = s;
    this.showDetailModal    = true;
    this.detailError        = null;
    document.body.style.overflow = 'hidden';

    if (s.id == null) { alert('ID introuvable.'); return; }
    this.detailLoading = true;

    this.soutenanceService.getById(s.id).subscribe({
      next: (full) => {
        this.selectedSoutenance = full;
        this.detailLoading      = false;
      },
      error: () => {
        this.detailLoading = false;
        this.detailError   = 'Impossible de charger les détails.';
      }
    });
  }

  closeDetail(): void {
    this.showDetailModal    = false;
    this.selectedSoutenance = null;
    this.detailError        = null;
    document.body.style.overflow = '';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  heureFinCalc(heureDebut: string, duree: number): string {
    if (!heureDebut || !duree) return '--:--';
    const [h, m]   = heureDebut.split(':').map(Number);
    const totalMin = h * 60 + m + duree;
    return `${String(Math.floor(totalMin / 60) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
  }

  initials(m: { nomEnseignant?: string; prenomEnseignant?: string }): string {
    return ((m.prenomEnseignant?.[0] ?? '') + (m.nomEnseignant?.[0] ?? '')).toUpperCase() || '?';
  }

  statutBadgeClass(statut: string): string {
    return ({
      PLANIFIEE: 'badge bg-soft-warning text-warning',
      VALIDEE:   'badge bg-soft-success text-success',
      ANNULEE:   'badge bg-soft-danger text-danger',
    } as Record<string, string>)[statut] ?? 'badge bg-soft-secondary text-secondary';
  }

  statutLabel(statut: string): string {
    return ({
      PLANIFIEE: 'Planifiée',
      VALIDEE:   'Validée',
      ANNULEE:   'Annulée',
    } as Record<string, string>)[statut] ?? statut;
  }

  /** Nombre de filtres actifs (pour afficher un badge sur le bouton filtre) */
  get filtresActifsCount(): number {
    const f = this.filter as any;
    const champsFiltres = ['date','salleCode','statut','niveau','groupe','departement','specialite','etudiant','heureDebut','heureFin'];
    return champsFiltres.filter(k => !!f[k]?.trim?.()).length + (this.selectedNiveau ? 1 : 0);
  }
}