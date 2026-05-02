export enum TypeLocalisation {
  PRINCIPALE = 'PRINCIPALE',
  ANNEXE = 'ANNEXE'
}

export interface Salle {
  id?: number;
  code: string;
  localisation: TypeLocalisation | string;
  supportePresentation: boolean;
  supportePoster: boolean;
}
