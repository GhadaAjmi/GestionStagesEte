import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Utilisateur } from '../../models/utilisateur.models';
import { AuthService } from '../../services/auth.service';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-profileedit',
  templateUrl: './profileedit.component.html',
  styleUrls: ['./profileedit.component.css'],
  standalone: false
})
export class ProfileeditComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: Utilisateur | null = null;
  photoUrl: SafeUrl | string = 'assets/images/avatar/default.png';
  selectedPhoto?: File;
  isSaving = false;
  errorMessage = '';
  savedMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UtilisateurService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'Utilisateur non connecté.';
      return;
    }

    this.userService.getUtilisateurById(userId).subscribe({
      next: user => {
        this.currentUser = user as Utilisateur;
        this.initForm(user);
        this.loadPhoto(user.id!);
      },
      error: err => {
        console.error('Erreur récupération du profil', err);
        this.errorMessage = 'Impossible de charger le profil.';
      }
    });
  }

  private initForm(user: Utilisateur): void {
    this.profileForm = this.fb.group({
      // ── Champs lecture seule (gérés par l'administration) ──────────
      nom:                  [{ value: user.nom                 || '', disabled: true }],
      prenom:               [{ value: user.prenom              || '', disabled: true }],
      email:                [{ value: user.email               || '', disabled: true }],
      cin:                  [{ value: user.cin                 || '', disabled: true }],
      role:                 [{ value: user.role                || '', disabled: true }],
      actif:                [{ value: user.actif,                    disabled: true }],
      telephone:            [{ value: user.telephone           || '', disabled: true }],
      lieuDelivranceCin:    [{ value: user.lieuDelivranceCin   || '', disabled: true }],
      dateDelivranceCin:    [{ value: user.dateDelivranceCin   || '', disabled: true }],

      // ── Champs éditables ÉTUDIANT ───────────────────────────────────
      niveau:               [user.niveau            || ''],
      specialite:           [user.specialite        || ''],
      departement:          [user.departement       || ''],
      groupe:               [user.groupe            || ''],
      numeroInscription:    [{ value: user.numeroInscription || '', disabled: true }],

      // ── Champs éditables ENSEIGNANT / CHEF_DEPARTEMENT ─────────────
      grade:                [user.grade             || ''],
      domaine:              [user.domaine           || ''],
    });
  }

  private loadPhoto(userId: number): void {
    this.userService.getPhoto(userId).subscribe({
      next: blob => {
        const objectURL = URL.createObjectURL(blob);
        this.photoUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: () => {
        this.photoUrl = 'assets/images/avatar/default.png';
      }
    });
  }

  onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPhoto = input.files[0];
      this.photoUrl = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(this.selectedPhoto)
      );
    }
  }

  save(): void {
    if (!this.currentUser || this.isSaving) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.savedMessage = '';

    const data: Utilisateur = {
      ...this.currentUser,
      ...this.profileForm.getRawValue()
    };

    // ✅ updateUtilisateur (nom correct dans UtilisateurService)
    this.userService.updateUtilisateur(this.currentUser.id!, data).subscribe({
      next: updated => {
        this.currentUser = updated as Utilisateur;
        this.savedMessage = 'Profil mis à jour avec succès.';
        this.authService.notifyProfileUpdate();
        if (this.selectedPhoto) {
          this.uploadPhoto();
        } else {
          this.isSaving = false;
          setTimeout(() => this.router.navigate(['/profile']), 1500);
        }
      },
      error: err => {
        console.error('Erreur mise à jour du profil', err);
        this.errorMessage = 'Impossible de mettre à jour le profil.';
        this.isSaving = false;
      }
    });
  }

  private uploadPhoto(): void {
    if (!this.currentUser || !this.selectedPhoto) {
      this.isSaving = false;
      return;
    }

    this.userService.updatePhoto(this.currentUser.id!, this.selectedPhoto).subscribe({
      next: updated => {
        this.currentUser = updated as Utilisateur;
        this.loadPhoto(this.currentUser!.id!);
        this.selectedPhoto = undefined;
        this.isSaving = false;
        this.authService.notifyProfileUpdate();
        setTimeout(() => this.router.navigate(['/profile']), 1500);
      },
      error: err => {
        console.error('Erreur mise à jour de la photo', err);
        this.errorMessage = 'Profil mis à jour, mais impossible de sauvegarder la photo.';
        this.isSaving = false;
      }
    });
  }

  hasStudentFields(): boolean {
    return !!this.currentUser && this.currentUser.role?.toUpperCase() === 'ETUDIANT';
  }

  hasTeacherFields(): boolean {
    const role = this.currentUser?.role?.toUpperCase();
    return !!this.currentUser && (role === 'ENSEIGNANT' || role === 'CHEF_DEPARTEMENT');
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }
}