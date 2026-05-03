import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoriService {

  private apiUrl = 'http://localhost:8087/api/favoris'; 

  constructor(private http: HttpClient) { }

  // ── Toggle favori
  toggleFavori(travailId: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/${travailId}/toggle`, {});
  }

  // ── Récupérer les IDs favoris de l'utilisateur connecté
  getMesFavorisIds(): Observable<number[]> {
    return this.http.get<number[]>(this.apiUrl);
  }
}