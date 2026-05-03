import { Utilisateur } from "./utilisateur.models";

export interface Etudiant extends Utilisateur {
  
  niveau: string;       
  specialite: string;
  groupe: string;
  numeroInscription: string;
 
  // UI uniquement
  hasStage?: boolean;
  demandeId?: number;
  sujetDemande?: string;
  statutDemande?: string;
}
