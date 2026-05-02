import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur } from '../../models/utilisateur.models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  standalone: false
})
export class ProfileComponent implements OnInit {

  currentUser: Utilisateur | null = null;
  photoUrl: SafeUrl | string = 'assets/images/avatar/default.png';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private userService: UtilisateurService,
    private sanitizer: DomSanitizer
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
        this.loadPhoto(user.id!);
      },
      error: err => {
        console.error('Erreur récupération du profil', err);
        this.errorMessage = 'Impossible de charger le profil.';
      }
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

  hasStudentFields(): boolean {
    return !!this.currentUser && this.currentUser.role?.toUpperCase() === 'ETUDIANT';
  }

  hasTeacherFields(): boolean {
    const role = this.currentUser?.role?.toUpperCase();
    return !!this.currentUser && (role === 'ENSEIGNANT' || role === 'CHEF_DEPARTEMENT');
  }
}