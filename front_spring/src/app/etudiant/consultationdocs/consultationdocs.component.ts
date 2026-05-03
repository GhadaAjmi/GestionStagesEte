import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { FavoriService } from '../../services/favori.service';
import { DocumentDemande } from '../../models/document';


@Component({
  selector: 'app-consultationdocs',
  templateUrl: './consultationdocs.component.html',
  styleUrls: ['./consultationdocs.component.css']
})
export class ConsultationdocsComponent implements OnInit{
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
    this.genererAnnees();
    this.chargerFavorisEtDocuments();
  }

  chargerFavorisEtDocuments(): void {
    this.favoriService.getMesFavorisIds().subscribe(favIds => {
      this.favorisIds = favIds;
      this.docService.getArchives().subscribe(docs => {
        this.travaux = docs.map(d => ({
          ...d,
 starred: this.favorisIds.includes(d.id),
  iconFile: this.getIconFile(d.type),
  badgeClass: this.getBadgeClass(d.type)        }));
        this.appliquerFiltres();
        console.log(this.travaux)
      });
    });
  }
getIconFile(type: string): string {
  switch(type) {
    case 'RAPPORT': return 'assets/images/file-icons/pdf.png';
    case 'POSTER': return 'assets/images/file-icons/pdf.png';
    case 'PRESENTATION': return 'assets/images/file-icons/pptx.png';
    default: return 'assets/images/file-icons/file.png';
  }
}

getBadgeClass(type: string): string {
  switch(type) {
    case 'RAPPORT': return 'bg-primary';
    case 'POSTER': return 'bg-info';
    case 'PRESENTATION': return 'bg-success';
    default: return 'bg-secondary';
  }
}
  toggleStar(t: DocumentDemande): void {
    this.favoriService.toggleFavori(t.id).subscribe(isFav => {
      t.starred = isFav;
      this.appliquerFiltres();
    });
  }

  genererAnnees(): void {
    const actuelle = new Date().getFullYear();
    for (let a = actuelle; a >= 2020; a--) this.annees.push(a);
  }

  filtrerParAnnee(annee: number): void {
    this.selectedAnnee = annee || null;
    this.appliquerFiltres();
  }

  filtrerParType(type: string | null): void {
    this.selectedType = type;
    this.appliquerFiltres();
  }

  toggleStarredFilter(): void {
    this.showStarredOnly = !this.showStarredOnly;
    this.appliquerFiltres();
  }

  resetFiltres(): void {
    this.selectedAnnee = null;
    this.selectedType = null;
    this.showStarredOnly = false;
    this.searchTerm = '';
    this.appliquerFiltres();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.appliquerFiltres();
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (!this.isSearchOpen) { 
      this.searchTerm = ''; 
      this.appliquerFiltres(); 
    }
  }

  setGridView(): void { this.isGridView = true; }
  setListView(): void { this.isGridView = false; }

  appliquerFiltres(): void {
    this.travauxFiltres = this.travaux.filter(t => {
      const matchAnnee   = this.selectedAnnee   ? t.anneeDepot === this.selectedAnnee : true;
      const matchType  = this.selectedType ? true : true; 
      const matchStarred = this.showStarredOnly ? t.starred : true;
      const matchSearch  = this.searchTerm
        ? (t.nomEtudiant?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
           t.prenomEtudiant?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
           t.sujetDemande?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
           t.nomFichier?.toLowerCase().includes(this.searchTerm.toLowerCase())||
           t.type?.toLowerCase().includes(this.searchTerm.toLowerCase()))

        : true;
      return matchAnnee && matchType && matchStarred && matchSearch;
    });
  }

  ouvrirFichier(t: DocumentDemande): void {
    this.docService.ouvrir(t.id).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }

  telechargerFichier(t: DocumentDemande): void {
    this.docService.telecharger(t.id).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = t.nomFichier;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}