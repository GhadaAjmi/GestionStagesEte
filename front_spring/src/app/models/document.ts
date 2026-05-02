import { StatutDocument, TypeDocument } from "./enums";

export interface DocumentDemande {
  id: number;
  demandeStageId: number;
 
  // Infos de la demande
  sujetDemande?: string;
  typeDemande?:  string;
 
  // Infos du document
  type:          TypeDocument;
  nomFichier:    string;
  motifRejet?:   string;
  dateDepot?:    string;   // LocalDateTime sérialisé en ISO string côté backend
  dateDecision?: string;   // LocalDateTime sérialisé en ISO string côté backend
 
  statut:        StatutDocument ;
 
  // Infos de l'étudiant
  nomEtudiant?:    string;
  prenomEtudiant?: string;
 
  // Année du dépôt
  anneeDepot?: number;
 
  // ── Champs UI (frontend uniquement) ──────────────────────────────
  starred?:    boolean;
  iconFile?:   string;
  badgeClass?: string;
}