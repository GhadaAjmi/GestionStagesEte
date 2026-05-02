import { StatutSoutenance } from './enums';

export interface MembreJury {
  id?: number;
  enseignantId: number;
  nomEnseignant?: string;
  prenomEnseignant?: string;
}

export interface Soutenance {
  id?: number;
  date: string;
  heureDebut: string;
  duree: number;
  statut: StatutSoutenance | string;

  // Demande de stage
  demandeStageId?: number;
  sujetDemande?: string;

  // Étudiant (enrichi)
  etudiantNom?: string;
  etudiantPrenom?: string;
  etudiantNiveau?: string;
  etudiantGroupe?: string;
  etudiantSpecialite?: string;
  etudiantDepartement?: string;

  // Salle
  salleId?: number;
  codeSalle?: string;
  localisationSalle?: string;

  // Jury
  membresJury: MembreJury[];

  // UI only
  selected?: boolean;
}


export interface SoutenanceFilter {
  date?: string;
  salleCode?: string;
  statut?: string;
  heureDebut?: string;
  heureFin?: string;
  etudiant?: string;
  niveau?: string;
  groupe?: string;
  departement?: string;
  specialite?: string;

}