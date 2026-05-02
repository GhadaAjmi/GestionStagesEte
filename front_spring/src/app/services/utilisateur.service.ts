import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ChangePasswordRequest,
  RoleUtilisateur,
  Utilisateur
} from '../models/utilisateur.models';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {

  private readonly apiUrl = 'http://localhost:8081/api/utilisateurs';

  constructor(private http: HttpClient) {}

  // =========================================================
  // CREATE
  // =========================================================
  createUtilisateur(utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.apiUrl}/new`, utilisateur);
  }

  // =========================================================
  // UPDATE
  // =========================================================
  updateUtilisateur(id: number, utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUrl}/${id}`, utilisateur);
  }

  // =========================================================
  // DELETE
  // =========================================================
  deleteUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // =========================================================
  // FIND ALL
  // =========================================================
  getAllUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }

  // =========================================================
  // FIND BY ID
  // =========================================================
  getUtilisateurById(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`);
  }

  // =========================================================
  // FIND BY ROLE
  // =========================================================
  getUtilisateursByRole(role: RoleUtilisateur | string): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/role/${role}`);
  }

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================
  changePassword(id: number, request: ChangePasswordRequest): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/password`, request, {
      responseType: 'text'
    });
  }

  // =========================================================
  // PHOTO
  // =========================================================
  updatePhoto(id: number, file: File): Observable<Utilisateur> {
    const formData = new FormData();
    formData.append('photoProfil', file);

    return this.http.put<Utilisateur>(`${this.apiUrl}/${id}/photo`, formData);
  }

  getPhoto(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/photo`, {
      responseType: 'blob'
    });
  }

  getPhotoUrl(id: number): string {
    return `${this.apiUrl}/${id}/photo`;
  }

  // =========================================================
  // DEPARTEMENTS
  // =========================================================
  getDepartements(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/departements`);
  }

  // =========================================================
  // NIVEAUX
  // =========================================================
  getNiveaux(departement?: string, specialite?: string): Observable<string[]> {
    let params = new HttpParams();

    if (departement) {
      params = params.set('departement', departement);
    }

    if (specialite) {
      params = params.set('specialite', specialite);
    }

    return this.http.get<string[]>(`${this.apiUrl}/niveaux`, { params });
  }

  // =========================================================
  // SPECIALITES
  // =========================================================
  getSpecialites(departement?: string, niveau?: string): Observable<string[]> {
    let params = new HttpParams();

    if (departement) {
      params = params.set('departement', departement);
    }

    if (niveau) {
      params = params.set('niveau', niveau);
    }

    return this.http.get<string[]>(`${this.apiUrl}/specialites`, { params });
  }

  // =========================================================
  // GROUPES
  // =========================================================
  getGroupes(
    departement?: string,
    specialite?: string,
    niveau?: string
  ): Observable<string[]> {
    let params = new HttpParams();

    if (departement) {
      params = params.set('departement', departement);
    }

    if (specialite) {
      params = params.set('specialite', specialite);
    }

    if (niveau) {
      params = params.set('niveau', niveau);
    }

    return this.http.get<string[]>(`${this.apiUrl}/groupes`, { params });
  }

  // =========================================================
  // ETUDIANTS PAR FILTRE
  // =========================================================
  getEtudiantsByFiltre(
    departement?: string,
    specialite?: string,
    niveau?: string,
    groupe?: string
  ): Observable<Utilisateur[]> {
    let params = new HttpParams();

    if (departement) {
      params = params.set('departement', departement);
    }

    if (specialite) {
      params = params.set('specialite', specialite);
    }

    if (niveau) {
      params = params.set('niveau', niveau);
    }

    if (groupe) {
      params = params.set('groupe', groupe);
    }

    return this.http.get<Utilisateur[]>(`${this.apiUrl}/etudiants`, { params });
  }

  // =========================================================
  // ETUDIANTS SANS SOUTENANCE
  // =========================================================
  getEtudiantsSansSoutenance(
    departement?: string,
    specialite?: string,
    niveau?: string
  ): Observable<Utilisateur[]> {
    let params = new HttpParams();

    if (departement) {
      params = params.set('departement', departement);
    }

    if (specialite) {
      params = params.set('specialite', specialite);
    }

    if (niveau) {
      params = params.set('niveau', niveau);
    }

    return this.http.get<Utilisateur[]>(
      `${this.apiUrl}/etudiants/sans-soutenance`,
      { params }
    );
  }

  // Ancienne route si ton backend/frontend l'utilise encore
  getEtudiantsSansSoutenanceOld(
    departement?: string,
    specialite?: string,
    niveau?: string
  ): Observable<Utilisateur[]> {
    let params = new HttpParams();

    if (departement) {
      params = params.set('departement', departement);
    }

    if (specialite) {
      params = params.set('specialite', specialite);
    }

    if (niveau) {
      params = params.set('niveau', niveau);
    }

    return this.http.get<Utilisateur[]>(
      `${this.apiUrl}/etudiants/sansSoutenance`,
      { params }
    );
  }

  // =========================================================
  // ENSEIGNANTS DISPONIBLES
  // =========================================================
  getEnseignantsDisponibles(
    departement?: string,
    date?: string,
    heureDebut?: string,
    duree?: number
  ): Observable<Utilisateur[]> {
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

    if (duree !== undefined && duree !== null) {
      params = params.set('duree', duree.toString());
    }

    return this.http.get<Utilisateur[]>(
      `${this.apiUrl}/enseignants/disponibles`,
      { params }
    );
  }
}