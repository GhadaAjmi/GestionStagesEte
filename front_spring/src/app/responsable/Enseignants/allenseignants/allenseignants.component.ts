import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { Enseignant } from '../../../models/enseignant';
import { UtilisateurService } from '../../../services/utilisateur.service';

@Component({
  selector: 'app-allenseignants',
  templateUrl: './allenseignants.component.html',
  styleUrls: ['./allenseignants.component.css'],
  standalone: false
})
export class AllenseignantsComponent implements OnInit {

  enseignants: Enseignant[] = [];
  enseignantsFiltres: Enseignant[] = [];

  // Recherche
  searchTerm: string = '';

  // Vue : grid ou list
  isGridView: boolean = true;

  // Toggle recherche
  isSearchOpen: boolean = false;

  // Peut contenir soit une image sécurisée, soit une image par défaut
  photos: { [id: number]: SafeUrl | string } = {};

  readonly defaultPhoto: string = 'assets/images/avatar/undefined.jpg';

  constructor(
    private utilisateurService: UtilisateurService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadEnseignants();
  }

  resetFiltres(): void {
    this.searchTerm = '';
    this.appliquerFiltres();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.appliquerFiltres();
  }

  appliquerFiltres(): void {
    const term = this.searchTerm?.toLowerCase();

    this.enseignantsFiltres = this.enseignants.filter(e => {
      const matchSearch = term
        ? (
            e.nom?.toLowerCase().includes(term) ||
            e.prenom?.toLowerCase().includes(term) ||
            e.domaine?.toLowerCase().includes(term) ||
            e.grade?.toLowerCase().includes(term) ||
            e.email?.toLowerCase().includes(term)
          )
        : true;

      return matchSearch;
    });
  }

  loadEnseignants(): void {
    this.utilisateurService.getUtilisateursByRole('ENSEIGNANT').subscribe({
      next: (data) => {
        this.enseignants = data as Enseignant[];
        this.enseignantsFiltres = [...this.enseignants];
        this.appliquerFiltres();

        this.enseignants.forEach(user => {
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
      },
      error: (err) => {
        console.error('Erreur lors du chargement des enseignants :', err);
      }
    });
  }

  getPhoto(id?: number): SafeUrl | string {
    if (id == null) {
      return this.defaultPhoto;
    }

    return this.photos[id] || this.defaultPhoto;
  }

  // Toggle grid/list view
  setGridView(): void {
    this.isGridView = true;
  }

  setListView(): void {
    this.isGridView = false;
  }

  // Toggle formulaire recherche
  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }
}