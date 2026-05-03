import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DemandeStage } from '../models/demandeStage';

export type StatutDemande = 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE' | string;

@Injectable({
  providedIn: 'root'
})
export class DemandeService {

  private readonly apiUrl = 'http://localhost:8087/api/demandes';

  constructor(private http: HttpClient) {}

  // ── Récupérer toutes les demandes ─────────────────────────────

  getAllDemandes(): Observable<DemandeStage[]> {
    return this.http.get<DemandeStage[]>(this.apiUrl);
  }

  // ── Récupérer une demande par ID ──────────────────────────────

  getDemandeById(id: number): Observable<DemandeStage> {
    return this.http.get<DemandeStage>(`${this.apiUrl}/${id}`);
  }

 

  // ── Récupérer la demande d'un étudiant ────────────────────────
  // Backend retourne DemandeStageDTO, pas une liste.

  getDemandeByEtudiant(etudiantId: number): Observable<DemandeStage> {
    return this.http.get<DemandeStage>(`${this.apiUrl}/etudiant/${etudiantId}`);
  }

  // Ancien nom si tu l'utilises déjà dans tes components.
  getDemandesByEtudiant(etudiantId: number): Observable<DemandeStage> {
    return this.getDemandeByEtudiant(etudiantId);
  }

  // ── Créer une demande ─────────────────────────────────────────

  creerDemande(demande: Partial<DemandeStage>): Observable<DemandeStage> {
    return this.http.post<DemandeStage>(this.apiUrl, demande);
  }

  // ── Modifier une demande complète ─────────────────────────────

  modifierDemande(id: number, demande: Partial<DemandeStage>): Observable<DemandeStage> {
    return this.http.put<DemandeStage>(`${this.apiUrl}/${id}`, demande);
  }

  // ── Supprimer une demande ─────────────────────────────────────

  supprimerDemande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ── Approuver une demande ─────────────────────────────────────
  // Backend : PUT /api/demandes/{id}/approuver

  approuverDemande(id: number): Observable<DemandeStage> {
    return this.http.put<DemandeStage>(`${this.apiUrl}/${id}/approuver`, {});
  }

  // ── Rejeter une demande ───────────────────────────────────────
  // Backend : PUT /api/demandes/{id}/rejeter

  rejeterDemande(id: number): Observable<DemandeStage> {
    return this.http.put<DemandeStage>(`${this.apiUrl}/${id}/rejeter`, {});
  }

  // ── Modifier seulement le statut ──────────────────────────────
  // Backend attend un DemandeStageDTO avec le champ statut.

  modifierStatutDemande(id: number, statut: StatutDemande): Observable<DemandeStage> {
    return this.http.put<DemandeStage>(`${this.apiUrl}/${id}/statut`, {
      statut
    });
  }



}


