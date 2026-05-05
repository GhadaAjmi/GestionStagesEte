
// ── RoleUtilisateur ───────────────────────────────────────────────────
export type RoleUtilisateur =
  | 'ETUDIANT'
  | 'ENSEIGNANT'
  | 'RESPONSABLE'
  | 'CHEF_DEPARTEMENT'
  | 'SERVICE_STAGE'
  | 'ADMIN';

// ── TypeDocument ──────────────────────────────────────────────────────
export type TypeDocument =
  | 'LETTRE_AFFECTATION'
  | 'CONVENTION'
  | 'RAPPORT'
  | 'POSTER'
  | 'ATTESTATION'
  | 'PRESENTATION'
  | 'JOURNAL'
  | 'PROLONGATION';


export type StatutDocument =
  | 'GENERE'
  | 'SOUMIS'
    | 'SIGNE'

  | 'VALIDE'
  | 'REJETE';


export type StatutDemande =
  | 'SOUMISE'
  | 'EN_ATTENTE_SIGNATURE'
  | 'VALIDEE'
  | 'REFUSEE'
  | 'EN_COURS'
  | 'PROLONGATION_DEMANDEE'
  | 'TERMINEE';

// ── StatutProlongation ────────────────────────────────────────────────
export type StatutProlongation =
  | 'EN_ATTENTE'
  | 'APPROUVEE'
  | 'REFUSEE';

// ── StatutSoutenance ──────────────────────────────────────────────────
export type StatutSoutenance =
  | 'PLANIFIEE'
  | 'VALIDEE'
  | 'ANNULEE';