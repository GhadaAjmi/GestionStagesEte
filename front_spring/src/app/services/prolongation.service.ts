import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Prolongation } from '../models/Prolongation';

@Injectable({
  providedIn: 'root'
})
export class ProlongationService {

 private readonly apiUrl = 'http://localhost:8087/api/prolongations';

  constructor(private http: HttpClient) {}

  // ── Demander une prolongation ────────────────────────────────
  // Backend : POST /api/prolongations?demandeId=...&dateFinProlongee=...

  demanderProlongation(
    demandeId: number,
    dateFinProlongee: string
  ): Observable<Prolongation> {
    const params = new HttpParams()
      .set('demandeId', demandeId.toString())
      .set('dateFinProlongee', dateFinProlongee);

    return this.http.post<Prolongation>(this.apiUrl, null, { params });
  }

  // ── Récupérer la prolongation d'une demande ──────────────────
  // Backend : GET /api/prolongations/demande/{demandeId}

  getProlongation(demandeId: number): Observable<Prolongation> {
    return this.http.get<Prolongation>(
      `${this.apiUrl}/demande/${demandeId}`
    );
  }

  getByDemande(demandeId: number): Observable<Prolongation> {
    return this.getProlongation(demandeId);
  }

  // ── Récupérer toutes les prolongations ───────────────────────
  // Backend : GET /api/prolongations

  getAll(): Observable<Prolongation[]> {
    return this.http.get<Prolongation[]>(this.apiUrl);
  }

  // ── Approuver une prolongation ───────────────────────────────
  // Backend : PUT /api/prolongations/{id}/approuver

  approuverProlongation(prolId: number): Observable<Prolongation> {
    return this.http.put<Prolongation>(
      `${this.apiUrl}/${prolId}/approuver`,
      {}
    );
  }

  approuver(id: number): Observable<Prolongation> {
    return this.approuverProlongation(id);
  }

  // ── Refuser une prolongation ─────────────────────────────────
  // Backend : PUT /api/prolongations/{id}/refuser

  rejeterProlongation(prolId: number): Observable<Prolongation> {
    return this.http.put<Prolongation>(
      `${this.apiUrl}/${prolId}/refuser`,
      {}
    );
  }

  refuser(id: number): Observable<Prolongation> {
    return this.rejeterProlongation(id);
  }
}