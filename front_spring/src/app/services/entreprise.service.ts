import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Entreprise } from '../models/entreprise';

@Injectable({
  providedIn: 'root'
})
export class EntrepriseService {

  private readonly apiUrl = 'http://localhost:8087/api/entreprises';

  constructor(private http: HttpClient) {}

  // ── Ajouter une entreprise ─────────────────────────────

  save(entreprise: Entreprise): Observable<Entreprise> {
    return this.http.post<Entreprise>(this.apiUrl, entreprise);
  }

  // Alias si tu préfères le nom "create"
  create(entreprise: Entreprise): Observable<Entreprise> {
    return this.save(entreprise);
  }

  // ── Récupérer toutes les entreprises ───────────────────

  findAll(): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(this.apiUrl);
  }

  // Alias si tu préfères le nom "getAll"
  getAll(): Observable<Entreprise[]> {
    return this.findAll();
  }

  // ── Récupérer une entreprise par ID ────────────────────

  findById(id: number): Observable<Entreprise> {
    return this.http.get<Entreprise>(`${this.apiUrl}/${id}`);
  }

  // Alias si tu préfères le nom "getById"
  getById(id: number): Observable<Entreprise> {
    return this.findById(id);
  }

  // ── Modifier une entreprise ────────────────────────────

  update(id: number, entreprise: Entreprise): Observable<Entreprise> {
    return this.http.put<Entreprise>(`${this.apiUrl}/${id}`, entreprise);
  }

  // ── Supprimer une entreprise ───────────────────────────

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Alias si tu préfères le nom "supprimer"
  supprimer(id: number): Observable<void> {
    return this.delete(id);
  }

  // ── Rechercher par nom ─────────────────────────────────
  // Backend : GET /api/entreprises/search?nom=...

  searchByNom(nom: string): Observable<Entreprise[]> {
    const params = new HttpParams().set('nom', nom || '');

    return this.http.get<Entreprise[]>(`${this.apiUrl}/search`, {
      params
    });
  }
}