import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FavoriService {

  private apiUrl = 'http://localhost:8087/api/favoris';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ── Toggle favori
  toggleFavori(travailId: number): Observable<boolean> {
    const utilisateurId = this.authService.getUserId();

    console.log('TOGGLE FAVORI - utilisateurId:', utilisateurId);
    console.log('TOGGLE FAVORI - travailId:', travailId);

    if (!utilisateurId) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }

    const params = new HttpParams()
      .set('utilisateurId', utilisateurId.toString());

    return this.http.post<boolean>(
      `${this.apiUrl}/${travailId}/toggle`,
      {},
      { params }
    );
  }

  // ── Récupérer les IDs favoris de l'utilisateur connecté
  getMesFavorisIds(): Observable<number[]> {
    const utilisateurId = this.authService.getUserId();

    console.log('GET FAVORIS - utilisateurId:', utilisateurId);

    if (!utilisateurId) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }

    const params = new HttpParams()
      .set('utilisateurId', utilisateurId.toString());

    return this.http.get<number[]>(
      this.apiUrl,
      { params }
    );
  }
}