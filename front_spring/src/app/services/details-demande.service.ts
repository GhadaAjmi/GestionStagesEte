import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DocumentDemande } from '../models/document';
import { JournalStage } from '../models/journalStage';
import { Soutenance } from '../models/soutenance';
import { Utilisateur } from '../models/utilisateur.models';
import { DemandeStage } from '../models/demandeStage';
import { Prolongation } from '../models/Prolongation';

@Injectable({
  providedIn: 'root'
})
export class DetailsDemandeService {

 //private readonly base = 'http://localhost:8087/api';
 private readonly base = '/api';


  constructor(private http: HttpClient) {}

  // ── Demande de stage ──────────────────────────────────────────────────────

  getDemande(id: number): Observable<DemandeStage> {
    return this.http.get<DemandeStage>(`${this.base}/demandes/${id}`);
  }

  approuverDemande(id: number): Observable<DemandeStage> {
    return this.http.put<DemandeStage>(`${this.base}/demandes/${id}/approuver`, {});
  }

  rejeterDemande(id: number): Observable<DemandeStage> {
    return this.http.put<DemandeStage>(`${this.base}/demandes/${id}/rejeter`, {});
  }

  modifierStatutDemande(id: number, statut: string): Observable<DemandeStage> {
    return this.http.put<DemandeStage>(`${this.base}/demandes/${id}/statut`, { statut });
  }


  // ── Convention+ Lettre Affectation  ────────────────────────────────────────────────────────────

 signerDocument(docId: any, type: any): Observable<Blob> {
  return this.http.post(`${this.base}/pdf/${type}/${docId}/signer`, {}, { responseType: 'blob' });
}

 refuserDocument(id: number, motif: string): Observable<DocumentDemande> {
  return this.http.put<DocumentDemande>(
    `${this.base}/documents/refuser/${id}?motif=${encodeURIComponent(motif)}`,
    {}
  );
}

  // ── Journal de stage ──────────────────────────────────────────────────────

  getJournal(demandeId: any): Observable<JournalStage[]> {
    return this.http.get<JournalStage[]>(`${this.base}/journal/demande/${demandeId}`);
  }

  marquerJournalVue( entryId: any): Observable<JournalStage> {
    return this.http.put<JournalStage>(`${this.base}/journal/${entryId}/vue`, {});
  }
  validerJournal( entryId: any): Observable<JournalStage> {
    return this.http.put<JournalStage>(`${this.base}/journal/valider/${entryId}`, {});
  }
  commenterJournal(id: any, commentaire: string) {
  return this.http.put<JournalStage>(
    `${this.base}/journal/commenter/${id}`,
    { commentaire: commentaire }
  );
}
  // ── Attestation ───────────────────────────────────────────────────────────

 
  validerDocument(documentId: any): Observable<DocumentDemande> {
    return this.http.put<DocumentDemande>(`${this.base}/documents/valider/${documentId}`, {});
  }

 
  // ── Prolongation ──────────────────────────────────────────────────────────

  getProlongation(demandeId: any): Observable<Prolongation> {
    return this.http.get<Prolongation>(`${this.base}/prolongations/demande/${demandeId}`);
  }

  approuverProlongation(prolId: any): Observable<Prolongation> {
    return this.http.put<Prolongation>(`${this.base}/prolongations/${prolId}/approuver`, {});
  }

  rejeterProlongation(prolId: any): Observable<Prolongation> {
    return this.http.put<Prolongation>(`${this.base}/prolongations/${prolId}/refuser`, {});
  }

 

  // ── Soutenance ────────────────────────────────────────────────────────────

  getSoutenance(demandeId: number): Observable<Soutenance | null> {
    return this.http.get<Soutenance | null>(`${this.base}/demandes-stage/${demandeId}/soutenance`);
  }

  notifierJury(soutenanceId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/soutenances/${soutenanceId}/notifier-jury`, {});
  }

  annulerSoutenance(soutenanceId: number): Observable<Soutenance> {
    return this.http.put<Soutenance>(`${this.base}/soutenances/${soutenanceId}/annuler`, {});
  }

  telechargerPV(soutenanceId: number): Observable<Blob> {
    return this.http.get(`${this.base}/soutenances/${soutenanceId}/pv`, { responseType: 'blob' });
  }

  // ── Utilitaire : ouvrir un blob PDF dans nouvel onglet ────────────────────

  ouvrirBlob(blob: Blob, nom: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  telechargerBlob(blob: Blob, nom: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nom;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  getDocuments(demandeId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.base}/documents/demande/${demandeId}`);
}
}
