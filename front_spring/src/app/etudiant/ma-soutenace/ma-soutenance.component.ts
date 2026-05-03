import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterLink } from '@angular/router';
import localeFr from '@angular/common/locales/fr';

import { AuthService } from '../../services/auth.service';
import { SoutenanceService } from '../../services/soutenance.service';
import { Soutenance } from '../../models/soutenance';

registerLocaleData(localeFr);

@Component({
  selector: 'app-ma-soutenance',
  standalone: false,
  templateUrl: './ma-soutenance.component.html',
  styleUrls: ['./ma-soutenance.component.css']
})
export class MaSoutenanceComponent implements OnInit {

  soutenance: Soutenance | null = null;
  loading: boolean = true;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private soutenanceService: SoutenanceService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.loading = false;
      this.errorMessage = 'Utilisateur non connecté.';
      this.soutenance = null;
      this.initFeather();
      return;
    }

    this.chargerSoutenance(userId);
  }

  chargerSoutenance(etudiantId: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.soutenanceService.getSoutenanceByEtudiant(etudiantId).subscribe({
      next: (soutenance) => {
        this.soutenance = {
          ...soutenance,
          membresJury: soutenance.membresJury || []
        };

        this.loading = false;
        this.initFeather();
      },
      error: (err) => {
        console.error('Erreur récupération soutenance étudiant :', err);

        this.soutenance = null;
        this.loading = false;

        // Pas forcément une vraie erreur : ça peut juste dire aucune soutenance planifiée
        this.errorMessage = '';
        this.initFeather();
      }
    });
  }

  getStatutBadge(): string {
    switch (this.soutenance?.statut) {
      case 'PLANIFIEE':
        return 'bg-soft-primary text-primary';

      case 'VALIDEE':
      case 'TERMINEE':
        return 'bg-soft-success text-success';

      case 'ANNULEE':
        return 'bg-soft-danger text-danger';

      default:
        return 'bg-soft-secondary text-secondary';
    }
  }

  initFeather(): void {
    setTimeout(() => {
      if ((window as any).feather) {
        (window as any).feather.replace();
      }
    }, 100);
  }
}