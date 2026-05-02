import { Utilisateur } from "./utilisateur.models";

export interface Enseignant extends Utilisateur {
  grade: string;          
  domaine: string;
}
