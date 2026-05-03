import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DemandeService} from '../../services/demande.service';
import { DemandeStage } from '../../models/demandeStage';
import { LettreRequestDTO } from '../../models/lettreRequestDTO';
import { ConventionRequestDTO } from '../../models/ConventionRequestDTO';

import { AuthService } from '../../services/auth.service';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur } from '../../models/utilisateur.models';
import { DemandeRequestDTO } from '../../models/demandeRequest';

@Component({
  selector: 'app-demande-stage',
  templateUrl: './demande-stage.component.html',
  styleUrls: ['./demande-stage.component.css'],
  standalone: false
})
export class DemandeStageComponent implements OnInit {

  etapeActuelle = 1;
  loading = false;
  erreur = '';

  stageExistant: DemandeStage | null = null;
  etudiant: Utilisateur | null = null;

  showProlongation = false;
  dateFinProlongation = '';
  etudiantId = 0;

  stageForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private demandeService: DemandeService,
    private utilisateurService: UtilisateurService,
    private authService: AuthService
  ) {
    this.stageForm = this.fb.group({
      // Entreprise
      entreprise: ['', Validators.required],
      adresseEntreprise: ['', Validators.required],
      representantEntreprise: ['', Validators.required],
      tuteurStage: ['', Validators.required],
      emailEntreprise: ['', [Validators.required, Validators.email]],
      telephoneEntreprise: ['', Validators.required],
      faxEntreprise: [''],

      // Stage
      sujet: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      anneeUniversitaire: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.etudiantId = this.authService.getUserId() ?? 0;

    if (!this.etudiantId) {
      this.erreur = 'Utilisateur non connecté.';
      return;
    }

    this.chargerProfil();
    this.chargerStageExistant();
    this.initFeather();
  }

  // ─────────────────────────────────────────────────────────────
  // Chargement données
  // ─────────────────────────────────────────────────────────────

  chargerProfil(): void {
    this.utilisateurService.getUtilisateurById(this.etudiantId).subscribe({
      next: (user) => {
        this.etudiant = user;
        console.log('ETUDIANT:', user);
      },
      error: (err) => {
        console.error('Erreur profil:', err);
        this.erreur = 'Impossible de charger le profil étudiant.';
      }
    });
  }

  chargerStageExistant(): void {
    this.demandeService.getDemandesByEtudiant(this.etudiantId).subscribe({
      next: (demande) => {
        if (!demande) {
          return;
        }

        this.stageExistant = demande;
        this.etapeActuelle = 4;

        this.stageForm.patchValue({
          entreprise: demande.entreprise ?? '',
          sujet: demande.sujet ?? '',
          dateDebut: this.toIsoDate(demande.dateDebut),
          dateFin: this.toIsoDate(demande.dateFin)
        });

        this.initFeather();
        console.log('STAGE EXISTANT:', demande);
      },
      error: (err) => {
        // Cas normal si l'étudiant n'a pas encore créé de demande.
        console.warn('Aucune demande existante ou erreur chargement stage:', err);
      }
    });
  }

  private rechargerStageApresSoumission(): void {
    this.demandeService.getDemandesByEtudiant(this.etudiantId).subscribe({
      next: (demande) => {
        if (demande) {
          this.stageExistant = demande;
          this.stageForm.patchValue({
            entreprise: demande.entreprise ?? this.valeurForm('entreprise'),
            sujet: demande.sujet ?? this.valeurForm('sujet'),
            dateDebut: this.toIsoDate(demande.dateDebut) || this.valeurForm('dateDebut'),
            dateFin: this.toIsoDate(demande.dateFin) || this.valeurForm('dateFin')
          });
        }

        this.etapeActuelle = 4;
        this.initFeather();
      },
      error: (err) => {
        console.warn('Demande créée, mais impossible de la recharger:', err);
        this.etapeActuelle = 4;
        this.initFeather();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Navigation étapes
  // ─────────────────────────────────────────────────────────────

  etapeSuivante(): void {
    if (this.etapeActuelle === 1) {
      const step1 = [
        'entreprise',
        'adresseEntreprise',
        'representantEntreprise',
        'tuteurStage',
        'emailEntreprise',
        'telephoneEntreprise'
      ];

      step1.forEach((field) => this.stageForm.get(field)?.markAsTouched());

      if (step1.some((field) => this.stageForm.get(field)?.invalid)) {
        return;
      }
    }

    if (this.etapeActuelle === 2) {
      const step2 = ['sujet', 'dateDebut', 'dateFin', 'anneeUniversitaire'];

      step2.forEach((field) => this.stageForm.get(field)?.markAsTouched());

      if (step2.some((field) => this.stageForm.get(field)?.invalid)) {
        return;
      }
    }

    this.etapeActuelle++;
    this.initFeather();
  }

  etapePrecedente(): void {
    if (this.etapeActuelle > 1) {
      this.etapeActuelle--;
      this.initFeather();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Soumission demande complète : backend retourne documents_stage.zip
  // ─────────────────────────────────────────────────────────────

  soumettre(): void {
    if (this.stageForm.invalid) {
      this.stageForm.markAllAsTouched();
      return;
    }

    if (!this.etudiantId) {
      this.erreur = 'Utilisateur non connecté.';
      return;
    }

    this.loading = true;
    this.erreur = '';

    const payload: DemandeRequestDTO = {
      etudiantId: this.etudiantId,

      // Entreprise
      entreprise: this.valeurForm('entreprise'),
      adresseEntreprise: this.valeurForm('adresseEntreprise'),
      representantEntreprise: this.valeurForm('representantEntreprise'),
      tuteurStage: this.valeurForm('tuteurStage'),
      emailEntreprise: this.valeurForm('emailEntreprise'),
      telephoneEntreprise: this.valeurForm('telephoneEntreprise'),
      faxEntreprise: this.valeurForm('faxEntreprise'),

      // Demande / Stage
      sujet: this.valeurForm('sujet'),
      type: 'STAGE',
      description: this.valeurForm('anneeUniversitaire')
        ? `Année universitaire : ${this.valeurForm('anneeUniversitaire')}`
        : '',
      dateDebut: this.toIsoDate(this.valeurForm('dateDebut')),
      dateFin: this.toIsoDate(this.valeurForm('dateFin')),
      anneeUniversitaire: this.valeurForm('anneeUniversitaire')
    };

    console.log('DTO SOUMISSION DEMANDE:', payload);

    this.demandeService.soumettreDemandeComplete(payload).subscribe({
      next: (blob) => {

        this.loading = false;
        this.erreur = '';
        this.etapeActuelle = 4;

        // Le backend retourne un ZIP, pas un JSON.
        // On recharge donc la demande depuis l'API pour récupérer son id.
        this.rechargerStageApresSoumission();
      },
      error: (err) => {
        console.error('Erreur soumission demande:', err);
        this.erreur = 'Erreur lors de la soumission de la demande.';
        this.loading = false;
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Génération PDF séparée : lettre / convention / avenant
  // ─────────────────────────────────────────────────────────────

  telechargerPDF(type: 'lettre-affectation' | 'convention' | 'prolongation'): void {
    if (!this.stageExistant?.id) {
      alert('Aucune demande de stage trouvée.');
      return;
    }

    if (type === 'prolongation') {
      this.telechargerAvenant(this.stageExistant.id);
      return;
    }

    if (!this.etudiant) {
      alert('Profil étudiant non encore chargé.');
      return;
    }

    const demandeId = this.stageExistant.id;

    if (type === 'lettre-affectation') {
      const dto = this.buildLettreRequestDTO();

      console.log('DTO LETTRE:', dto);

      this.demandeService.genererLettre(demandeId, dto).subscribe({
        next: (blob) => this.sauvegarderFichier(blob, 'lettre_affectation.pdf'),
        error: (err) => {
          console.error('Erreur génération lettre:', err);
          alert('Erreur lors de la génération de la lettre d’affectation.');
        }
      });

      return;
    }

    if (type === 'convention') {
      const champsManquants = this.champsConventionManquants();

      if (champsManquants.length > 0) {
        alert(
          'Impossible de générer la convention. Champs manquants : ' +
          champsManquants.join(', ')
        );
        return;
      }

      const dto = this.buildConventionRequestDTO();

      console.log('DTO CONVENTION:', dto);

      this.demandeService.genererConvention(demandeId, dto).subscribe({
        next: (blob) => this.sauvegarderFichier(blob, 'convention.pdf'),
        error: (err) => {
          console.error('Erreur génération convention:', err);
          alert('Erreur lors de la génération de la convention.');
        }
      });
    }
  }

  private buildLettreRequestDTO(): LettreRequestDTO {
    const etudiant: any = this.etudiant;

    return {
      nomEtudiant: etudiant?.nom ?? '',
      prenomEtudiant: etudiant?.prenom ?? '',
      cin: etudiant?.cin ?? '',
      dateDelivranceCin: this.formatDateFr(etudiant?.dateDelivranceCin),
      lieuDelivranceCin: etudiant?.lieuDelivranceCin ?? '',
      niveau: etudiant?.niveau ?? '',
      specialite: etudiant?.specialite ?? '',

      entreprise: this.getEntreprise(),
      dateDebut: this.formatDateFr(this.getDateDebut()),
      dateFin: this.formatDateFr(this.getDateFin())
    };
  }

  private buildConventionRequestDTO(): ConventionRequestDTO {
    const etudiant: any = this.etudiant;
    const specialite = etudiant?.specialite ?? '';

    return {
      // Entreprise
      entreprise: this.getEntreprise(),
      adresseEntreprise: this.getEntrepriseAdresse(),
      representantEntreprise: this.getEntrepriseRepresentant(),
      tuteurStage: this.getTuteurStage(),
      emailEntreprise: this.getEntrepriseEmail(),
      telephoneEntreprise: this.getEntrepriseTelephone(),
      faxEntreprise: this.valeurForm('faxEntreprise'),

      // Étudiant
      nomEtudiant: etudiant?.nom ?? '',
      prenomEtudiant: etudiant?.prenom ?? '',
      cin: etudiant?.cin ?? '',
      telephone: etudiant?.telephone ?? '',
      email: etudiant?.email ?? '',
      specialite,

      // Stage
      dateDebut: this.formatDateFr(this.getDateDebut()),
      dateFin: this.formatDateFr(this.getDateFin()),

      // Cases à cocher formation
      ing: this.isIngenieur(),
      mastere: this.isMastere(),

      // Cases à cocher spécialité
      info: this.isSpecialiteInfo(specialite),
      electrique: this.isSpecialiteElectrique(specialite),
      indus: this.isSpecialiteIndus(specialite),

      // Cases à cocher année
      premiere: this.isPremiereAnnee(),
      deuxieme: this.isDeuxiemeAnnee()
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Prolongation
  // ─────────────────────────────────────────────────────────────

  soumettrePrologation(): void {
    if (!this.dateFinProlongation || !this.stageExistant?.id) {
      return;
    }

    this.demandeService.demanderProlongation(
      this.stageExistant.id,
      this.dateFinProlongation
    ).subscribe({
      next: () => {
        this.showProlongation = false;
        alert('Prolongation soumise.');
        this.initFeather();
      },
      error: (err) => {
        console.error('Erreur prolongation:', err);
        alert('Erreur lors de la demande de prolongation.');
      }
    });
  }

  private telechargerAvenant(demandeId: number): void {
    this.demandeService.telechargerAvenant(demandeId).subscribe({
      next: (blob) => this.sauvegarderFichier(blob, 'avenant_prolongation.pdf'),
      error: (err) => {
        console.error('Erreur avenant:', err);
        alert('Erreur lors du téléchargement de l’avenant.');
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers valeurs / dates
  // ─────────────────────────────────────────────────────────────

  private valeurForm(field: string): string {
    return (this.stageForm.get(field)?.value ?? '').toString().trim();
  }

  private getDemandeAny(): any {
    return this.stageExistant as any;
  }

  private getEntreprise(): string {
    return (
      this.valeurForm('entreprise') ||
      this.stageExistant?.entreprise ||
      this.getDemandeAny()?.entrepriseNom ||
      ''
    );
  }

  private getEntrepriseAdresse(): string {
    return (
      this.valeurForm('adresseEntreprise') ||
      this.getDemandeAny()?.entrepriseAdresse ||
      ''
    );
  }

  private getEntrepriseRepresentant(): string {
    return (
      this.valeurForm('representantEntreprise') ||
      this.getDemandeAny()?.entrepriseRepresentant ||
      ''
    );
  }

  private getTuteurStage(): string {
    return (
      this.valeurForm('tuteurStage') ||
      this.getDemandeAny()?.tuteurStage ||
      ''
    );
  }

  private getEntrepriseEmail(): string {
    return (
      this.valeurForm('emailEntreprise') ||
      this.getDemandeAny()?.entrepriseEmail ||
      ''
    );
  }

  private getEntrepriseTelephone(): string {
    return (
      this.valeurForm('telephoneEntreprise') ||
      this.getDemandeAny()?.entrepriseTelephone ||
      ''
    );
  }

  private getDateDebut(): string {
    return this.valeurForm('dateDebut') || this.stageExistant?.dateDebut || '';
  }

  private getDateFin(): string {
    return this.valeurForm('dateFin') || this.stageExistant?.dateFin || '';
  }

  /**
   * Pour le backend DemandeRequestDTO :
   * input date HTML = yyyy-MM-dd.
   */
  private toIsoDate(date?: string): string {
    if (!date) {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [day, month, year] = date.split('/');
      return `${year}-${month}-${day}`;
    }

    return date.split('T')[0];
  }

  /**
   * Pour les DTO PDF :
   * LettreRequestDTO et ConventionRequestDTO attendent dd/MM/yyyy.
   */
  formatDateFr(date?: string): string {
    if (!date) {
      return '';
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      return date;
    }

    const isoDate = date.split('T')[0];

    if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
      const [year, month, day] = isoDate.split('-');
      return `${day}/${month}/${year}`;
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();

    return `${day}/${month}/${year}`;
  }

  sauvegarderFichier(blob: Blob, nomFichier: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = nomFichier;
    link.click();

    window.URL.revokeObjectURL(url);
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers ConventionRequestDTO : cases à cocher
  // ─────────────────────────────────────────────────────────────

  private normaliser(value?: string): string {
    return (value ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private getNiveau(): string {
    const etudiant: any = this.etudiant;
    return this.normaliser(etudiant?.niveau);
  }

  private isMastere(): boolean {
    const niveau = this.getNiveau();
    return niveau.includes('master') || niveau.includes('mastere');
  }

  private isIngenieur(): boolean {
    return !this.isMastere();
  }

  private isSpecialiteInfo(specialite: string): boolean {
    const value = this.normaliser(specialite);
    return (
      value.includes('info') ||
      value.includes('informatique') ||
      value.includes('data') ||
      value.includes('logiciel')
    );
  }

  private isSpecialiteElectrique(specialite: string): boolean {
    const value = this.normaliser(specialite);
    return (
      value.includes('electrique') ||
      value.includes('electronique') ||
      value.includes('electro')
    );
  }

  private isSpecialiteIndus(specialite: string): boolean {
    const value = this.normaliser(specialite);
    return value.includes('indus') || value.includes('industriel');
  }

  private isPremiereAnnee(): boolean {
    const niveau = this.getNiveau();

    return (
      niveau === '1' ||
      niveau.includes('1ere') ||
      niveau.includes('1er') ||
      niveau.includes('premiere')
    );
  }

  private isDeuxiemeAnnee(): boolean {
    const niveau = this.getNiveau();

    return (
      niveau === '2' ||
      niveau.includes('2eme') ||
      niveau.includes('deuxieme')
    );
  }

  private champsConventionManquants(): string[] {
    const champs: Array<{ label: string; value: string }> = [
      { label: 'entreprise', value: this.getEntreprise() },
      { label: 'adresseEntreprise', value: this.getEntrepriseAdresse() },
      { label: 'representantEntreprise', value: this.getEntrepriseRepresentant() },
      { label: 'tuteurStage', value: this.getTuteurStage() },
      { label: 'emailEntreprise', value: this.getEntrepriseEmail() },
      { label: 'telephoneEntreprise', value: this.getEntrepriseTelephone() },
      { label: 'dateDebut', value: this.getDateDebut() },
      { label: 'dateFin', value: this.getDateFin() }
    ];

    return champs
      .filter((champ) => !champ.value)
      .map((champ) => champ.label);
  }

  // ─────────────────────────────────────────────────────────────
  // Feather icons
  // ─────────────────────────────────────────────────────────────

  initFeather(): void {
    setTimeout(() => {
      if ((window as any).feather) {
        (window as any).feather.replace();
      }
    }, 100);
  }
}
