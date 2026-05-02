import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UtilisateurService } from '../../services/utilisateur.service';
import { ChangePasswordRequest } from '../../models/utilisateur.models';
import { Utilisateur } from '../../models/utilisateur.models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  standalone: false
})
export class ResetPasswordComponent implements OnInit {

  passwordForm!: FormGroup;
  currentUser: Utilisateur | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UtilisateurService,
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
        this.currentUser = user;
      },
      error: err => {
        console.error('Erreur récupération du profil', err);
        this.errorMessage = 'Impossible de charger le profil.';
      }
    });

    this.passwordForm = this.fb.group({
      ancienMotDePasse:       ['', Validators.required],
      nouveauMotDePasse:      ['', [Validators.required, Validators.minLength(3)]],
      confirmationMotDePasse: ['', Validators.required]
    });
  }

  save(): void {
    if (!this.passwordForm.valid || !this.currentUser) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const { nouveauMotDePasse, confirmationMotDePasse } = this.passwordForm.value;
    if (nouveauMotDePasse !== confirmationMotDePasse) {
      this.errorMessage = 'Le nouveau mot de passe et la confirmation ne correspondent pas.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: ChangePasswordRequest = this.passwordForm.value;

    // ✅ changePassword (nom correct dans UtilisateurService)
    this.userService.changePassword(this.currentUser.id!, payload).subscribe({
      next: () => {
        this.onSuccess();
      },
      error: (err: HttpErrorResponse) => {
        // Angular peut parser une réponse text/plain 200 comme erreur
        if (err.status === 200) {
          this.onSuccess();
        } else {
          console.error('Erreur changement de mot de passe', err);
          this.errorMessage = 'Impossible de changer le mot de passe. Vérifiez votre ancien mot de passe.';
          this.loading = false;
        }
      }
    });
  }

  private onSuccess(): void {
    this.successMessage = 'Mot de passe mis à jour avec succès.';
    this.loading = false;
    this.passwordForm.reset();
    setTimeout(() => this.router.navigate(['/profile']), 2000);
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }
}