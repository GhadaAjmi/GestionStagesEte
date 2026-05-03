import { Component, OnInit } from '@angular/core';
import { Entreprise } from '../../models/entreprise';
import { EntrepriseService } from '../../services/entreprise.service';

interface EntrepriseFilter {
  nom?: string;
  adresse?: string;
  recherche?: string;
}

@Component({
  selector: 'app-liste-entreprises',
  templateUrl: './liste-entreprises.component.html',
  styleUrls: ['./liste-entreprises.component.css'],
  standalone: false
})
export class ListeEntreprisesComponent implements OnInit {

  entreprises: Entreprise[] = [];
  filteredEntreprises: Entreprise[] = [];

  loading = false;
  error: string | null = null;

  showFilters = false;

  filter: EntrepriseFilter = {};

  constructor(
    private entrepriseService: EntrepriseService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.entrepriseService.getAll().subscribe({
      next: (data: Entreprise[]) => {
        this.entreprises = data || [];
        this.filteredEntreprises = [...this.entreprises];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement entreprises :', err);
        this.error = 'Erreur lors du chargement des entreprises.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const f = this.filter;

    this.filteredEntreprises = this.entreprises.filter(e => {
      if (f.recherche?.trim()) {
        const q = f.recherche.trim().toLowerCase();

        const nom = (e.nom || '').toLowerCase();
        const adresse = (e.adresse || '').toLowerCase();
        const representant = (e.representant || '').toLowerCase();
        const email = (e.email || '').toLowerCase();
        const telephone = (e.telephone || '').toLowerCase();
        const fax = (e.fax || '').toLowerCase();

        if (
          !nom.includes(q) &&
          !adresse.includes(q) &&
          !representant.includes(q) &&
          !email.includes(q) &&
          !telephone.includes(q) &&
          !fax.includes(q)
        ) {
          return false;
        }
      }

      if (f.nom?.trim()) {
        const nom = (e.nom || '').toLowerCase();

        if (!nom.includes(f.nom.trim().toLowerCase())) {
          return false;
        }
      }

      if (f.adresse?.trim()) {
        const adresse = (e.adresse || '').toLowerCase();

        if (!adresse.includes(f.adresse.trim().toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }

  resetFilters(): void {
    this.filter = {};
    this.filteredEntreprises = [...this.entreprises];
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  get filtresActifsCount(): number {
    const champs: Array<keyof EntrepriseFilter> = [
      'recherche',
      'nom',
      'adresse'
    ];

    return champs.filter(k => !!this.filter[k]?.trim()).length;
  }
}