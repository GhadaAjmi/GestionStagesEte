export interface PlanningJourDTO {
  date: string;
  heureDebut: string;
  heureFin: string;
}

export interface PlanningING1Request {
  departement?: string;
  specialite?: string;
  nbJury: number;
  dureeParEtudiant: number;
  nombreJours: number;
  jours: PlanningJourDTO[];
}
export interface PlanningING2Request {
  departement: string;
  nbJury: number;
  dureeSoutenance: number;
  nombreJours: number;
  jours: PlanningJourDTO[];
}