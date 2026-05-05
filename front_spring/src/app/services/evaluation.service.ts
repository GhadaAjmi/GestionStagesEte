import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface EvaluationRequestDTO {
  soutenanceId: number;
  noteRapport?: number | null;
  enseignantId: number ;
  notePresentation?: number | null;
  noteTechnique?: number | null;
  noteComportement?: number | null;
  commentaire?: string | null;
}

export interface EvaluationResponseDTO {
  id: number;

  // soutenance
  soutenanceId: number;
  sujetSoutenance: string;
  dateSoutenance: string;
  heureDebutSoutenance: string;
  dureeSoutenance: number;
  statutSoutenance: string;

  // étudiant
  etudiantNom: string;
  etudiantPrenom: string;
  etudiantNiveau: string;
  etudiantGroupe: string;
  etudiantDepartement: string;
  etudiantSpecialite: string;

  // salle
  codeSalle: string;
  localisationSalle: string;

  // enseignant
  enseignantId: number;
  enseignantNom: string;
  enseignantPrenom: string;

  // notes
  noteRapport: number | null;
  notePresentation: number | null;
  noteTechnique: number | null;
  noteComportement: number | null;
  noteFinale: number | null;

  // commentaire
  commentaire: string | null;

  // audit
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationMoyenneDTO {
  soutenanceId: number;
  sujetSoutenance: string;
  etudiantNom: string;
  etudiantPrenom: string;
  nombreEvaluateurs: number;
  moyenneRapport: number | null;
  moyennePresentation: number | null;
  moyenneTechnique: number | null;
  moyenneComportement: number | null;
  moyenneFinale: number | null;
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class EvaluationService {

  private readonly base = 'http://localhost:8087/api/evaluations';

  constructor(private http: HttpClient) {}

  /** Soumettre ou mettre à jour une évaluation */
  soumettre(dto: EvaluationRequestDTO): Observable<EvaluationResponseDTO> {
    return this.http.post<EvaluationResponseDTO>(this.base, dto);
  }

  /** Toutes les évaluations d'une soutenance */
  getParSoutenance(soutenanceId: any): Observable<EvaluationResponseDTO[]> {
    return this.http.get<EvaluationResponseDTO[]>(
      `${this.base}/soutenance/${soutenanceId}`
    );
  }

  /** Moyenne agrégée d'une soutenance */
  getMoyenne(soutenanceId: number): Observable<EvaluationMoyenneDTO> {
    return this.http.get<EvaluationMoyenneDTO>(
      `${this.base}/soutenance/${soutenanceId}/moyenne`
    );
  }

  /** Toutes les évaluations d'un enseignant */
  getParEnseignant(enseignantId: number): Observable<EvaluationResponseDTO[]> {
    return this.http.get<EvaluationResponseDTO[]>(
      `${this.base}/enseignant/${enseignantId}`
    );
  }

  /**
   * Évaluation d'un enseignant pour une soutenance.
   * Retourne null si le serveur renvoie 204.
   */
  getMonEvaluation(
    enseignantId: number,
    soutenanceId: number
  ): Observable<EvaluationResponseDTO | null> {
    return this.http.get<EvaluationResponseDTO | null>(
      `${this.base}/enseignant/${enseignantId}/soutenance/${soutenanceId}`
    );
  }

  /** Supprimer une évaluation (admin) */
  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // ── Helpers client ──────────────────────────────────────────────────────────

  /** Calcule la note finale localement (même pondération qu'en backend) */
  calculerNoteFinaleLocale(
    noteRapport?: number | null,
    notePresentation?: number | null,
    noteTechnique?: number | null,
    noteComportement?: number | null
  ): number | null {
    let total = 0;
    let poids = 0;

    if (noteRapport      != null) { total += noteRapport      * 0.30; poids += 0.30; }
    if (notePresentation != null) { total += notePresentation * 0.30; poids += 0.30; }
    if (noteTechnique    != null) { total += noteTechnique    * 0.25; poids += 0.25; }
    if (noteComportement != null) { total += noteComportement * 0.15; poids += 0.15; }

    return poids > 0 ? Math.round((total / poids) * 100) / 100 : null;
  }

  /** Couleur Bootstrap selon la note */
  noteCouleur(note: number | null): string {
    if (note === null || note === undefined) return 'text-muted';
    if (note >= 16) return 'text-success';
    if (note >= 12) return 'text-primary';
    if (note >= 10) return 'text-warning';
    return 'text-danger';
  }

  /** Mention selon la note finale */
  mention(note: number | null): string {
    if (note === null || note === undefined) return '—';
    if (note >= 16) return 'Très Bien';
    if (note >= 14) return 'Bien';
    if (note >= 12) return 'Assez Bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  }
}