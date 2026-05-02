import { Utilisateur } from './utilisateur';

export interface Enseignant extends Utilisateur {
  grade: string;          
  domaine: string;
}
