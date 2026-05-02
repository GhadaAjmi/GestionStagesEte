import { MembreJury } from "./membre-jury";

export interface PlanificationGroupeDTO {
  groupe: string;
  niveau: string;
  date: string;
  heureDebut: string;
  duree: number;
  salleId: number;
  statut: string;
  membresJury: MembreJury[];
  etudiantIds: number[];
}
 