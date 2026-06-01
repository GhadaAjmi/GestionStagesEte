import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DemandeStage } from '../models/demandeStage';
import { ConventionRequestDTO } from '../models/ConventionRequestDTO';
import { LettreRequestDTO } from '../models/lettreRequestDTO'
import { DemandeRequestDTO } from '../models/demandeRequest';
import { DemandeSoumissionResponseDTO } from '../models/demandeResponse';
export type StatutDemande = 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE' | string;

@Injectable({
  providedIn: 'root'
})
export class DemandeService {

  //private readonly apiUrl = 'http://localhost:8087/api/demandes';
  //private readonly baseUrl = 'http://localhost:8087/api';
  private readonly apiUrl = '/api/demandes';
  private readonly baseUrl = '/api';
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

//-----------------------------------------




  creerDemande(demande: DemandeStage): Observable<DemandeStage> {
    return this.http.post<DemandeStage>(
      `${this.baseUrl}/demandes`, demande
    );
  }

  // ── PDF ────────────────────────────────────────────────────────────

  genererLettre(demandeId: number, dto: LettreRequestDTO) {
    return this.http.post(
      `${this.baseUrl}/pdf/demande/${demandeId}/lettre-affectation`, dto, {
    responseType: 'blob'
  }
    );
  }

  genererConvention(demandeId: number, dto: ConventionRequestDTO) {
    return this.http.post(
      `${this.baseUrl}/pdf/demande/${demandeId}/convention`, dto, {
    responseType: 'blob'
  }
    );
  }

  telechargerDocument(documentId: number): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/documents/telecharger/${documentId}`,
      { responseType: 'blob' }
    );
  }
  telechargerAvenant(demandeId: number): Observable<Blob> {
  return this.http.get(
    `${this.baseUrl}/pdf/demande/${demandeId}/avenant`,
    { responseType: 'blob' }
  );
}
demanderProlongation(demandeId: number, dateFinProlongee: string): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/prolongations?demandeId=${demandeId}&dateFinProlongee=${dateFinProlongee}`,
    {}
  );
}

soumettreDemandeComplete(dto: DemandeRequestDTO): Observable<Blob> {
  return this.http.post(
    `${this.baseUrl}/demandes/soumettre`,
    dto,
    {
      responseType: 'blob'
    }
  );
}

}


