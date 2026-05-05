import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { DemandeStage } from '../../../models/demandeStage';
import { Etudiant } from '../../../models/etudiant';
import { DocumentDemande } from '../../../models/document';
import { JournalStage } from '../../../models/journalStage';
import { Prolongation } from '../../../models/Prolongation';
import { Soutenance } from '../../../models/soutenance';

import { DemandeService } from '../../../services/demande.service';
import { UtilisateurService } from '../../../services/utilisateur.service';
import { DocumentService } from '../../../services/document.service';
import { ProlongationService } from '../../../services/prolongation.service';
import { SoutenanceService } from '../../../services/soutenance.service';
import { JournalService } from '../../../services/journal.service';

interface HistoriqueEntree {
  date: Date;
  titre: string;
  description: string;
  acteur: 'etudiant' | 'responsable' | 'systeme';
  icone: string;
  estRejet?: boolean;
}

@Component({
  selector: 'app-demande-details',
  templateUrl: './demande-details.component.html',
  styleUrls: ['./demande-details.component.css'],
  standalone: false
})
export class DemandeDetailsComponent implements OnInit, OnDestroy {

  loading = true;
  loadingDoc = false;

  activeTab:
    | 'general'
    | 'documents'
    | 'journal'
    | 'attestation'
    | 'prolongation'
    | 'travaux'
    | 'soutenance' = 'general';

  demande!: DemandeStage;
  etudiant!: Etudiant;
  soutenance: Soutenance | null = null;

  documents: DocumentDemande[] = [];

  convention: DocumentDemande | null = null;
  lettreAffectation: DocumentDemande | null = null;
  attestation: DocumentDemande | null = null;

  rapport: DocumentDemande | null = null;
  presentation: DocumentDemande | null = null;
  poster: DocumentDemande | null = null;

  journalDoc: DocumentDemande | null = null;
  prolongationDoc: DocumentDemande | null = null;

  journaux: JournalStage[] = [];
  journauxFiltres: JournalStage[] = [];

  filtreSemaine = 'all';
  filtreJournal: 'all' | 'vu' | 'non_vu' = 'all';

  semaines: {
    value: string;
    label: string;
    debut: Date;
    fin: Date;
  }[] = [];

  prolongation: Prolongation | null = null;

  photoUrl: string | null = null;

  motifRefusEnCours = '';
  motifRefusError = false;
  refusDocumentId: number | null = null;
  refusDocumentType: string | null = null;
  showRefusModal = false;

  currentRole = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,

    private demandeService: DemandeService,
    private utilisateurService: UtilisateurService,
    private documentService: DocumentService,
    private journalStageService: JournalService,
    private prolongationService: ProlongationService,
    private soutenanceService: SoutenanceService
  ) {}

  ngOnInit(): void {
    this.currentRole = this.getCurrentRole();

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || Number.isNaN(id)) {
      this.router.navigate(['/responsable/demandes']);
      return;
    }

    if (this.isServiceStage) {
      this.activeTab = 'documents';
    }

    this.chargerDonnees(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.photoUrl) {
      URL.revokeObjectURL(this.photoUrl);
    }
  }

  private getCurrentRole(): string {
    const directRole =
      localStorage.getItem('role') ||
      localStorage.getItem('userRole') ||
      sessionStorage.getItem('role') ||
      sessionStorage.getItem('userRole');

    if (directRole) {
      return directRole.replace(/"/g, '').trim();
    }

    const possibleUserKeys = ['currentUser', 'user', 'authUser', 'utilisateur'];

    for (const key of possibleUserKeys) {
      const raw = localStorage.getItem(key) || sessionStorage.getItem(key);

      if (!raw) {
        continue;
      }

      try {
        const parsed = JSON.parse(raw);
        const role = parsed?.role || parsed?.utilisateur?.role || parsed?.user?.role;

        if (role) {
          return String(role).trim();
        }
      } catch {
        continue;
      }
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role =
          payload?.role ||
          payload?.authorities?.[0]?.authority ||
          payload?.roles?.[0];

        if (role) {
          return String(role).replace('ROLE_', '').trim();
        }
      } catch {
        return '';
      }
    }

    return '';
  }

  get isServiceStage(): boolean {
    return this.currentRole === 'SERVICE_STAGE' || this.currentRole === 'ROLE_SERVICE_STAGE';
  }

  get canManageDocuments(): boolean {
    return !this.isServiceStage;
  }

  get canManageDemande(): boolean {
    return !this.isServiceStage;
  }

  get canSeeJournalTravauxSoutenance(): boolean {
    return !this.isServiceStage;
  }

  chargerDonnees(demandeId: number): void {
    this.loading = true;

    this.demandeService.getDemandeById(demandeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: demande => {
          this.demande = demande;
          this.chargerDonneesSecondaires(demandeId);
        },
        error: err => {
          console.error('[DemandeDetails] getDemandeById()', err);
          this.loading = false;
          alert('Impossible de charger la demande.');
        }
      });
  }

  private chargerDonneesSecondaires(demandeId: number): void {
    const etudiantId = this.demande.etudiantId;
    const soutenanceId = this.demande.soutenanceId;

    forkJoin({
      etudiant: this.utilisateurService.getUtilisateurById(etudiantId)
        .pipe(catchError(() => of(null))),

      journaux: this.canSeeJournalTravauxSoutenance
        ? this.journalStageService.getByDemande(demandeId).pipe(catchError(() => of([] as JournalStage[])))
        : of([] as JournalStage[]),

      prolongation: this.prolongationService.getProlongation(demandeId)
        .pipe(catchError(() => of(null))),

      soutenance: this.canSeeJournalTravauxSoutenance && soutenanceId
        ? this.soutenanceService.getById(soutenanceId).pipe(catchError(() => of(null)))
        : of(null),

      documents: this.documentService.getByDemande(demandeId)
        .pipe(catchError(() => of([] as DocumentDemande[])))
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.etudiant = data.etudiant as Etudiant;
          this.journaux = data.journaux || [];
          this.prolongation = data.prolongation as Prolongation | null;
          this.soutenance = data.soutenance ? this.normaliseSoutenance(data.soutenance) : null;
          this.documents = data.documents || [];

          this.classerDocuments();

          this.chargerPhotoEtudiant();
          this.buildSemaines();
          this.appliquerFiltres();

          this.loading = false;
        },
        error: err => {
          console.error('[DemandeDetails] chargerDonneesSecondaires()', err);
          this.loading = false;
        }
      });
  }

  private classerDocuments(): void {
    this.convention = this.documents.find(d => d.type === 'CONVENTION') ?? null;
    this.lettreAffectation = this.documents.find(d => d.type === 'LETTRE_AFFECTATION') ?? null;
    this.attestation = this.documents.find(d => d.type === 'ATTESTATION') ?? null;

    this.rapport = this.documents.find(d => d.type === 'RAPPORT') ?? null;
    this.presentation = this.documents.find(d => d.type === 'PRESENTATION') ?? null;
    this.poster = this.documents.find(d => d.type === 'POSTER') ?? null;

    this.journalDoc = this.documents.find(d => d.type === 'JOURNAL') ?? null;
    this.prolongationDoc = this.documents.find(d => d.type === 'PROLONGATION') ?? null;
  }

  private normaliseSoutenance(s: any): Soutenance {
    return {
      ...s,
      statut: s.statut != null ? s.statut.toString() : undefined,
      membresJury: s.membresJury || []
    };
  }

  chargerPhotoEtudiant(): void {
    if (!this.etudiant?.id) return;

    this.utilisateurService.getPhoto(this.etudiant.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: blob => {
          if (this.photoUrl) {
            URL.revokeObjectURL(this.photoUrl);
          }

          this.photoUrl = URL.createObjectURL(blob);
        },
        error: () => {
          this.photoUrl = null;
        }
      });
  }

  setTab(tab: typeof this.activeTab): void {
    if (this.isServiceStage && ['journal', 'travaux', 'soutenance'].includes(tab)) {
      this.activeTab = 'documents';
      return;
    }

    this.activeTab = tab;
  }

  approuverDemande(): void {
    if (!this.canManageDemande) return;
    if (!this.demande?.id) return;
    if (!confirm('Approuver cette demande de stage ?')) return;

    this.demandeService.approuverDemande(this.demande.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: updated => {
          this.demande = updated;
          alert('Demande approuvée ✅');
        },
        error: err => {
          console.error(err);
          alert('Erreur lors de l’approbation de la demande.');
        }
      });
  }

  rejeterDemande(): void {
    if (!this.canManageDemande) return;
    if (!this.demande?.id) return;
    if (!confirm('Rejeter cette demande de stage ?')) return;

    this.demandeService.rejeterDemande(this.demande.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: updated => {
          this.demande = updated;
          alert('Demande rejetée.');
        },
        error: err => {
          console.error(err);
          alert('Erreur lors du rejet de la demande.');
        }
      });
  }

  modifierStatut(): void {
    if (!this.canManageDemande) return;
    console.log('Modifier statut');
  }

 signerDocument(
  docId: number,
  type: 'convention' | 'lettre-affectation' | 'prolongation'
): void {

  this.documentService.signerDocument(docId, type)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: pdfBlob => {
        this.documentService.ouvrirBlob(pdfBlob);
        this.chargerDonnees(this.demande.id);
      },
      error: err => {
        console.error('Erreur lors de la signature :', err);
        alert('Impossible de signer le document.');
      }
    });
}
  refuserDocument(docId: number, motif: string): void {

    this.documentService.refuser(docId, motif)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Document refusé ❌');
          this.chargerDonnees(this.demande.id);
        },
        error: err => {
          console.error(err);
          alert('Erreur lors du rejet du document.');
        }
      });
  }

  validerDocument(id: number): void {

    this.documentService.valider(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Document validé avec succès ✅');
          this.chargerDonnees(this.demande.id);
        },
        error: err => {
          console.error(err);
          alert(err?.error?.message || 'Erreur lors de la validation du document.');
        }
      });
  }

  voirDocument(type: string, idDocument: number): void {
    this.documentService.ouvrir(idDocument)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: blob => this.documentService.ouvrirBlob(blob),
        error: err => {
          console.error(err);
          alert('Impossible d’ouvrir le document.');
        }
      });
  }

  telechargerDocument(type: string, idDocument: number): void {
    const nom = this.getNomFichierDocument(type);

    this.documentService.telecharger(idDocument)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: blob => this.documentService.telechargerBlob(blob, nom),
        error: err => {
          console.error(err);
          alert('Impossible de télécharger le document.');
        }
      });
  }

  private getNomFichierDocument(type: string): string {
    const map: Record<string, string> = {
      convention: this.convention?.nomFichier || 'convention.pdf',
      lettre: this.lettreAffectation?.nomFichier || 'lettre_affectation.pdf',
      attestation: this.attestation?.nomFichier || 'attestation.pdf',
      rapport: this.rapport?.nomFichier || 'rapport.pdf',
      presentation: this.presentation?.nomFichier || 'presentation.pdf',
      poster: this.poster?.nomFichier || 'poster.pdf',
      journalDoc: this.journalDoc?.nomFichier || 'journal.pdf',
      prolongationDoc: this.prolongationDoc?.nomFichier || 'prolongation.pdf'
    };

    return map[type] || 'document.pdf';
  }

  openRefusModal(documentId: number, type: string): void {
    if (!this.canManageDocuments) return;

    this.refusDocumentId = documentId;
    this.refusDocumentType = type;
    this.motifRefusEnCours = '';
    this.motifRefusError = false;
    this.showRefusModal = true;
  }

  closeRefusModal(): void {
    this.showRefusModal = false;
  }

  confirmerRefus(): void {
    if (!this.canManageDocuments) return;

    if (!this.motifRefusEnCours?.trim()) {
      this.motifRefusError = true;
      return;
    }

    if (!this.refusDocumentId) {
      return;
    }

    this.motifRefusError = false;
    this.refuserDocument(this.refusDocumentId, this.motifRefusEnCours);
    this.closeRefusModal();
  }



  appliquerFiltres(): void {
    let liste = [...this.journaux];

    if (this.filtreSemaine !== 'all') {
      const sem = this.semaines.find(s => s.value === this.filtreSemaine);

      if (sem) {
        liste = liste.filter(e => {
          if (!e.date) return false;

          const d = new Date(e.date);
          return d >= sem.debut && d <= sem.fin;
        });
      }
    }

    if (this.filtreJournal === 'vu') {
      liste = liste.filter(e => e.vueResponsable);
    } else if (this.filtreJournal === 'non_vu') {
      liste = liste.filter(e => !e.vueResponsable);
    }

    this.journauxFiltres = liste;
  }

  marquerVue(entry: JournalStage): void {
    if (this.isServiceStage) return;
    if (!entry.id) return;

    this.journalStageService.marquerVue(entry.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          entry.vueResponsable = true;
          this.appliquerFiltres();
        },
        error: err => console.error(err)
      });
  }

  toggleComment(entry: JournalStage): void {
    if (this.isServiceStage) return;

    entry.showCommentBox = !entry.showCommentBox;
    entry.newCommentaire = '';
  }

  envoyerCommentaire(entry: JournalStage): void {
    if (this.isServiceStage) return;
    if (!entry.id) return;

    this.journalStageService.commenter(entry.id, entry.newCommentaire || '')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Commentaire envoyé ✅');
          this.chargerDonnees(this.demande.id);
        },
        error: err => {
          console.error(err);
          alert('Erreur lors de l’envoi du commentaire.');
        }
      });
  }

  validerJournal(entry: JournalStage): void {
    if (this.isServiceStage) return;
    if (!entry.id) return;

    this.journalStageService.valider(entry.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Entrée validée ✅');
          this.chargerDonnees(this.demande.id);
        },
        error: err => {
          console.error(err);
          alert('Erreur lors de la validation.');
        }
      });
  }

  buildSemaines(): void {
    this.semaines = [];

    if (!this.demande?.dateDebut || !this.demande?.dateFin) {
      return;
    }

    const debut = new Date(this.demande.dateDebut);
    const fin = new Date(this.demande.dateFin);

    if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime())) {
      return;
    }

    let current = new Date(debut);
    let index = 1;

    while (current <= fin) {
      const debutSem = new Date(current);
      const finSem = new Date(current);

      finSem.setDate(finSem.getDate() + 6);

      const finEffective = finSem > fin ? fin : finSem;

      this.semaines.push({
        value: `s${index}`,
        label: `Semaine ${index}`,
        debut: debutSem,
        fin: finEffective
      });

      current.setDate(current.getDate() + 7);
      index++;
    }
  }

  onSemaineChange(): void {
    this.appliquerFiltres();
  }

  onStatutChange(): void {
    this.appliquerFiltres();
  }

  get journauxVus(): number {
    return this.journaux.filter(e => e.vueResponsable).length;
  }

  get journauxNonVus(): number {
    return this.journaux.filter(e => !e.vueResponsable).length;
  }

  dateFineAtteinte(): boolean {
    if (!this.demande?.dateFin) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fin = new Date(this.demande.dateFin);
    fin.setHours(0, 0, 0, 0);

    return today >= fin;
  }

  stageTermine(dateFin: string | Date | undefined): boolean {
    if (!dateFin) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fin = new Date(dateFin);
    fin.setHours(0, 0, 0, 0);

    return fin <= today;
  }

  approuverProlongation(prolId: number): void {
    if (this.isServiceStage) return;
    if (!confirm('Approuver cette prolongation ?')) return;

    this.prolongationService.approuverProlongation(prolId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Prolongation approuvée ✅');
          this.chargerDonnees(this.demande.id);
        },
        error: err => {
          console.error(err);
          alert('Erreur lors de l’approbation.');
        }
      });
  }

  rejeterProlongation(prolId: number): void {
    if (this.isServiceStage) return;
    if (!confirm('Refuser cette prolongation ?')) return;

    this.prolongationService.rejeterProlongation(prolId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Prolongation refusée.');
          this.chargerDonnees(this.demande.id);
        },
        error: err => {
          console.error(err);
          alert('Erreur lors du refus.');
        }
      });
  }

  planifierSoutenance(): void {
    if (this.isServiceStage) return;

    if (!this.soutenance) {
      this.router.navigate(['/soutenances/new'], {
        queryParams: { demandeId: this.demande.id }
      });
    }
  }

  modifierSoutenance(): void {
    if (this.isServiceStage) return;
    if (!this.soutenance?.id) return;

    this.router.navigate(['/soutenances/modifier', this.soutenance.id]);
  }

  annulerSoutenance(): void {
    if (this.isServiceStage) return;

    if (!this.soutenance?.id) {
      alert('ID de soutenance introuvable.');
      return;
    }

    if (!confirm('Annuler cette soutenance ?')) return;

    this.soutenanceService.updateStatut(this.soutenance.id, 'ANNULEE')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: updatedSoutenance => {
          this.soutenance = this.normaliseSoutenance(updatedSoutenance);
          alert('Soutenance annulée ✅');
        },
        error: err => {
          console.error(err);
          alert('Erreur lors de l’annulation de la soutenance.');
        }
      });
  }

  imprimerPV(): void {}

  get historiqueTimeline(): HistoriqueEntree[] {
    const entrees: HistoriqueEntree[] = [];

    if (!this.demande || !this.etudiant) {
      return entrees;
    }

    if (this.demande.dateDemande) {
      entrees.push({
        date: new Date(this.demande.dateDemande),
        titre: 'Demande soumise',
        description: `${this.etudiant.prenom} ${this.etudiant.nom} a soumis une demande de stage ${this.demande.type || ''}`,
        acteur: 'etudiant',
        icone: 'feather-send'
      });
    }

    for (const doc of this.documents) {
      if (doc.dateDepot) {
        entrees.push({
          date: new Date(doc.dateDepot),
          titre: `${this.getDocLabel(doc.type)} déposé`,
          description: `${this.etudiant.prenom} ${this.etudiant.nom} a déposé ${this.getDocLabel(doc.type)} le ${this.formatDate(doc.dateDepot)}`,
          acteur: 'etudiant',
          icone: 'feather-upload'
        });
      }

      if (doc.dateDecision && (doc.statut === 'VALIDE' || doc.statut === 'REJETE')) {
        const valide = doc.statut === 'VALIDE';

        entrees.push({
          date: new Date(doc.dateDecision),
          titre: `${this.getDocLabel(doc.type)} ${valide ? 'validé' : 'rejeté'}`,
          description: `Vous avez ${valide ? 'validé' : 'rejeté'} ${this.getDocLabel(doc.type)} le ${this.formatDate(doc.dateDecision)}`,
          acteur: 'responsable',
          icone: valide ? 'feather-check-circle' : 'feather-x-circle',
          estRejet: !valide
        });
      }
    }

    return entrees.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  get docsPhase1(): DocumentDemande[] {
    return this.documents.filter(d =>
      ['CONVENTION', 'LETTRE_AFFECTATION'].includes(d.type)
    );
  }

  get docsPhase2(): DocumentDemande[] {
    return this.documents.filter(d =>
      ['JOURNAL'].includes(d.type)
    );
  }

  get docsPhase3(): DocumentDemande[] {
    return this.documents.filter(d =>
      ['RAPPORT', 'PRESENTATION', 'POSTER', 'ATTESTATION'].includes(d.type)
    );
  }

 get phase1Complete(): boolean {
  return this.docsPhase1.length > 0 &&
    this.docsPhase1.every(d => d.statut === 'SIGNE');
}

  get phase2Active(): boolean {
    return this.phase1Complete &&
      ['EN_COURS', 'PROLONGATION_DEMANDEE'].includes(this.demande?.statut);
  }

  get phase2Complete(): boolean {
    return this.docsPhase2.length > 0 &&
      this.docsPhase2.every(d => d.statut === 'VALIDE');
  }

  get phase3Active(): boolean {
    return this.phase2Complete && this.demande?.statut !== 'TERMINEE';
  }

  get phase3Complete(): boolean {
    return this.demande?.statut === 'TERMINEE';
  }

get documentsEnAttente(): DocumentDemande[] {
  return this.documents.filter(d =>
    ['GENERE', 'SOUMIS', 'VALIDE'].includes(d.statut)
  );
}
get docsSignes(): number {
  return this.documents.filter(d => d.statut === 'SIGNE').length;
}
  get docsEnAttente(): number {
    return this.documentsEnAttente.length;
  }

  get documentsRejetes(): DocumentDemande[] {
    return this.documents.filter(d => d.statut === 'REJETE');
  }

  get docsRejetes(): number {
    return this.documentsRejetes.length;
  }

  get docsValides(): number {
    return this.documents.filter(d => d.statut === 'VALIDE').length;
  }

  get tauxCompletion(): number {
    if (!this.documents.length) return 0;

    return Math.round((this.docsValides / this.documents.length) * 100);
  }

  getProchaineAction(): string {
    switch (this.demande?.statut) {
      case 'SOUMISE':
        return 'Traitement de la demande';

   
   
      case 'EN_ATTENTE_SIGNATURE':
        return 'Validation Service stage';

      case 'VALIDEE':
        return 'Démarrage du stage';

      case 'EN_COURS':
        return this.docsPhase2.some(d => d.statut === 'GENERE')
          ? 'Dépôt journal + attestation'
          : 'Journal quotidien en cours';

      case 'PROLONGATION_DEMANDEE':
        return 'Décision prolongation';

      case 'TERMINEE':
        return 'Stage clôturé';

      default:
        return '—';
    }
  }

  getPhaseActuelle(): number {
    if (this.phase3Active || this.phase3Complete) return 3;
    if (this.phase2Active || this.phase2Complete) return 2;
    return 1;
  }

  getDocLabel(type: any): string {
    const labels: Record<string, string> = {
      LETTRE_AFFECTATION: 'Lettre affectation',
      CONVENTION: 'Convention',
      RAPPORT: 'Rapport',
      POSTER: 'Poster',
      ATTESTATION: 'Attestation',
      PRESENTATION: 'Présentation',
      JOURNAL: 'Journal',
      PROLONGATION: 'Prolongation'
    };

    return labels[type] ?? type;
  }

  getDocBadgeClass(statut: any): string {
    switch (statut) {
      case 'VALIDE':
        return 'bg-soft-success text-success';

      case 'REJETE':
        return 'bg-soft-danger text-danger';

      case 'SOUMIS':
        return 'bg-soft-primary text-primary';

      case 'SIGNE':
        return 'bg-soft-success text-info';

      default:
        return 'bg-soft-secondary text-secondary';
    }
  }

  getStatutBadgeClass(statut?: any): string {
    const map: Record<string, string> = {
      SOUMISE: 'bg-soft-warning text-warning',
      EN_ATTENTE_SIGNATURE: 'bg-soft-primary text-primary',

      REFUSEE: 'bg-soft-danger text-danger',
      EN_COURS: 'bg-soft-primary text-primary',
      PROLONGATION_DEMANDEE: 'bg-soft-info text-info',
      TERMINEE: 'bg-soft-teal text-teal'
    };

    return map[statut ?? 'SOUMISE'] ?? 'bg-soft-secondary text-secondary';
  }

  getStatutLabel(statut?: any): string {
    const map: Record<string, string> = {
      SOUMISE: 'Soumise',
      EN_ATTENTE_SIGNATURE: 'En attente signature',
      VALIDEE: 'Approuvée',
      REFUSEE: 'Rejetée',
      EN_COURS: 'En cours',
      PROLONGATION_DEMANDEE: 'Prolongation demandée',
      TERMINEE: 'Terminée'
    };

    return map[statut ?? 'SOUMISE'] ?? '—';
  }

  getJournalFeedClass(entry: JournalStage): string {
    return entry.vueResponsable ? 'feed-item-success' : 'feed-item-warning';
  }

  getProlStatutClass(statut: any): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'bg-soft-warning text-warning',
      APPROUVEE: 'bg-soft-success text-success',
      REFUSEE: 'bg-soft-danger text-danger',
      REJETEE: 'bg-soft-danger text-danger'
    };

    return map[statut] ?? 'bg-soft-secondary text-secondary';
  }

  getSoutenanceStatutClass(statut?: any): string {
    const map: Record<string, string> = {
      PLANIFIEE: 'bg-soft-primary text-primary',
      VALIDEE: 'bg-soft-teal text-teal',
      ANNULEE: 'bg-soft-danger text-danger'
    };

    return map[statut ?? ''] ?? 'bg-soft-secondary text-secondary';
  }

  getDocStatutClass(statut?: string): string {
    const map: Record<string, string> = {
      GENERE: 'bg-soft-warning text-warning',
      SOUMIS: 'bg-soft-primary text-primary',
      VALIDE: 'bg-soft-success text-success',
      SIGNE: 'bg-soft-success text-info',

      REJETE: 'bg-soft-danger text-danger'
    };

    return map[statut ?? ''] ?? 'bg-soft-secondary text-secondary';
  }
}