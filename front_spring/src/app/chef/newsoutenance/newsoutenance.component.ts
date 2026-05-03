import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Enseignant } from '../../models/enseignant';
import { Etudiant } from '../../models/etudiant';
import { Soutenance } from '../../models/soutenance';
import { MembreJury } from '../../models/membre-jury';
import { Salle } from '../../models/salle copy';
import { SoutenanceService } from '../../services/soutenance.service';
import { UtilisateurService } from '../../services/utilisateur.service';


@Component({
  selector: 'app-newsoutenance',
  templateUrl: './newsoutenance.component.html',
  styleUrl: './newsoutenance.component.css'
})
export class NewsoutenanceComponent implements OnInit {

  readonly NIVEAU = 'ING2';

  departements: string[] = ['Informatique', 'Électrique', 'Industriel'];
  specialites: string[] = [];

  enseignants: Enseignant[] = [];

  salles: Salle[] = [];
  sallesPrincipales: Salle[] = [];
  sallesAnnexes: Salle[] = [];

  etudiantsFiltered: Etudiant[] = [];
  etudiantSelectionne: Etudiant | null = null;
  demandeStageSelectionne: any = undefined;

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
    this.chargerEnseignantsDisponibles();
  }

  private initForm(): void {
    this.form = this.fb.group({
      departement: ['', Validators.required],
      specialite: ['', Validators.required],
      etudiantId: ['', Validators.required],

      statut: ['PLANIFIEE', Validators.required],

      date: ['', Validators.required],
      heureDebut: ['', Validators.required],
      duree: [10, [Validators.required, Validators.min(10), Validators.max(40)]],

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

    this.form.get('departement')?.valueChanges.subscribe(dep => {
      this.specialites = [];
      this.etudiantsFiltered = [];
      this.etudiantSelectionne = null;
      this.demandeStageSelectionne = undefined;
      this.disponibiliteResult = null;
      this.successMessage = '';
      this.errorMessage = '';

      this.form.patchValue(
        {
          specialite: '',
          etudiantId: ''
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
            console.error('[Newsoutenance] getSpecialites()', err);
            this.errorMessage = 'Erreur lors du chargement des spécialités.';
          }
        });
      }
    });

    this.form.get('specialite')?.valueChanges.subscribe(spec => {
      this.etudiantsFiltered = [];
      this.etudiantSelectionne = null;
      this.demandeStageSelectionne = undefined;
      this.disponibiliteResult = null;
      this.successMessage = '';
      this.errorMessage = '';

      this.form.patchValue(
        {
          etudiantId: ''
        },
        { emitEvent: false }
      );

      const dep = this.form.get('departement')?.value;

      if (dep && spec) {
        this.soutenanceService
          .getEtudiantsSansSoutenance(dep, spec, this.NIVEAU)
          .subscribe({
            next: etudiants => {
              this.etudiantsFiltered = etudiants;
            },
            error: err => {
              console.error('[Newsoutenance] getEtudiantsSansSoutenance()', err);
              this.errorMessage = 'Erreur lors du chargement des étudiants ING2 sans soutenance.';
            }
          });
      }
    });

    this.form.get('etudiantId')?.valueChanges.subscribe(id => {
      this.onEtudiantChange(id);
    });

    this.form.get('date')?.valueChanges.subscribe(() => {
      this.disponibiliteResult = null;
      this.resetJurySelection();
      this.chargerEnseignantsDisponibles();
    });

    this.form.get('heureDebut')?.valueChanges.subscribe(() => {
      this.disponibiliteResult = null;
      this.resetJurySelection();
      this.chargerEnseignantsDisponibles();
    });

    this.form.get('duree')?.valueChanges.subscribe(() => {
      this.disponibiliteResult = null;
      this.resetJurySelection();
      this.chargerEnseignantsDisponibles();
    });

    this.form.get('salleId')?.valueChanges.subscribe(() => {
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
        console.error('[Newsoutenance] getSalles()', err);
        this.errorMessage = 'Erreur lors du chargement des salles.';
      }
    });
  }

  chargerEnseignantsDisponibles(): void {
    if (!this.form) return;

    const departement = this.form.get('departement')?.value;
    const date = this.form.get('date')?.value;
    const heureDebut = this.form.get('heureDebut')?.value;
    const dureeValue = this.form.get('duree')?.value;

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
          this.enseignants = enseignants as Enseignant[];
          this.loadingEnseignants = false;
          this.updateJuryPreviews();
        },
        error: err => {
          console.error('[Newsoutenance] getEnseignantsDisponibles()', err);
          this.loadingEnseignants = false;
          this.errorMessage = 'Erreur lors du chargement des enseignants disponibles.';
        }
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

    return `Membre ${index + 1}`;
  }

  onEtudiantChange(id: string | number): void {
    this.etudiantSelectionne = null;
    this.demandeStageSelectionne = undefined;
    this.successMessage = '';
    this.errorMessage = '';

    if (!id) {
      return;
    }

    this.etudiantSelectionne =
      this.etudiantsFiltered.find(e => Number(e.id) === Number(id)) ?? null;

    this.soutenanceService.getDemandeStageByEtudiant(Number(id)).subscribe({
      next: demande => {
        this.demandeStageSelectionne = demande;
      },
      error: err => {
        console.error('[Newsoutenance] getDemandeStageByEtudiant()', err);
        this.demandeStageSelectionne = undefined;
        this.errorMessage = 'Aucune demande de stage trouvée pour cet étudiant.';
      }
    });
  }

  verifierDisponibilite(): void {
    const { salleId, date, heureDebut, duree } = this.form.value;

    this.successMessage = '';
    this.errorMessage = '';

    if (!salleId || !date || !heureDebut || !duree) {
      this.errorMessage = 'Veuillez remplir la salle, la date, l’heure et la durée avant de vérifier.';
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
          console.error('[Newsoutenance] verifierDisponibiliteSalle()', err);
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

  getEnseignantDisplay(e: Enseignant): string {
    const grade = e.grade ? `${e.grade} ` : '';
    const prenom = e.prenom ?? '';
    const nom = e.nom ?? '';
    const domaine = e.domaine ? ` — ${e.domaine}` : '';

    return `${grade}${prenom} ${nom}${domaine}`.trim();
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

    if (!this.etudiantSelectionne) {
      this.errorMessage = 'Veuillez sélectionner un étudiant.';
      return;
    }

    if (!this.demandeStageSelectionne?.id) {
      this.errorMessage = 'Aucune demande de stage trouvée pour cet étudiant.';
      return;
    }

    const v = this.form.value;

    const membresJury: MembreJury[] = this.membresJury.value
      .filter((id: number | string) => !!id)
      .map((id: number | string) => ({
        enseignantId: Number(id)
      } as MembreJury));

    const dto: Soutenance = {
      date: v.date,
      heureDebut: v.heureDebut,
      duree: Number(v.duree),
      statut: v.statut,
      salleId: Number(v.salleId),
      demandeStageId: this.demandeStageSelectionne.id,
      membresJury
    };

    this.loading = true;

    this.soutenanceService.create(dto).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage =
          `Soutenance ING2 planifiée pour ${this.etudiantSelectionne?.prenom} ${this.etudiantSelectionne?.nom}.`;

        this.errorMessage = '';
        this.submitted = false;
        this.disponibiliteResult = null;

        this.form.reset({
          departement: '',
          specialite: '',
          etudiantId: '',
          statut: 'PLANIFIEE',
          date: '',
          heureDebut: '',
          duree: 90,
          salleId: '',
          nbJury: 2
        });

        this.specialites = [];
        this.etudiantsFiltered = [];
        this.etudiantSelectionne = null;
        this.demandeStageSelectionne = undefined;
        this.initJury(2);

        setTimeout(() => {
          this.router.navigate(['/chef_departement/soutenances']);
        }, 2000);
      },
      error: err => {
        this.loading = false;
        console.error('[Newsoutenance] create()', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error ||
          'Erreur lors de la planification.';
      }
    });
  }

  retour(): void {
    this.router.navigate(['/chef_departement/soutenances']);
  }
}