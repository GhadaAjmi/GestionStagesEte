import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DocumentDemande } from '../models/document';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private readonly apiUrl = 'http://localhost:8087/api/documents';
  private readonly pdfUrl = 'http://localhost:8087/api/pdf';

  constructor(private http: HttpClient) {}

  // ── Ajouter un document ─────────────────────────────────────

  ajouter(
    demandeStageId: number,
    fichier: File,
    type: string
  ): Observable<DocumentDemande> {
    const formData = new FormData();

    formData.append('demandeStageId', demandeStageId.toString());
    formData.append('fichier', fichier);
    formData.append('type', type);

    return this.http.post<DocumentDemande>(this.apiUrl, formData);
  }

  // ── Obtenir les documents d'une demande ─────────────────────

  getByDemande(demandeStageId: number): Observable<DocumentDemande[]> {
    return this.http.get<DocumentDemande[]>(
      `${this.apiUrl}/demande/${demandeStageId}`
    );
  }

  // ── Obtenir les documents archivés ──────────────────────────

  getArchives(): Observable<DocumentDemande[]> {
    return this.http.get<DocumentDemande[]>(`${this.apiUrl}/archives`);
  }

  // ── Obtenir un document par id ──────────────────────────────

  getById(id: number): Observable<DocumentDemande> {
    return this.http.get<DocumentDemande>(`${this.apiUrl}/${id}`);
  }

  // ── Ouvrir document PDF dans navigateur ─────────────────────

  ouvrir(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/ouvrir/${id}`, {
      responseType: 'blob'
    });
  }

  // ── Télécharger document ────────────────────────────────────

  telecharger(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/telecharger/${id}`, {
      responseType: 'blob'
    });
  }

  // ── Modifier document ───────────────────────────────────────

  modifier(
    id: number,
    fichier?: File,
    type?: string
  ): Observable<DocumentDemande> {
    const formData = new FormData();

    if (fichier) {
      formData.append('fichier', fichier);
    }

    if (type) {
      formData.append('type', type);
    }

    return this.http.put<DocumentDemande>(`${this.apiUrl}/${id}`, formData);
  }

  // ── Valider document ────────────────────────────────────────

  valider(id: number): Observable<DocumentDemande> {
    return this.http.put<DocumentDemande>(
      `${this.apiUrl}/valider/${id}`,
      {}
    );
  }

  // ── Refuser document ────────────────────────────────────────

  refuser(id: number, motif: string): Observable<DocumentDemande> {
    const params = new HttpParams().set('motif', motif || '');

    return this.http.put<DocumentDemande>(
      `${this.apiUrl}/refuser/${id}`,
      {},
      { params }
    );
  }

  // ── Supprimer document ──────────────────────────────────────

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ── Signer convention / lettre d'affectation ────────────────
  // Compatible seulement si tu as un controller PDF :
  // POST /api/pdf/{type}/{docId}/signer

  signerDocument(
  docId: number,
  type: 'convention' | 'lettre-affectation'| 'prolongation'
): Observable<Blob> {
  return this.http.post(
    `${this.pdfUrl}/${type}/${docId}/signer`,
    {},
    { responseType: 'blob' }
  );
}

  // ── Utilitaires Blob ────────────────────────────────────────

  ouvrirBlob(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  telechargerBlob(blob: Blob, nom: string): void {
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = nom;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}