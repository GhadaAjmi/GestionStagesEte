// src/app/models/DemandeRequestDTO.ts

export interface DemandeRequestDTO {
  // Étudiant
  etudiantId: number;

  // Entreprise
  entreprise: string;
  adresseEntreprise: string;
  representantEntreprise: string;
  tuteurStage: string;
  emailEntreprise: string;
  telephoneEntreprise: string;
  faxEntreprise?: string;

  // Demande / Stage
  sujet: string;
  type?: string;
  description?: string;
  dateDebut: string; // yyyy-MM-dd venant de input type="date"
  dateFin: string;   // yyyy-MM-dd venant de input type="date"
  anneeUniversitaire?: string;
}