import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { JournalStage } from '../models/journalStage';

@Injectable({
  providedIn: 'root'
})
export class JournalService {

  private readonly apiUrl = 'http://localhost:8087/api/journal';

  constructor(private http: HttpClient) {}

  // ── Récupérer les journaux d'une demande ─────────────────────

  getByDemande(demandeId: number): Observable<JournalStage[]> {
    return this.http.get<JournalStage[]>(`${this.apiUrl}/demande/${demandeId}`);
  }

  // Ancien nom si tu l'utilises déjà
  getJournal(demandeId: number): Observable<JournalStage[]> {
    return this.getByDemande(demandeId);
  }

  // ── Récupérer un journal par ID ──────────────────────────────

  getById(id: number): Observable<JournalStage> {
    return this.http.get<JournalStage>(`${this.apiUrl}/${id}`);
  }

  // ── Créer un journal ─────────────────────────────────────────

  create(journal: Partial<JournalStage>): Observable<JournalStage> {
    return this.http.post<JournalStage>(this.apiUrl, journal);
  }

  // ── Modifier un journal complet ──────────────────────────────

  update(id: number, journal: Partial<JournalStage>): Observable<JournalStage> {
    return this.http.put<JournalStage>(`${this.apiUrl}/${id}`, journal);
  }

  // ── Supprimer un journal ─────────────────────────────────────

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ── Marquer comme vu ─────────────────────────────────────────

  marquerVue(id: number): Observable<JournalStage> {
    return this.http.put<JournalStage>(`${this.apiUrl}/${id}/vue`, {});
  }

  // Ancien nom si tu l'utilises déjà
  marquerJournalVue(entryId: number): Observable<JournalStage> {
    return this.marquerVue(entryId);
  }

  // ── Valider journal ──────────────────────────────────────────

  valider(id: number): Observable<JournalStage> {
    return this.http.put<JournalStage>(`${this.apiUrl}/valider/${id}`, {});
  }

  // Ancien nom si tu l'utilises déjà
  validerJournal(entryId: number): Observable<JournalStage> {
    return this.valider(entryId);
  }

  // ── Commenter journal ────────────────────────────────────────

  commenter(id: number, commentaire: string): Observable<JournalStage> {
    return this.http.put<JournalStage>(
      `${this.apiUrl}/commenter/${id}`,
      { commentaire }
    );
  }

  // Ancien nom si tu l'utilises déjà
  commenterJournal(id: number, commentaire: string): Observable<JournalStage> {
    return this.commenter(id, commentaire);
  }
   private baseUrl = 'http://localhost:8087/api';


  getJournalByDemande(demandeId: number): Observable<JournalStage[]> {
    return this.http.get<JournalStage[]>(
      `${this.baseUrl}/journal/demande/${demandeId}`
    );
  }

  ajouterEntree(entree: any): Observable<JournalStage> {
    return this.http.post<JournalStage>(
      `${this.baseUrl}/journal`, entree
    );
  }

  modifierEntree(id: number, entree: any): Observable<JournalStage> {
    return this.http.put<JournalStage>(
      `${this.baseUrl}/journal/${id}`, entree
    );
  }

  supprimerEntree(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/journal/${id}`);
  }

  telechargerJournalPDF(demandeId: number): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/pdf/demande/${demandeId}/journal`,
      { responseType: 'blob' }
    );
  }
}