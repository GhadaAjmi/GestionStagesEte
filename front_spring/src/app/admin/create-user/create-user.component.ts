import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur } from '../../models/utilisateur.models';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],
  standalone: false
})
export class CreateUserComponent implements OnInit {

  formUser!: FormGroup;

  departements: string[] = ['Informatique', 'Industriel', 'Électrique'];
  niveaux: string[]      = ['ING1', 'ING2', 'MASTER1'];

  allSpecialites = [
    { nom: 'GLSI',         departement: 'Informatique' },
    { nom: 'INFOTRONIQUE', departement: 'Électrique'   },
    { nom: 'MECATRONIQUE', departement: 'Industriel'   },
    { nom: 'INFORMATIQUE', departement: 'Informatique' },
    { nom: 'ARTI',         departement: 'Informatique' },
    { nom: 'TIC',          departement: 'Informatique' },
    { nom: 'MPSDM',        departement: 'Industriel'   }
  ];

  specialites: string[] = [];
  groupes: string[]     = ['A', 'B', 'C', 'D', 'E'];

  submitted      = false;
  successMessage = '';
  errorMessage   = '';

  constructor(
    private fb:          FormBuilder,
    private userService: UtilisateurService,
    private router:      Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initListeners();
  }

  initForm(): void {
    this.formUser = this.fb.group({
      // ── Champs communs ─────────────────────────────────────────────
      cin:               ['', [Validators.required, Validators.minLength(8)]],
      nom:               ['', Validators.required],
      prenom:            ['', Validators.required],
      email:             ['', [Validators.required, Validators.email]],
      motDePasse:        ['', Validators.required],
      telephone:         [''],
      lieuDelivranceCin: [''],
      dateDelivranceCin: [''],
      actif:             [true],
      role:              ['', Validators.required],

      // ── Champs conditionnels ───────────────────────────────────────
      departement: [''],

      // Étudiant
      niveau:            [''],
      specialite:        [''],
      groupe:            [''],

      // Enseignant / Chef de département
      grade:             [''],
      domaine:           ['']
    });
  }

  initListeners(): void {

    // Département → filtrer spécialités
    this.formUser.get('departement')?.valueChanges.subscribe(dep => {
      this.specialites = [];
      this.formUser.patchValue({ specialite: '', groupe: '' }, { emitEvent: false });

      if (dep) {
        this.specialites = this.allSpecialites
          .filter(s => s.departement === dep)
          .map(s => s.nom);
      }

      const specCtrl = this.formUser.get('specialite')!;
      this.specialites.length ? specCtrl.enable() : specCtrl.disable();
    });

    // Niveau → reset groupe
    this.formUser.get('niveau')?.valueChanges.subscribe(() => {
      this.formUser.patchValue({ groupe: '' }, { emitEvent: false });
    });

    // Rôle → reset tous les champs conditionnels
    this.formUser.get('role')?.valueChanges.subscribe(() => {
      this.formUser.patchValue({
        departement: '',
        niveau:      '',
        specialite:  '',
        groupe:      '',
        grade:       '',
        domaine:     ''
      }, { emitEvent: false });

      this.specialites = [];
      this.formUser.get('specialite')!.enable();
    });
  }

  onSubmit(): void {
    this.submitted     = true;
    this.successMessage = '';
    this.errorMessage   = '';

    if (this.formUser.invalid) {
      this.errorMessage = '⚠️ Tous les champs obligatoires doivent être remplis';
      return;
    }

    const form = this.formUser.getRawValue();

    const dto: Utilisateur = {
      cin:               form.cin,
      nom:               form.nom,
      prenom:            form.prenom,
      email:             form.email,
      motDePasse:        form.motDePasse,
      telephone:         form.telephone         || undefined,
      lieuDelivranceCin: form.lieuDelivranceCin || undefined,
      dateDelivranceCin: form.dateDelivranceCin || undefined,
      actif:             form.actif,
      role:              form.role,
      departement:       form.departement       || undefined
    };

    if (form.role === 'ETUDIANT') {
      dto.niveau     = form.niveau     || undefined;
      dto.specialite = form.specialite || undefined;
      dto.groupe     = form.groupe     || undefined;
    }

    if (form.role === 'ENSEIGNANT' || form.role === 'CHEF_DEPARTEMENT') {
      dto.grade   = form.grade   || undefined;
      dto.domaine = form.domaine || undefined;
    }

    this.userService.createUtilisateur(dto).subscribe({
      next: () => {
        this.successMessage = 'Utilisateur ajouté avec succès';
        this.formUser.reset({ actif: true, role: '' });
        this.formUser.get('specialite')!.enable();
        this.specialites = [];
        this.submitted   = false;
        this.router.navigate(['/admin/utilisateurs']);
      },
      error: err => {
        this.errorMessage = err?.error?.message || "Erreur lors de l'ajout";
      }
    });
  }

  isInvalid(field: string): boolean {
    const c = this.formUser.get(field);
    return !!(c && c.invalid && (c.touched || this.submitted));
  }
}