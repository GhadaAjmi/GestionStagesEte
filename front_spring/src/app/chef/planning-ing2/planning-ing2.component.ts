import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Soutenance } from '../../models/soutenance';

import { PlanningING2Request } from '../../models/planning';
import { SoutenanceService } from '../../services/soutenance.service';

@Component({
  selector: 'app-planning-ing2',
  templateUrl: './planning-ing2.component.html',
  styleUrl: './planning-ing2.component.css',
  standalone: false 
})
export class PlanningIng2Component implements OnInit {

  readonly NIVEAU = 'ING2';

  form!: FormGroup;

  departements: string[] = ['Informatique', 'Électrique', 'Industriel'];

  planningResult: Soutenance[] = [];

  loading = false;
  submitted = false;

  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private planningService: SoutenanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.form.get('departement')?.valueChanges.subscribe(departement => {
      this.planningResult = [];
      this.successMessage = '';
      this.errorMessage = '';


    });

    this.form.get('nombreJours')?.valueChanges.subscribe(value => {
      this.adjustJours(Number(value));
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      departement: ['', Validators.required],
      nbJury: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      dureeSoutenance: [60, [Validators.required, Validators.min(15), Validators.max(240)]],

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

    const request: PlanningING2Request = {
      departement: v.departement,
      nbJury: Number(v.nbJury),
      dureeSoutenance: Number(v.dureeSoutenance),
      nombreJours: Number(v.nombreJours),
      jours: v.jours
    };

    this.loading = true;

    this.planningService.genererPlanningING2(request).subscribe({
      next: result => {
        this.loading = false;
        this.planningResult = result || [];
        this.successMessage =
          `${this.planningResult.length} soutenance(s) ING2 générée(s) et enregistrée(s) avec succès.`;
        this.errorMessage = '';
        this.submitted = false;
      },
      error: err => {
        this.loading = false;
        console.error('[PlanningING2] genererPlanningING2()', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error ||
          'Erreur lors de la génération du planning ING2.';
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

  get planningParDate(): { date: string; soutenances: Soutenance[] }[] {
    const map = new Map<string, Soutenance[]>();

    for (const s of this.planningResult) {
      const key = s.date || 'Sans date';

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(s);
    }

    return [...map.entries()]
      .map(([date, soutenances]) => ({
        date,
        soutenances: soutenances.sort((a, b) => {
          const heureA = a.heureDebut || '';
          const heureB = b.heureDebut || '';
          return heureA.localeCompare(heureB);
        })
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
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
    this.router.navigate(['/chef_departement/soutenances']);
  }
}