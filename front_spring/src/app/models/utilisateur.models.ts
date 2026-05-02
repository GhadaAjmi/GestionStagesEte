export type RoleUtilisateur =
  | 'ETUDIANT'
  | 'ENSEIGNANT'
  | 'RESPONSABLE'
  | 'CHEF_DEPARTEMENT'
  | 'SERVICE_STAGE'
  | 'ADMIN';

export interface Utilisateur {
  id?: number;

  role: RoleUtilisateur | string;

  cin?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  motDePasse?: string;
  actif?: boolean;

  departement?: string;
  telephone?: string;
  lieuDelivranceCin?: string;
  dateDelivranceCin?: string;

  // Champs Etudiant
  niveau?: string;
  specialite?: string;
  groupe?: string;
  numeroInscription?: string;

  // Champs Enseignant / ChefDepartement
  grade?: string;
  domaine?: string;
}

export interface ChangePasswordRequest {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
  confirmationMotDePasse: string;
}