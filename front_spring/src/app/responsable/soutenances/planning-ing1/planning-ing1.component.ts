import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Soutenance } from '../../../models/soutenance';

import { PlanningING1Request } from '../../../models/planning';
import { SoutenanceService } from '../../../services/soutenance.service';
import { UtilisateurService } from '../../../services/utilisateur.service';

@Component({
  selector: 'app-planning-ing1',
  templateUrl: './planning-ing1.component.html',
  styleUrl: './planning-ing1.component.css',
  standalone: false
})
export class PlanningIng1Component implements OnInit {

  readonly NIVEAU = 'ING1';

  form!: FormGroup;

  departements: string[] = ['Informatique', 'Électrique', 'Industriel'];
  specialites: string[] = [];

  planningResult: Soutenance[] = [];

  loading = false;
  submitted = false;

  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private planningService: SoutenanceService,
    private groupeService: UtilisateurService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.form.get('departement')?.valueChanges.subscribe(departement => {
      this.specialites = [];
      this.planningResult = [];
      this.successMessage = '';
      this.errorMessage = '';

      this.form.patchValue(
        { specialite: '' },
        { emitEvent: false }
      );

      if (departement) {
        this.loadSpecialites(departement);
      }
    });

    this.form.get('nombreJours')?.valueChanges.subscribe(value => {
      this.adjustJours(Number(value));
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      departement: ['', Validators.required],
      specialite: ['', Validators.required],

      nbJury: [2, [Validators.required, Validators.min(1), Validators.max(5)]],
      dureeParEtudiant: [15, [Validators.required, Validators.min(5), Validators.max(60)]],

      nombreJours: [1, [Validators.required, Validators.min(1), Validators.max(10)]],

      jours: this.fb.array([])
    });

    this.adjustJours(1);
  }

  get jours(): FormArray {
    return this.form.get('jours') as FormArray;
  }

  private createJourForm(): FormGroup {
    return this.fb.group({
      date: ['', Validators.required],
      heureDebut: ['08:00', Validators.required],
      heureFin: ['13:00', Validators.required]
    });
  }

  adjustJours(nombre: number): void {
    if (!nombre || Number.isNaN(nombre) || nombre < 1) {
      nombre = 1;
    }

    if (nombre > 10) {
      nombre = 10;
    }

    while (this.jours.length < nombre) {
      this.jours.push(this.createJourForm());
    }

    while (this.jours.length > nombre) {
      this.jours.removeAt(this.jours.length - 1);
    }
  }

  private loadSpecialites(departement: string): void {
    this.groupeService.getSpecialites({
      departement,
      niveau: this.NIVEAU
    }).subscribe({
      next: res => {
        this.specialites = res;
      },
      error: err => {
        console.error('[PlanningING1] getSpecialites()', err);
        this.errorMessage = 'Erreur lors du chargement des spécialités.';
      }
    });
  }

  genererPlanning(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.planningResult = [];

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Veuillez remplir correctement tous les champs obligatoires.';
      return;
    }

    if (!this.joursValides()) {
      this.errorMessage = 'Chaque jour doit avoir une heure de début inférieure à l’heure de fin.';
      return;
    }

    const v = this.form.value;

    const request: PlanningING1Request = {
      departement: v.departement,
      specialite: v.specialite,
      nbJury: Number(v.nbJury),
      dureeParEtudiant: Number(v.dureeParEtudiant),
      nombreJours: Number(v.nombreJours),
      jours: v.jours
    };

    this.loading = true;

    this.planningService.genererPlanningING1(request).subscribe({
      next: result => {
        this.loading = false;
        this.planningResult = result || [];
        this.successMessage = `${this.planningResult.length} soutenance(s) ING1 générée(s) avec succès.`;
        this.errorMessage = '';
        this.submitted = false;
      },
      error: err => {
        this.loading = false;
        console.error('[PlanningING1] genererPlanningING1()', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error ||
          'Erreur lors de la génération du planning ING1.';
      }
    });
  }

  private joursValides(): boolean {
    return this.jours.controls.every(ctrl => {
      const debut = ctrl.get('heureDebut')?.value;
      const fin = ctrl.get('heureFin')?.value;

      if (!debut || !fin) return false;

      return debut < fin;
    });
  }

  resetPlanning(): void {
    this.planningResult = [];
    this.successMessage = '';
    this.errorMessage = '';
  }

  get planningGroupes(): { groupe: string; soutenances: Soutenance[] }[] {
    const map = new Map<string, Soutenance[]>();

    for (const s of this.planningResult) {
      const key = [
        s.etudiantDepartement || '—',
        s.etudiantSpecialite || '—',
        s.etudiantGroupe || 'Sans groupe'
      ].join(' / ');

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(s);
    }

    return [...map.entries()]
      .map(([groupe, soutenances]) => ({
        groupe,
        soutenances: soutenances.sort((a, b) => {
          const dateA = `${a.date || ''} ${a.heureDebut || ''}`;
          const dateB = `${b.date || ''} ${b.heureDebut || ''}`;
          return dateA.localeCompare(dateB);
        })
      }))
      .sort((a, b) => a.groupe.localeCompare(b.groupe));
  }

  getJuryText(s: Soutenance): string {
    if (!s.membresJury || s.membresJury.length === 0) {
      return '—';
    }

    return s.membresJury
      .map(m => `${m.prenomEnseignant || ''} ${m.nomEnseignant || ''}`.trim())
      .join(', ');
  }

  isInvalid(name: string): boolean {
    const control = this.form.get(name);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.submitted)
    );
  }

  isJourInvalid(index: number, name: string): boolean {
    const control = this.jours.at(index).get(name);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.submitted)
    );
  }

  retour(): void {
    this.router.navigate(['/responsable/soutenances']);
  }
}