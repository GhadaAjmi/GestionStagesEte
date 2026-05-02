// models/journal-stage.models.ts

export interface JournalStage {
  id?:                      number;
  demandeStageId?:          number;
  date?:                    string;   // LocalDate → ISO string (yyyy-MM-dd)
  activitesEtObservations?: string;   // renommé depuis description
  commentaireResponsable?:  string;
  vueResponsable?:          boolean;
  valideResponsable?:       boolean;

  // ── Champs UI uniquement ──────────────────────────────────────────
  showCommentBox?:  boolean;
  newCommentaire?:  string;
}