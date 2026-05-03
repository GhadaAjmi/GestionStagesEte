// src/app/models/DemandeSoumissionResponseDTO.ts

import { DemandeStage } from './demandeStage';

export interface DocumentResponseDTO {
  id: number;
  nomFichier: string;
  type: 'LETTRE_AFFECTATION' | 'CONVENTION';
  urlTelechargement: string;
}

export interface DemandeSoumissionResponseDTO {
  demande: DemandeStage;
  lettreAffectation: DocumentResponseDTO;
  convention: DocumentResponseDTO;
}