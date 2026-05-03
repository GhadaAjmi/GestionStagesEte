
export interface LettreRequestDTO {
  // Étudiant
  nomEtudiant: string;
  prenomEtudiant: string;
  cin: string;
  dateDelivranceCin: string; // format dd/MM/yyyy
  lieuDelivranceCin: string;
  niveau: string;            // ex: "1", "2", "3"
  specialite: string;

  // Stage
  entreprise: string;
  dateDebut: string;         // format dd/MM/yyyy
  dateFin: string;           // format dd/MM/yyyy
}