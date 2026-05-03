import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { FavoriService } from '../../services/favori.service';
import { DocumentDemande } from '../../models/document';

@Component({
  selector: 'app-consultationdocs',
  templateUrl: './consultationdocs.component.html',
  styleUrls: ['./consultationdocs.component.css']
})
export class ConsultationdocsComponent implements OnInit {

  travaux: DocumentDemande[] = [];
  travauxFiltres: DocumentDemande[] = [];
  favorisIds: number[] = [];

  annees: number[] = [];
  types: string[] = ['POSTER', 'RAPPORT', 'PRESENTATION'];

  selectedAnnee: number | null = null;
  selectedType: string | null = null;
  showStarredOnly: boolean = false;
  searchTerm: string = '';
  isSearchOpen: boolean = false;
  isGridView: boolean = true;

  constructor(
    private docService: DocumentService,
    private favoriService: FavoriService
  ) {}

  ngOnInit(): void {
    console.log('[ConsultationDocs] ngOnInit démarré');

    this.genererAnnees();

    console.log('[ConsultationDocs] Années générées:', this.annees);

    this.chargerFavorisEtDocuments();
  }

  chargerFavorisEtDocuments(): void {
    console.log('[ConsultationDocs] Chargement favoris...');

    this.favoriService.getMesFavorisIds().subscribe({
      next: (favIds) => {
        console.log('[ConsultationDocs] Favoris récupérés:', favIds);

        this.favorisIds = favIds ?? [];

        this.chargerDocuments();
      },
      error: (err) => {
        console.error('[ConsultationDocs] Erreur chargement favoris:', err);

        console.warn(
          '[ConsultationDocs] On continue quand même le chargement des documents sans favoris.'
        );

        this.favorisIds = [];

        this.chargerDocuments();
      }
    });
  }

  private chargerDocuments(): void {
    console.log('[ConsultationDocs] Chargement documents archives...');

    this.docService.getArchives().subscribe({
      next: (docs) => {
        console.log('[ConsultationDocs] Documents reçus depuis backend:', docs);
        console.log('[ConsultationDocs] Nombre documents reçus:', docs?.length);

        if (!docs || docs.length === 0) {
          console.warn('[ConsultationDocs] Aucun document reçu depuis getArchives()');
        }

        this.travaux = (docs ?? []).map(d => {
          const mapped = {
            ...d,
            starred: d.id ? this.favorisIds.includes(d.id) : false,
            iconFile: this.getIconFile(d.type),
            badgeClass: this.getBadgeClass(d.type)
          };

          console.log('[ConsultationDocs] Document mappé:', mapped);

          return mapped;
        });

        console.log('[ConsultationDocs] Travaux après mapping:', this.travaux);

        this.appliquerFiltres();
      },
      error: (err) => {
        console.error('[ConsultationDocs] Erreur chargement documents archives:', err);

        this.travaux = [];
        this.travauxFiltres = [];
      }
    });
  }

  getIconFile(type?: string): string {
    switch (type) {
      case 'RAPPORT':
        return 'assets/images/file-icons/pdf.png';
      case 'POSTER':
        return 'assets/images/file-icons/pdf.png';
      case 'PRESENTATION':
        return 'assets/images/file-icons/pptx.png';
      default:
        console.warn('[ConsultationDocs] Type inconnu pour iconFile:', type);
        return 'assets/images/file-icons/file.png';
    }
  }

  getBadgeClass(type?: string): string {
    switch (type) {
      case 'RAPPORT':
        return 'bg-primary';
      case 'POSTER':
        return 'bg-info';
      case 'PRESENTATION':
        return 'bg-success';
      default:
        console.warn('[ConsultationDocs] Type inconnu pour badgeClass:', type);
        return 'bg-secondary';
    }
  }

  toggleStar(t: DocumentDemande): void {
    console.log('[ConsultationDocs] Toggle favori document:', t);

    if (!t.id) {
      console.error('[ConsultationDocs] Impossible toggle favori: document sans id', t);
      return;
    }

    this.favoriService.toggleFavori(t.id).subscribe({
      next: (isFav) => {
        console.log('[ConsultationDocs] Résultat toggle favori:', isFav);

        t.starred = isFav;

        if (isFav && !this.favorisIds.includes(t.id!)) {
          this.favorisIds.push(t.id!);
        }

        if (!isFav) {
          this.favorisIds = this.favorisIds.filter(id => id !== t.id);
        }

        this.appliquerFiltres();
      },
      error: (err) => {
        console.error('[ConsultationDocs] Erreur toggle favori:', err);
      }
    });
  }

  genererAnnees(): void {
    const actuelle = new Date().getFullYear();

    for (let a = actuelle; a >= 2020; a--) {
      this.annees.push(a);
    }
  }

  filtrerParAnnee(annee: number): void {
    console.log('[ConsultationDocs] Filtre année:', annee);

    this.selectedAnnee = annee || null;
    this.appliquerFiltres();
  }

  filtrerParType(type: string | null): void {
    console.log('[ConsultationDocs] Filtre type:', type);

    this.selectedType = type;
    this.appliquerFiltres();
  }

  toggleStarredFilter(): void {
    this.showStarredOnly = !this.showStarredOnly;

    console.log('[ConsultationDocs] Filtre favoris seulement:', this.showStarredOnly);

    this.appliquerFiltres();
  }

  resetFiltres(): void {
    console.log('[ConsultationDocs] Reset filtres');

    this.selectedAnnee = null;
    this.selectedType = null;
    this.showStarredOnly = false;
    this.searchTerm = '';

    this.appliquerFiltres();
  }

  onSearch(term: string): void {
    console.log('[ConsultationDocs] Recherche:', term);

    this.searchTerm = term;
    this.appliquerFiltres();
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;

    console.log('[ConsultationDocs] Search open:', this.isSearchOpen);

    if (!this.isSearchOpen) {
      this.searchTerm = '';
      this.appliquerFiltres();
    }
  }

  setGridView(): void {
    this.isGridView = true;
    console.log('[ConsultationDocs] Vue grille activée');
  }

  setListView(): void {
    this.isGridView = false;
    console.log('[ConsultationDocs] Vue liste activée');
  }

  appliquerFiltres(): void {
    console.log('[ConsultationDocs] Application filtres...');
    console.log('[ConsultationDocs] Filtres actuels:', {
      selectedAnnee: this.selectedAnnee,
      selectedType: this.selectedType,
      showStarredOnly: this.showStarredOnly,
      searchTerm: this.searchTerm
    });

    console.log('[ConsultationDocs] Travaux avant filtre:', this.travaux);

    this.travauxFiltres = this.travaux.filter(t => {
      const matchAnnee = this.selectedAnnee
        ? t.anneeDepot === this.selectedAnnee
        : true;

      const matchType = this.selectedType
        ? t.type === this.selectedType
        : true;

      const matchStarred = this.showStarredOnly
        ? t.starred === true
        : true;

      const term = this.searchTerm.toLowerCase().trim();

      const matchSearch = term
        ? (
            t.nomEtudiant?.toLowerCase().includes(term) ||
            t.prenomEtudiant?.toLowerCase().includes(term) ||
            t.sujetDemande?.toLowerCase().includes(term) ||
            t.nomFichier?.toLowerCase().includes(term) ||
            t.type?.toLowerCase().includes(term)
          )
        : true;

      const result = matchAnnee && matchType && matchStarred && matchSearch;

      console.log('[ConsultationDocs] Test filtre document:', {
        id: t.id,
        nomFichier: t.nomFichier,
        type: t.type,
        anneeDepot: t.anneeDepot,
        starred: t.starred,
        matchAnnee,
        matchType,
        matchStarred,
        matchSearch,
        result
      });

      return result;
    });

    console.log('[ConsultationDocs] Travaux après filtre:', this.travauxFiltres);
    console.log('[ConsultationDocs] Nombre affiché:', this.travauxFiltres.length);
  }

  ouvrirFichier(t: DocumentDemande): void {
    console.log('[ConsultationDocs] Ouvrir fichier:', t);

    if (!t.id) {
      console.error('[ConsultationDocs] Impossible ouvrir: document sans id', t);
      return;
    }

    this.docService.ouvrir(t.id).subscribe({
      next: (blob: Blob) => {
        console.log('[ConsultationDocs] Blob reçu ouverture:', blob);

        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (err) => {
        console.error('[ConsultationDocs] Erreur ouverture fichier:', err);
      }
    });
  }

  telechargerFichier(t: DocumentDemande): void {
    console.log('[ConsultationDocs] Télécharger fichier:', t);

    if (!t.id) {
      console.error('[ConsultationDocs] Impossible télécharger: document sans id', t);
      return;
    }

    this.docService.telecharger(t.id).subscribe({
      next: (blob: Blob) => {
        console.log('[ConsultationDocs] Blob reçu téléchargement:', blob);

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = t.nomFichier || 'document';
        a.click();

        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('[ConsultationDocs] Erreur téléchargement fichier:', err);
      }
    });
  }
}