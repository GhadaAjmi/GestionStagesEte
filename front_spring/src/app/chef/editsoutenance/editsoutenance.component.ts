import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';


import { Enseignant } from '../../models/enseignant';
import { Soutenance } from '../../models/soutenance';
import { MembreJury } from '../../models/membre-jury';
import { Salle } from '../../models/salle copy';
import { SoutenanceService } from '../../services/soutenance.service';

@Component({
  selector: 'app-editsoutenance',
  templateUrl: './editsoutenance.component.html',
  styleUrl: './editsoutenance.component.css'
})
export class EditsoutenanceComponent implements OnInit {

  readonly NIVEAU = 'ING2';

  soutenanceId!: number;
  soutenanceSource: Soutenance | null = null;

  enseignants: Enseignant[] = [];
  enseignantsSelectionnesActuels: Enseignant[] = [];

  salles: Salle[] = [];
  sallesPrincipales: Salle[] = [];
  sallesAnnexes: Salle[] = [];

  form!: FormGroup;

  loading = false;
  loadingInitial = false;
  loadingDisponibilite = false;
  loadingEnseignants = false;

  submitted = false;

  disponibiliteResult: { disponible: boolean; conflits?: string[] } | null = null;

  successMessage = '';
  errorMessage = '';

  juryPreviews: Enseignant[] = [];

  private patching = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private soutenanceService: SoutenanceService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initJury(2);
    this.loadReferentiels();

    const idParam = this.route.snapshot.paramMap.get('id');
    this.soutenanceId = Number(idParam);

    if (!this.soutenanceId || Number.isNaN(this.soutenanceId)) {
      this.errorMessage = 'ID de soutenance invalide.';
      return;
    }

    this.loadSoutenance();
  }

  private initForm(): void {
    this.form = this.fb.group({
      // Champs fixes
      etudiantNomComplet: [{ value: '', disabled: true }],
      departement: [{ value: '', disabled: true }],
      specialite: [{ value: '', disabled: true }],
      groupe: [{ value: '', disabled: true }],
      niveau: [{ value: this.NIVEAU, disabled: true }],

      // Champs modifiables
      statut: ['PLANIFIEE', Validators.required],
      date: ['', Validators.required],
      heureDebut: ['', Validators.required],
      duree: [90, [Validators.required, Validators.min(30), Validators.max(240)]],
      salleId: ['', Validators.required],

      nbJury: [2, [Validators.required, Validators.min(1), Validators.max(5)]],
      membresJury: this.fb.array([])
    });

    this.form.get('membresJury')?.valueChanges.subscribe(() => {
      this.updateJuryPreviews();
    });

    this.form.get('nbJury')?.valueChanges.subscribe(() => {
      if (this.patching) return;
      this.onNbJuryChange();
    });

    this.form.get('date')?.valueChanges.subscribe(() => {
      if (this.patching) return;

      this.disponibiliteResult = null;
      this.resetJurySelection();
      this.chargerEnseignantsDisponibles();
    });

    this.form.get('heureDebut')?.valueChanges.subscribe(() => {
      if (this.patching) return;

      this.disponibiliteResult = null;
      this.resetJurySelection();
      this.chargerEnseignantsDisponibles();
    });

    this.form.get('duree')?.valueChanges.subscribe(() => {
      if (this.patching) return;

      this.disponibiliteResult = null;
      this.resetJurySelection();
      this.chargerEnseignantsDisponibles();
    });

    this.form.get('salleId')?.valueChanges.subscribe(() => {
      if (this.patching) return;

      this.disponibiliteResult = null;
    });
  }

  private loadReferentiels(): void {
    this.soutenanceService.getSalles().subscribe({
      next: salles => {
        this.salles = salles;

        this.sallesPrincipales = salles.filter(s => {
          const loc = (s.localisation || '').toLowerCase();
          return loc === 'principal' || loc === 'principale';
        });

        this.sallesAnnexes = salles.filter(s => {
          const loc = (s.localisation || '').toLowerCase();
          return loc === 'annexe';
        });
      },
      error: err => {
        console.error('[Editsoutenance] getSalles()', err);
        this.errorMessage = 'Erreur lors du chargement des salles.';
      }
    });
  }

  private loadSoutenance(): void {
    this.loadingInitial = true;
    this.errorMessage = '';

    this.soutenanceService.getById(this.soutenanceId).subscribe({
      next: soutenance => {
        this.soutenanceSource = soutenance;

        const etudiantNomComplet =
          `${soutenance.etudiantPrenom || ''} ${soutenance.etudiantNom || ''}`.trim();

        const departement = soutenance.etudiantDepartement || '';
        const specialite = soutenance.etudiantSpecialite || '';
        const groupe = soutenance.etudiantGroupe || '';
        const niveau = soutenance.etudiantNiveau || this.NIVEAU;

        const nbJury = soutenance.membresJury?.length || 2;

        this.patching = true;

        this.form.patchValue(
          {
            etudiantNomComplet,
            departement,
            specialite,
            groupe,
            niveau,
            statut: soutenance.statut || 'PLANIFIEE',
            date: soutenance.date || '',
            heureDebut: (soutenance.heureDebut || '').slice(0, 5),
            duree: soutenance.duree || 90,
            salleId: soutenance.salleId || '',
            nbJury
          },
          { emitEvent: false }
        );

        this.initJury(nbJury);

        this.enseignantsSelectionnesActuels = [];

        if (soutenance.membresJury?.length) {
          soutenance.membresJury.forEach((m, index) => {
            if (this.membresJury.at(index)) {
              this.membresJury.at(index).setValue(m.enseignantId, { emitEvent: false });
            }
          });

          this.enseignantsSelectionnesActuels = soutenance.membresJury.map(m => ({
            id: m.enseignantId,
            nom: m.nomEnseignant,
            prenom: m.prenomEnseignant,
            grade: '',
            domaine: '',
            email: '',
            cin: '',
            actif: true
          } as Enseignant));
        }

        this.patching = false;

        this.chargerEnseignantsDisponibles();

        this.loadingInitial = false;
      },
      error: err => {
        console.error('[Editsoutenance] getById()', err);
        this.loadingInitial = false;
        this.errorMessage = 'Impossible de charger la soutenance à modifier.';
      }
    });
  }

  chargerEnseignantsDisponibles(): void {
    if (!this.form) return;

    const raw = this.form.getRawValue();

    const departement = raw.departement;
    const date = raw.date;
    const heureDebut = raw.heureDebut;
    const dureeValue = raw.duree;

    const duree =
      dureeValue !== null &&
      dureeValue !== undefined &&
      dureeValue !== ''
        ? Number(dureeValue)
        : undefined;

    const hasCreneau =
      !!date &&
      !!heureDebut &&
      duree !== undefined &&
      !Number.isNaN(duree) &&
      duree > 0;

    this.loadingEnseignants = true;

    this.soutenanceService
      .getEnseignantsDisponibles(
        departement || undefined,
        hasCreneau ? date : undefined,
        hasCreneau ? heureDebut : undefined,
        hasCreneau ? duree : undefined
      )
      .subscribe({
        next: enseignants => {
          this.enseignants = this.mergeEnseignants(
            enseignants as Enseignant[],
            this.enseignantsSelectionnesActuels
          );

          this.loadingEnseignants = false;
          this.updateJuryPreviews();
        },
        error: err => {
          console.error('[Editsoutenance] getEnseignantsDisponibles()', err);
          this.loadingEnseignants = false;
          this.errorMessage = 'Erreur lors du chargement des enseignants disponibles.';
        }
      });
  }

  private mergeEnseignants(disponibles: Enseignant[], selectionnes: Enseignant[]): Enseignant[] {
    const map = new Map<number, Enseignant>();

    disponibles.forEach(e => {
      if (e.id !== undefined && e.id !== null) {
        map.set(Number(e.id), e);
      }
    });

    selectionnes.forEach(e => {
      if (e.id !== undefined && e.id !== null && !map.has(Number(e.id))) {
        map.set(Number(e.id), e);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const nomA = `${a.nom || ''} ${a.prenom || ''}`.toLowerCase();
      const nomB = `${b.nom || ''} ${b.prenom || ''}`.toLowerCase();
      return nomA.localeCompare(nomB);
    });
  }

  get membresJury(): FormArray {
    return this.form.get('membresJury') as FormArray;
  }

  initJury(count: number): void {
    const n = Number(count);

    if (!n || n < 1) {
      this.membresJury.clear();
      this.juryPreviews = [];
      return;
    }

    const safeCount = Math.min(Math.max(n, 1), 5);

    this.membresJury.clear();

    for (let i = 0; i < safeCount; i++) {
      this.membresJury.push(this.fb.control('', Validators.required));
    }

    this.updateJuryPreviews();
  }

  onNbJuryChange(): void {
    const n = Number(this.form.get('nbJury')?.value);

    if (!n || n < 1 || n > 5) {
      this.membresJury.clear();
      this.juryPreviews = [];
      return;
    }

    this.initJury(n);
  }

  private resetJurySelection(): void {
    this.membresJury.controls.forEach(control => {
      control.setValue('', { emitEvent: false });
      control.markAsPristine();
      control.markAsUntouched();
    });

    this.juryPreviews = [];
  }

  updateJuryPreviews(): void {
    const ids = this.membresJury.value as (number | string)[];

    this.juryPreviews = ids
      .map(id => this.enseignants.find(e => Number(e.id) === Number(id)))
      .filter((e): e is Enseignant => e !== undefined);
  }

  hasDuplicateJury(): boolean {
    const ids = this.membresJury.value
      .filter((id: number | string) => !!id)
      .map((id: number | string) => Number(id));

    return new Set(ids).size !== ids.length;
  }

  getRoleJury(index: number): string {
    if (index === 0) return 'Président';
    if (index === 1) return 'Rapporteur';
    return `Membre ${index + 1}`;
  }

  getEnseignantDisplay(e: Enseignant): string {
    const grade = e.grade ? `${e.grade} ` : '';
    const prenom = e.prenom ?? '';
    const nom = e.nom ?? '';
    const domaine = e.domaine ? ` — ${e.domaine}` : '';

    return `${grade}${prenom} ${nom}${domaine}`.trim();
  }

  verifierDisponibilite(): void {
    const raw = this.form.getRawValue();

    const salleId = raw.salleId;
    const date = raw.date;
    const heureDebut = raw.heureDebut;
    const duree = raw.duree;

    this.successMessage = '';
    this.errorMessage = '';

    if (!salleId || !date || !heureDebut || !duree) {
      this.errorMessage = 'Veuillez remplir la salle, la date, l’heure et la durée.';
      return;
    }

    this.loadingDisponibilite = true;
    this.disponibiliteResult = null;

    this.soutenanceService
      .verifierDisponibiliteSalle(Number(salleId), date, heureDebut, Number(duree))
      .subscribe({
        next: result => {
          this.disponibiliteResult = result;
          this.loadingDisponibilite = false;
        },
        error: err => {
          console.error('[Editsoutenance] verifierDisponibiliteSalle()', err);
          this.errorMessage = 'Erreur lors de la vérification de disponibilité.';
          this.loadingDisponibilite = false;
        }
      });
  }

  getHeureFin(): string {
    const heure = this.form.get('heureDebut')?.value;
    const duree = Number(this.form.get('duree')?.value);

    if (!heure || !duree) return '--:--';

    const [h, m] = heure.split(':').map(Number);

    if (Number.isNaN(h) || Number.isNaN(m)) return '--:--';

    const total = h * 60 + m + duree;

    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }

  isInvalid(name: string): boolean {
    const control = this.form.get(name);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.submitted)
    );
  }

  isInvalidJury(i: number): boolean {
    const ctrl = this.membresJury.at(i);

    return !!(
      ctrl &&
      ctrl.invalid &&
      (ctrl.touched || ctrl.dirty || this.submitted)
    );
  }

  soumettre(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Veuillez remplir correctement tous les champs obligatoires.';
      return;
    }

    if (this.hasDuplicateJury()) {
      this.errorMessage = 'Le même enseignant est sélectionné plusieurs fois dans le jury.';
      return;
    }

    const raw = this.form.getRawValue();

    const salleId = Number(raw.salleId);
    const duree = Number(raw.duree);

    if (!salleId || Number.isNaN(salleId)) {
      this.errorMessage = 'Veuillez sélectionner une salle valide.';
      return;
    }

    if (!duree || Number.isNaN(duree) || duree <= 0) {
      this.errorMessage = 'Veuillez saisir une durée valide.';
      return;
    }

    const membresJury: MembreJury[] = this.membresJury.value
      .filter((id: number | string) => !!id)
      .map((id: number | string) => ({
        enseignantId: Number(id)
      } as MembreJury));

    const dto: Soutenance = {
      id: this.soutenanceId,
      date: raw.date,
      heureDebut: raw.heureDebut,
      duree,
      statut: raw.statut,
      salleId,
      demandeStageId: this.soutenanceSource?.demandeStageId,
      membresJury
    };

    this.loading = true;

    this.soutenanceService.update(this.soutenanceId, dto).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Soutenance ING2 modifiée avec succès.';
        this.errorMessage = '';
        this.submitted = false;
        this.disponibiliteResult = null;

        setTimeout(() => {
          this.router.navigate(['/chef_departement/soutenances']);
        }, 2000);
      },
      error: err => {
        this.loading = false;
        console.error('[Editsoutenance] update()', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error ||
          'Erreur lors de la modification de la soutenance.';
      }
    });
  }

  retour(): void {
    this.router.navigate(['/chef_departement/soutenances']);
  }
}