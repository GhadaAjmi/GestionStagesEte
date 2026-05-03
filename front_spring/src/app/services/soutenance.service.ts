import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Enseignant } from '../models/enseignant';
import { PlanificationGroupeDTO } from '../models/PlanificationGroupeDTO';
import { PlanningING1Request, PlanningING2Request } from '../models/planning';
import { Salle } from '../models/salle copy';
import { Soutenance } from '../models/soutenance';
import { Etudiant } from '../models/etudiant';

@Injectable({
  providedIn: 'root'
})
export class SoutenanceService {

 private readonly apiUrl = 'http://localhost:8087/api/soutenances';
  private readonly baseUrl = 'http://localhost:8087/api';

  constructor(private http: HttpClient) {}
 
  /** GET /api/soutenances */
  getAll(): Observable<Soutenance[]> {
    return this.http.get<Soutenance[]>(this.apiUrl);
  }
 
   getIng2(): Observable<Soutenance[]> {
  return this.http.get<Soutenance[]>(`${this.apiUrl}/niveau/2`);
}

  /** GET /api/soutenances/:id */
  getById(id: number): Observable<Soutenance> {
    return this.http.get<Soutenance>(`${this.apiUrl}/${id}`);
  }
  /** GET /api/soutenances/:id */

getByDemande(demandeId: number): Observable<Soutenance> {
  return this.http.get<Soutenance>(
    `${this.apiUrl}/demande/${demandeId}`
  );
}
  // Soutenance d'un étudiant donné
  getSoutenanceByEtudiant(etudiantId: number): Observable<Soutenance> {
    return this.http.get<Soutenance>(
      `${this.apiUrl}/etudiant/${etudiantId}`
    );
  }


  // Soutenances où un enseignant est membre du jury
  getSoutenancesByEnseignant(enseignantId: number): Observable<Soutenance[]> {
    return this.http.get<Soutenance[]>(
      `${this.apiUrl}/enseignant/${enseignantId}`
    );
  }
  /** POST /api/soutenances */
  create(dto: Soutenance): Observable<Soutenance> {
    return this.http.post<Soutenance>(this.apiUrl, dto);
  }
 
  /** PUT /api/soutenances/:id */
  update(id: any, dto: Soutenance): Observable<Soutenance> {
    return this.http.put<Soutenance>(`${this.apiUrl}/${id}`, dto);
  }
  updateStatut(id: number, statut: string): Observable<Soutenance> {
  return this.http.put<Soutenance>(
    `${this.apiUrl}/${id}/statut`,
    statut,
    {
      headers: {
        'Content-Type': 'text/plain'
      }
    }
  );
}
  /** DELETE /api/soutenances/:id */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

 genererPlanningING1(request: PlanningING1Request): Observable<Soutenance[]> {
    return this.http.post<Soutenance[]>(
      `${this.baseUrl}/planning/ing1/generer`,
      request
    );
  }
  planifierGroupe(dto: PlanificationGroupeDTO): Observable<Soutenance[]> {
    return this.http.post<Soutenance[]>(`${this.apiUrl}/groupe`, dto);
  }

  updateGroupe(
  soutenanceId: number,
  dto: PlanificationGroupeDTO
): Observable<Soutenance[]> {
  return this.http.put<Soutenance[]>(
    `${this.apiUrl}/groupe/${soutenanceId}`,
    dto
  );
}
 

  genererPlanningING2(request: PlanningING2Request): Observable<Soutenance[]> {
    return this.http.post<Soutenance[]>(
      `${this.baseUrl}/planning/ing2/generer`,
      request
    );
  }
 
 getEtudiantsByFiltre(
  departement?: string,
  specialite?: string,
  niveau?: string,
  groupe?: string
): Observable<Etudiant[]> {

  let params = new HttpParams();

  if (departement) params = params.set('departement', departement);
  if (specialite) params = params.set('specialite', specialite);
  if (niveau) params = params.set('niveau', niveau);
  if (groupe) params = params.set('groupe', groupe);

  return this.http.get<Etudiant[]>(`${this.baseUrl}/utilisateurs/etudiants`, { params });
}

 getEtudiantsSansSoutenance(
  departement?: string,
  specialite?: string,
  niveau?: string,
  groupe?: string
): Observable<Etudiant[]> {

  let params = new HttpParams();

  if (departement) params = params.set('departement', departement);
  if (specialite) params = params.set('specialite', specialite);
  if (niveau) params = params.set('niveau', niveau);

  return this.http.get<Etudiant[]>(`${this.baseUrl}/utilisateurs/etudiants/sansSoutenance`, { params });
}
  getGroupesByNiveau(niveau: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/etudiants/groupes?niveau=${niveau}`);
  }
 
  getEnseignants(): Observable<Enseignant[]> {
    return this.http.get<Enseignant[]>(`${this.apiUrl}/enseignants`);
  }
 
  getSalles(): Observable<Salle[]> {
    return this.http.get<Salle[]>(`${this.baseUrl}/salles`);
  }
 
  verifierDisponibiliteSalle(
    salleId: number,
    date: string,
    heureDebut: string,
    duree: number
  ): Observable<{ disponible: boolean; conflits?: string[] }> {
    return this.http.get<{ disponible: boolean; conflits?: string[] }>(
      `${this.baseUrl}/salles/${salleId}/disponibilite`,
      { params: { date, heureDebut, duree: duree.toString() } }
    );
  }
  // Dans soutenance.service.ts — ajouter cette méthode
getDemandeStageByEtudiant(etudiantId: number): Observable<{ id: number }> {
  return this.http.get<{ id: number }>(`${this.baseUrl}/demandes/etudiant/${etudiantId}`);
}

getEnseignantsDisponibles(
  departement?: string,
  date?: string,
  heureDebut?: string,
  duree?: number
): Observable<Enseignant[]> {
  let params = new HttpParams();

  if (departement) {
    params = params.set('departement', departement);
  }

  if (date) {
    params = params.set('date', date);
  }

  if (heureDebut) {
    params = params.set('heureDebut', heureDebut);
  }

  if (duree !== undefined && duree !== null && !Number.isNaN(duree)) {
    params = params.set('duree', duree.toString());
  }

  return this.http.get<Enseignant[]>(
    `${this.baseUrl}/utilisateurs/enseignants/disponibles`,
    { params }
  );
}

}