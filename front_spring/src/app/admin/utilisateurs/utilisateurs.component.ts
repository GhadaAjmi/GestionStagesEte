import { Component, OnInit } from '@angular/core';
import { Utilisateur } from '../../models/utilisateur.models';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  styleUrl: './utilisateurs.component.css',
  standalone: false
})
export class UtilisateursComponent implements OnInit {
defaultPhoto = 'assets/images/avatar/undefined.jpg';

  utilisateurs:        Utilisateur[] = [];
  utilisateursFiltres: Utilisateur[] = [];

  // Recherche
  searchTerm:       string = '';

  // Filtre rôle
  roleSelectionne:  string = '';
  roles: string[]   = ['ADMIN', 'ENSEIGNANT', 'ETUDIANT', 'RESPONSABLE', 'CHEF_DEPARTEMENT', 'SERVICE_STAGE'];

  // Données pour les selects
  departements: string[] = ['Informatique', 'Industriel', 'Électrique'];

  // Vue : grid ou list
  isGridView:   boolean = true;

  // Toggle recherche
  isSearchOpen: boolean = false;

  // Photos
  photos: { [id: number]: SafeUrl } = {};

  // Modal détails
  selectedUtilisateur:        Utilisateur | null = null;
  selectedUtilisateurDetails: any                = null;
  loadingDetails:             boolean            = false;
  isDetailsModalOpen:         boolean            = false;

  // Modal modification
  editUtilisateur:  Utilisateur | null = null;
  isEditModalOpen:  boolean            = false;

  // Modal confirmation suppression
  utilisateurToDelete: Utilisateur | null = null;
  isDeleteModalOpen:   boolean            = false;

  constructor(
    private utilisateurService: UtilisateurService,
    private sanitizer:          DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  // ─── Chargement ───────────────────────────────────────────────────────────────

  loadUtilisateurs(): void {
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: data => {
        this.utilisateurs = data;
        this.appliquerFiltres();

        this.utilisateurs.forEach(user => {
          if (!user?.id) return;

          this.utilisateurService.getPhoto(user.id).subscribe({
            next: blob => {
              const objectURL = URL.createObjectURL(blob);
              this.photos[user.id!] = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            },
            error: () => {
              this.photos[user.id!] = 'assets/images/avatar/undefined.jpg';
            }
          });
        });
      },
      error: err => {
        console.error('Erreur lors du chargement des utilisateurs :', err);
      }
    });
  }

  // ─── Filtres & Recherche ──────────────────────────────────────────────────────

  onSearch(term: string): void {
    this.searchTerm = term;
    this.appliquerFiltres();
  }

  onRoleChange(role: string): void {
    this.roleSelectionne = role;
    this.appliquerFiltres();
  }

  appliquerFiltres(): void {
    const term = this.searchTerm?.toLowerCase();

    this.utilisateursFiltres = this.utilisateurs.filter(u => {

      const matchSearch = term
        ? (
            u.nom?.toLowerCase().includes(term)    ||
            u.prenom?.toLowerCase().includes(term) ||
            u.email?.toLowerCase().includes(term)  ||
            u.cin?.toLowerCase().includes(term)    ||
            u.role?.toLowerCase().includes(term)
          )
        : true;

      const matchRole = this.roleSelectionne
        ? u.role?.toUpperCase() === this.roleSelectionne
        : true;

      return matchSearch && matchRole;
    });
  }

  resetFiltres(): void {
    this.searchTerm      = '';
    this.roleSelectionne = '';
    this.appliquerFiltres();
  }

  // ─── Vues ─────────────────────────────────────────────────────────────────────

  setGridView():  void { this.isGridView  = true;  }
  setListView():  void { this.isGridView  = false; }
  toggleSearch(): void { this.isSearchOpen = !this.isSearchOpen; }

  // ─── Détails ──────────────────────────────────────────────────────────────────

  voirDetails(utilisateur: Utilisateur): void {
    this.selectedUtilisateur        = utilisateur;
    this.selectedUtilisateurDetails = null;
    this.loadingDetails             = true;
    this.isDetailsModalOpen         = true;
  }

  fermerDetails(): void {
    this.isDetailsModalOpen         = false;
    this.selectedUtilisateur        = null;
    this.selectedUtilisateurDetails = null;
    this.loadingDetails             = false;
  }

  // ─── Modification ─────────────────────────────────────────────────────────────

  ouvrirModification(utilisateur: Utilisateur): void {
    this.editUtilisateur = { ...utilisateur };
    this.isEditModalOpen = true;
  }

  fermerModification(): void {
    this.isEditModalOpen = false;
    this.editUtilisateur = null;
  }

  sauvegarderModification(): void {
    if (!this.editUtilisateur?.id) return;

    // ✅ updateUtilisateur (nom correct dans UtilisateurService)
    this.utilisateurService.updateUtilisateur(this.editUtilisateur.id, this.editUtilisateur).subscribe({
      next: updated => {
        const index = this.utilisateurs.findIndex(u => u.id === this.editUtilisateur!.id);
        if (index !== -1) {
          this.utilisateurs[index] = { ...updated };
        }
        this.appliquerFiltres();
        this.fermerModification();
      },
      error: err => {
        console.error('Erreur lors de la modification :', err);
      }
    });
  }

  // ─── Suppression ──────────────────────────────────────────────────────────────

  confirmerSuppression(utilisateur: Utilisateur): void {
    this.utilisateurToDelete = utilisateur;
    this.isDeleteModalOpen   = true;
  }

  annulerSuppression(): void {
    this.isDeleteModalOpen   = false;
    this.utilisateurToDelete = null;
  }

  supprimerUtilisateur(): void {
    if (!this.utilisateurToDelete?.id) return;

    // ✅ deleteUtilisateur (nom correct dans UtilisateurService)
    this.utilisateurService.deleteUtilisateur(this.utilisateurToDelete.id).subscribe({
      next: () => {
        this.utilisateurs = this.utilisateurs.filter(u => u.id !== this.utilisateurToDelete!.id);
        this.appliquerFiltres();
        this.annulerSuppression();
      },
      error: err => {
        console.error('Erreur lors de la suppression :', err);
      }
    });
  }

  // ─── Utilitaires ──────────────────────────────────────────────────────────────

  getRoleBadgeClass(role: string): string {
    switch (role?.toUpperCase()) {
      case 'ADMIN':            return 'badge bg-danger-subtle text-danger';
      case 'ENSEIGNANT':       return 'badge bg-primary-subtle text-primary';
      case 'ETUDIANT':         return 'badge bg-success-subtle text-success';
      case 'RESPONSABLE':      return 'badge bg-warning-subtle text-warning';
      case 'CHEF_DEPARTEMENT': return 'badge bg-danger-subtle text-danger';
      case 'SERVICE_STAGE':    return 'badge bg-info-subtle text-info';
      default:                 return 'badge bg-secondary-subtle text-secondary';
    }
  }

  getStatusBadgeClass(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'ACCEPTE': case 'ACCEPTÉ':  return 'badge bg-success-subtle text-success';
      case 'REFUSE':  case 'REFUSÉ':   return 'badge bg-danger-subtle text-danger';
      case 'EN_ATTENTE':               return 'badge bg-warning-subtle text-warning';
      case 'EN_COURS':                 return 'badge bg-info-subtle text-info';
      case 'TERMINE': case 'TERMINÉ':  return 'badge bg-primary-subtle text-primary';
      default:                         return 'badge bg-secondary-subtle text-secondary';
    }
  }

  countByRole(role: string): number {
    if (!role) return this.utilisateurs.length;
    return this.utilisateurs.filter(u => u.role?.toUpperCase() === role).length;
  }
}