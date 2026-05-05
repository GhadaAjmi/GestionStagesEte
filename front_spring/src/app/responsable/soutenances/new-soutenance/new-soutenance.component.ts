import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Etudiant } from '../../../models/etudiant';
import { Enseignant } from '../../../models/enseignant';
import { Router } from '@angular/router';
import { PlanificationGroupeDTO } from '../../../models/PlanificationGroupeDTO';
import { Salle } from '../../../models/salle copy';
import { SoutenanceService } from '../../../services/soutenance.service';
import { UtilisateurService } from '../../../services/utilisateur.service';

@Component({
  selector: 'app-new-soutenance',
  templateUrl: './new-soutenance.component.html',
  styleUrl: './new-soutenance.component.css',
  standalone: false
})
export class NewSoutenanceComponent implements OnInit {

  readonly NIVEAU = 'ING1';

  departements: string[] = ['Informatique', 'Électrique', 'Industriel'];
  specialites: string[] = [];
  groupes: string[] = [];

  enseignants: Enseignant[] = [];

  salles: Salle[] = [];
  sallesPrincipales: Salle[] = [];
  sallesAnnexes: Salle[] = [];

  etudiantsGroupe: Etudiant[] = [];

  form!: FormGroup;

  loading = false;
  loadingDisponibilite = false;
  loadingEnseignants = false;

  submitted = false;

  disponibiliteResult: { disponible: boolean; conflits?: string[] } | null = null;

  successMessage = '';
  errorMessage = '';

  juryPreviews: Enseignant[] = [];

  constructor(
    private fb: FormBuilder,
    private soutenanceService: SoutenanceService,
    private groupeService: UtilisateurService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initJury(2);
    this.loadReferentiels();

    // Charge tous les enseignants au début, sans filtre.
    this.chargerEnseignantsDisponibles();
  }

  private initForm(): void {
    this.form = this.fb.group({
      departement: ['', Validators.required],
      specialite: ['', Validators.required],
      groupe: ['', Validators.required],

      statut: ['PLANIFIEE', Validators.required],

      date: ['', Validators.required],
      heureDebut: ['', Validators.required],
      duree: [60, [Validators.required, Validators.min(30), Validators.max(240)]],

      salleId: ['', Validators.required],

      nbJury: [2, [Validators.required, Validators.min(1), Validators.max(5)]],

      membresJury: this.fb.array([])
    });

    this.form.get('membresJury')?.valueChanges.subscribe(() => {
      this.updateJuryPreviews();
    });

    this.form.get('nbJury')?.valueChanges.subscribe(() => {
      this.onNbJuryChange();
    });

    // Département -> spécialités + enseignants disponibles
    this.form.get('departement')?.valueChanges.subscribe(dep => {
      this.specialites = [];
      this.groupes = [];
      this.etudiantsGroupe = [];
      this.disponibiliteResult = null;
      this.successMessage = '';
      this.errorMessage = '';

      this.form.patchValue(
        {
          specialite: '',
          groupe: ''
        },
        { emitEvent: false }
      );

      this.resetJurySelection();
      this.chargerEnseignantsDisponibles();

      if (dep) {
        this.groupeService.getSpecialites({
          departement: dep,
          niveau: this.NIVEAU
        }).subscribe({
          next: res => {
            this.specialites = res;
          },
          error: err => {
            console.error('[NewSoutenance] getSpecialites()', err);
            this.errorMessage = 'Erreur lors du chargement des spécialités.';
          }
        });
      }
    });

    // Spécialité -> groupes
    this.form.get('specialite')?.valueChanges.subscribe(spec => {
      this.groupes = [];
      this.etudiantsGroupe = [];
      this.disponibiliteResult = null;
      this.successMessage = '';
      this.errorMessage = '';

      this.form.patchValue(
        {
          groupe: ''
        },
        { emitEvent: false }
      );

      const dep = this.form.get('departement')?.value;

      if (dep && spec) {
        this.groupeService.getGroupes({
          departement: dep,
          niveau: this.NIVEAU,
          specialite: spec
        }).subscribe({
          next: res => {
            this.groupes = res;
          },
          error: err => {
            console.error('[NewSoutenance] getGroupes()', err);
            this.errorMessage = 'Erreur lors du chargement des groupes.';
          }
        });
      }
    });

    // Groupe -> étudiants
    this.form.get('groupe')?.valueChanges.subscribe(groupe => {
      this.etudiantsGroupe = [];
      this.disponibiliteResult = null;
      this.successMessage = '';
      this.errorMessage = '';

      const dep = this.form.get('departement')?.value;
      const spec = this.form.get('specialite')?.value;

      if (dep && spec && groupe) {
        this.soutenanceService
          .getEtudiantsByFiltre(dep, spec, this.NIVEAU, groupe)
          .subscribe({
            next: etudiants => {
              this.etudiantsGroupe = etudiants;
            },
            error: err => {
              console.error('[NewSoutenance] getEtudiantsByFiltre()', err);
              this.errorMessage = 'Erreur lors du chargement des étudiants du groupe.';
            }
          });
      }
    });

    // Date -> enseignants disponibles
    this.form.get('date')?.valueChanges.subscribe(() => {
      this.disponibiliteResult = null;
      this.resetJurySelection();
      this.chargerEnseignantsDisponibles();
    });

    // Heure début -> enseignants disponibles
    this.form.get('heureDebut')?.valueChanges.subscribe(() => {
      this.disponibiliteResult = null;
      this.resetJurySelection();
      this.chargerEnseignantsDisponibles();
    });

    // Durée -> enseignants disponibles
    this.form.get('duree')?.valueChanges.subscribe(() => {
      this.disponibiliteResult = null;
      this.resetJurySelection();
      this.chargerEnseignantsDisponibles();
    });
  }

  private loadReferentiels(): void {
    this.soutenanceService.getSalles().subscribe({
      next: salles => {
        this.salles = salles;

        this.sallesPrincipales = salles.filter(
          s => s.localisation?.toLowerCase() === 'principale'
        );

        this.sallesAnnexes = salles.filter(
          s => s.localisation?.toLowerCase() === 'annexe'
        );
      },
      error: err => {
        console.error('[NewSoutenance] getSalles()', err);
        this.errorMessage = 'Erreur lors du chargement des salles.';
      }
    });
  }

  chargerEnseignantsDisponibles(): void {
    const departement = this.form?.get('departement')?.value;
    const date = this.form?.get('date')?.value;
    const heureDebut = this.form?.get('heureDebut')?.value;
    const duree = this.form?.get('duree')?.value;

    const hasCreneau = !!date && !!heureDebut && !!duree;

    this.loadingEnseignants = true;

    this.soutenanceService
      .getEnseignantsDisponibles(
        departement || undefined,
        hasCreneau ? date : undefined,
        hasCreneau ? heureDebut : undefined,
        hasCreneau ? Number(duree) : undefined
      )
      .subscribe({
        next: enseignants => {
          this.enseignants = enseignants as Enseignant[];
          this.loadingEnseignants = false;
          this.updateJuryPreviews();
        },
        error: err => {
          console.error('[NewSoutenance] getEnseignantsDisponibles()', err);
          this.loadingEnseignants = false;
          this.errorMessage = 'Erreur lors du chargement des enseignants disponibles.';
        }
      });
  }

  private resetJurySelection(): void {
    this.membresJury.controls.forEach(control => {
      control.setValue('', { emitEvent: false });
      control.markAsPristine();
      control.markAsUntouched();
    });

    this.juryPreviews = [];
  }

  get membresJury(): FormArray {
    return this.form.get('membresJury') as FormArray;
  }

  getRoleJury(index: number): string {
  
    return `Membre ${index + 1}`;
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

  updateJuryPreviews(): void {
    const ids = this.membresJury.value as (number | string)[];

    this.juryPreviews = ids
      .map(id => this.enseignants.find(e => e.id === Number(id)))
      .filter((e): e is Enseignant => e !== undefined);
  }

  hasDuplicateJury(): boolean {
    const ids = this.membresJury.value
      .filter((id: number | string) => !!id)
      .map((id: number | string) => Number(id));

    return new Set(ids).size !== ids.length;
  }

  getEnseignantDisplay(e: Enseignant): string {
    const grade = e.grade ? `${e.grade} ` : '';
    const prenom = e.prenom ?? '';
    const nom = e.nom ?? '';
    const domaine = e.domaine ? ` — ${e.domaine}` : '';

    return `${grade}${prenom} ${nom}${domaine}`.trim();
  }

  verifierDisponibilite(): void {
    const { salleId, date, heureDebut, duree } = this.form.value;

    this.successMessage = '';
    this.errorMessage = '';

    if (!salleId || !date || !heureDebut || !duree) {
      this.errorMessage = 'Veuillez remplir la salle, la date, l’heure et la durée.';
      return;
    }

    this.loadingDisponibilite = true;
    this.disponibiliteResult = null;

    this.soutenanceService
      .verifierDisponibiliteSalle(+salleId, date, heureDebut, +duree)
      .subscribe({
        next: result => {
          this.disponibiliteResult = result;
          this.loadingDisponibilite = false;
        },
        error: err => {
          console.error('[NewSoutenance] verifierDisponibiliteSalle()', err);
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

  isInvalidJury(i: number): boolean {
    const ctrl = this.membresJury.at(i);

    return !!(
      ctrl &&
      ctrl.invalid &&
      (ctrl.touched || ctrl.dirty || this.submitted)
    );
  }

  isInvalid(name: string): boolean {
    const control = this.form.get(name);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.submitted)
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

    if (this.etudiantsGroupe.length === 0) {
      this.errorMessage = 'Aucun étudiant disponible dans ce groupe.';
      return;
    }

    const v = this.form.value;

    const dto: PlanificationGroupeDTO = {
      groupe: v.groupe,
      niveau: this.NIVEAU,
      date: v.date,
      heureDebut: v.heureDebut,
      duree: Number(v.duree),
      salleId: Number(v.salleId),
      statut: v.statut,

      membresJury: this.membresJury.value
        .filter((id: number | string) => !!id)
        .map((id: number | string) => ({
          enseignantId: Number(id)
        })),

      etudiantIds: this.etudiantsGroupe
        .map(e => e.id)
        .filter((id): id is number => id !== undefined && id !== null)
    };

    this.loading = true;

    this.soutenanceService.planifierGroupe(dto).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Planification réussie.';
        this.errorMessage = '';
        this.submitted = false;
        this.disponibiliteResult = null;

        this.form.reset({
          departement: '',
          specialite: '',
          groupe: '',
          statut: 'PLANIFIEE',
          date: '',
          heureDebut: '',
          duree: 60,
          salleId: '',
          nbJury: 2
        });

        setTimeout(() => {
      this.router.navigate(['/responsable/soutenances']);
    }, 2000);
  },
      error: err => {
        this.loading = false;
        console.error('[NewSoutenance] planifierGroupe()', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error ||
          'Erreur lors de la planification.';
      }
    });
  }

  retour(): void {
    this.router.navigate(['/responsable/soutenances']);
  }
}