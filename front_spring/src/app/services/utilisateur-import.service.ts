import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { Utilisateur } from '../models/utilisateur.models';


export interface ImportResult {
  total: number;
  success: number;
  errors: { ligne: number; message: string }[];
}

@Injectable({ providedIn: 'root' })
export class UtilisateurImportService {

  private apiUrl = 'http://localhost:8087/api/utilisateurs/import';

  // Mapping entre les en-têtes Excel et les champs DTO
  private readonly COLUMN_MAP: Record<string, keyof Utilisateur> = {
    'role':                 'role',
    'cin':                  'cin',
    'nom':                  'nom',
    'prenom':               'prenom',
    'email':                'email',
    'mot_de_passe':         'motDePasse',
    'motdepasse':           'motDePasse',
    'telephone':            'telephone',
    'lieu_delivrance_cin':  'lieuDelivranceCin',
    'lieudelivranceicin':   'lieuDelivranceCin',
    'date_delivrance_cin':  'dateDelivranceCin',
    'datedelivrancecin':    'dateDelivranceCin',
    'departement':          'departement',
    'actif':                'actif',
    'niveau':               'niveau',
    'specialite':           'specialite',
    'groupe':               'groupe',
    'numero_inscription':   'numeroInscription',
    'numeroinscription':    'numeroInscription',
    'grade':                'grade',
    'domaine':              'domaine',
  };

  constructor(private http: HttpClient) {}

  /**
   * Lit un fichier Excel et retourne un tableau de UtilisateurDTO
   */
  parseExcelFile(file: File): Promise<{ data: Utilisateur[]; errors: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convertir en JSON avec la première ligne comme header
          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: '',
          });

          const data: Utilisateur[] = [];
          const errors: string[] = [];

          rawRows.forEach((row, index) => {
            const dto = this.mapRowToDTO(row, index + 2); // +2 car ligne 1 = header
            if (dto.error) {
              errors.push(dto.error);
            } else {
              data.push(dto.dto!);
            }
          });

          resolve({ data, errors });
        } catch (err) {
          reject('Erreur lors de la lecture du fichier Excel : ' + err);
        }
      };

      reader.onerror = () => reject('Impossible de lire le fichier.');
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Convertit une ligne Excel brute en UtilisateurDTO
   */
  private mapRowToDTO(row: any, lineNumber: number): { dto?: Utilisateur; error?: string } {
    const dto: any = { actif: true };

    for (const key of Object.keys(row)) {
      const normalizedKey = key.toLowerCase().replace(/[\s\-]/g, '_');
      const dtoField = this.COLUMN_MAP[normalizedKey];
      if (dtoField) {
        let value = row[key];
        if (dtoField === 'actif') {
          value = value === 'true' || value === '1' || value === 'oui' || value === true;
        }
        dto[dtoField] = value;
      }
    }

    // Validation des champs obligatoires
    const required: (keyof Utilisateur)[] = ['role', 'cin', 'nom', 'prenom', 'email', 'motDePasse', 'telephone'];
    for (const field of required) {
      if (!dto[field] || String(dto[field]).trim() === '') {
        return { error: `Ligne ${lineNumber} : champ obligatoire manquant → "${field}"` };
      }
    }

    // Validation du rôle
    const validRoles = ['ETUDIANT', 'ENSEIGNANT', 'ADMIN', 'RESPONSABLE', 'CHEF_DEPARTEMENT', 'SERVICE_STAGE'];
    if (!validRoles.includes(String(dto.role).toUpperCase())) {
      return { error: `Ligne ${lineNumber} : rôle invalide → "${dto.role}"` };
    }
    dto.role = String(dto.role).toUpperCase();

    return { dto: dto as Utilisateur };
  }

  /**
   * Envoie les utilisateurs parsés vers le backend Spring Boot
   */
  importUsers(users: Utilisateur[]): Observable<ImportResult> {
    return this.http.post<ImportResult>(this.apiUrl, users, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      catchError(err => throwError(() => err.error?.message || 'Erreur serveur'))
    );
  }

  /**
   * Génère et télécharge un fichier Excel template vide
   */
  downloadTemplate(): void {
    const headers = [
      'role', 'cin', 'nom', 'prenom', 'email', 'mot_de_passe', 'telephone',
      'lieu_delivrance_cin', 'date_delivrance_cin', 'departement', 'actif',
      'niveau', 'specialite', 'groupe', 'numero_inscription', 'grade', 'domaine'
    ];

    const exampleRows = [
      {
        role: 'ETUDIANT', cin: '12345678', nom: 'Ben Ali', prenom: 'Mohamed',
        email: 'med@enicar.tn', mot_de_passe: 'Pass123!', telephone: '55123456',
        lieu_delivrance_cin: 'Tunis', date_delivrance_cin: '2020-01-15',
        departement: 'Informatique', actif: 'true',
        niveau: 'L3', specialite: 'GL', groupe: 'G1', numero_inscription: 'INF2024001',
        grade: '', domaine: ''
      },
      {
        role: 'ENSEIGNANT', cin: '87654321', nom: 'Chaabane', prenom: 'Sana',
        email: 'sana@enicar.tn', mot_de_passe: 'Pass456!', telephone: '55987654',
        lieu_delivrance_cin: 'Sfax', date_delivrance_cin: '2018-05-20',
        departement: 'Informatique', actif: 'true',
        niveau: '', specialite: '', groupe: '', numero_inscription: '',
        grade: 'Maître Assistant', domaine: 'Génie Logiciel'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(exampleRows, { header: headers });

    // Style de l'en-tête (largeur des colonnes)
    ws['!cols'] = headers.map(() => ({ wch: 20 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Utilisateurs');
    XLSX.writeFile(wb, 'template_import_utilisateurs.xlsx');
  }
}