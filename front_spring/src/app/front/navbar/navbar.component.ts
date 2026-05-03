import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur } from '../../models/utilisateur.models';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  standalone: false
})
export class NavbarComponent implements OnInit, OnDestroy {

  imageUrl: SafeUrl | string = 'assets/images/avatar/undefined.jpg';

  @Input() userId: number | null = null;

  currentUser: Utilisateur | null = null;

  private profileSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private userService: UtilisateurService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.userId) {
      this.loadUserData();
      this.loadProfilePhoto();
    }

    this.profileSubscription = this.authService.profileUpdated$.subscribe(() => {
      if (this.userId) {
        this.loadUserData();
        this.loadProfilePhoto();
      }
    });
  }

  ngOnDestroy(): void {
    this.profileSubscription.unsubscribe();
  }

  private loadUserData(): void {
    if (!this.userId) {
      return;
    }

    this.userService.getUtilisateurById(this.userId).subscribe({
      next: (user: Utilisateur) => {
        this.currentUser = user;
      },
      error: (err) => {
        console.error('Erreur récupération utilisateur', err);
      }
    });
  }

  private loadProfilePhoto(): void {
    if (!this.userId) {
      this.imageUrl = 'assets/images/avatar/undefined.jpg';
      return;
    }

    this.userService.getPhoto(this.userId).subscribe({
      next: (blob: Blob) => {
        if (blob && blob.size > 0) {
          const objectURL = URL.createObjectURL(blob);
          this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        } else {
          this.imageUrl = 'assets/images/avatar/undefined.jpg';
        }
      },
      error: (err) => {
        console.error('Erreur récupération photo', err);
        this.imageUrl = 'assets/images/avatar/undefined.jpg';
      }
    });
  }

  ouvrirNotif(n: Notification): void {
    // À compléter si tu actives NotificationService
  }

  toutLire(): void {
    // À compléter si tu actives NotificationService
  }

  getTemps(date: string): string {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

    if (diff < 60) {
      return "à l'instant";
    }

    if (diff < 3600) {
      return `il y a ${Math.floor(diff / 60)} min`;
    }

    if (diff < 86400) {
      return `il y a ${Math.floor(diff / 3600)} h`;
    }

    return `il y a ${Math.floor(diff / 86400)} j`;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}