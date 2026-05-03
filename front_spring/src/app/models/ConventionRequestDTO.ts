// src/app/models/convention-request.model.ts

export interface ConventionRequestDTO {
  // Entreprise
  entreprise: string;
  adresseEntreprise: string;
  representantEntreprise: string;
  tuteurStage: string;
  emailEntreprise: string;
  telephoneEntreprise: string;
  faxEntreprise?: string; // optionnel

  // Étudiant
  nomEtudiant: string;
  prenomEtudiant: string;
  cin: string;
  telephone: string;
  email?: string; // optionnel pour le PDF
  specialite: string;

  // Stage
  dateDebut: string; // format dd/MM/yyyy
  dateFin: string;   // format dd/MM/yyyy

  // Type de formation
  ing: boolean;
  mastere: boolean;

  // Spécialité
  info: boolean;
  electrique: boolean;
  indus: boolean;

  // Année
  premiere: boolean;
  deuxieme: boolean;
}