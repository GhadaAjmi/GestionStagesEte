import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  EvaluationResponseDTO,
  EvaluationMoyenneDTO,
  EvaluationRequestDTO,
  EvaluationService
} from '../../services/evaluation.service';
import { SoutenanceService } from '../../services/soutenance.service';
import { Soutenance } from '../../models/soutenance';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrl: './evaluation.component.css',
  standalone: false
})
export class EvaluationComponent {

  soutenance: Soutenance | null = null;

  // ── IDS ────────────────────────────────────────────────
  soutenanceId!: number;
  enseignantId!: number;

  // ── STATE ──────────────────────────────────────────────
  loading = false;
  saving = false;

  error: string = '';
  success = false;

  monEvaluation: EvaluationResponseDTO | null = null;
  moyenne: EvaluationMoyenneDTO | null = null;

  activeTab: 'form' | 'jury' | 'synthese' = 'form';

  // ── FORM ───────────────────────────────────────────────
  form: EvaluationRequestDTO = {
    soutenanceId: 0,
    enseignantId: 0,
    noteRapport: null,
    notePresentation: null,
    noteTechnique: null,
    noteComportement: null,
    commentaire: null,
  };

  constructor(
    public evalService: EvaluationService,
    private route: ActivatedRoute,
    private soutenanceService: SoutenanceService,
    private sessionService: AuthService
  ) {}

  // ── INIT ROUTE ─────────────────────────────────────────
  ngOnInit(): void {

    console.log("🚀 EvaluationComponent loaded");

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      if (!id) {
        console.error("❌ ID introuvable dans URL");
        return;
      }

      this.soutenanceId = +id;
      this.enseignantId = this.sessionService.getUserId() ?? 0;

      console.log("🆔 soutenanceId:", this.soutenanceId);
      console.log("👨‍🏫 enseignantId:", this.enseignantId);

      this.loadSoutenance();
    });
  }

  // ── LOAD SOUTENANCE ────────────────────────────────────
  private loadSoutenance(): void {

    this.soutenanceService.getById(this.soutenanceId)
      .subscribe({
        next: (data) => {

          console.log("📥 Soutenance reçue:", data);

          this.soutenance = data;

          this.init();
        },
        error: (err) => {
          console.error("❌ Erreur chargement soutenance:", err);
          this.error = "Erreur chargement soutenance";
        }
      });
  }

  // ── INIT COMPONENT ─────────────────────────────────────
  private init(): void {

    if (!this.soutenanceId) {
      console.error("❌ soutenanceId invalide");
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;
    this.activeTab = 'form';

    this.form = {
      soutenanceId: this.soutenanceId,
      enseignantId: this.enseignantId,
      noteRapport: null,
      notePresentation: null,
      noteTechnique: null,
      noteComportement: null,
      commentaire: null,
    };

    console.log("🧾 FORM INITIALISÉ :", this.form);

    this.chargerMonEvaluation();
    this.chargerMoyenne();
  }

  // ── GET EVALUATION ─────────────────────────────────────
  private chargerMonEvaluation(): void {

    console.log("📡 getMonEvaluation:", this.soutenanceId);

    this.evalService.getMonEvaluation(this.enseignantId, this.soutenanceId)
      .subscribe({
        next: (res) => {

          console.log("📥 evaluation response:", res);

          if (res ) {
            this.monEvaluation = res;
            this.remplirFormulaire(res);
          }

          this.loading = false;
        },
        error: (err) => {
          console.error("❌ getParSoutenance error:", err);

          if (err.status !== 204) {
            this.error = "Erreur chargement évaluation";
          }

          this.loading = false;
        }
      });
  }

  // ── GET MOYENNE ────────────────────────────────────────
  private chargerMoyenne(): void {

    this.evalService.getMoyenne(this.soutenanceId)
      .subscribe({
        next: (res) => {
          console.log("📊 moyenne:", res);
          this.moyenne = res;
        },
        error: (err) => {
          console.error("❌ moyenne error:", err);
        }
      });
  }

  // ── FILL FORM ──────────────────────────────────────────
  private remplirFormulaire(e: EvaluationResponseDTO): void {
    this.form.noteRapport = e.noteRapport;
    this.form.notePresentation = e.notePresentation;
    this.form.noteTechnique = e.noteTechnique;
    this.form.noteComportement = e.noteComportement;
    this.form.commentaire = e.commentaire;
  }

  // ── SAVE ───────────────────────────────────────────────
  soumettre(): void {

    console.log("📤 PAYLOAD :", this.form);

    if (!this.formulaireValide()) {
      console.warn("⚠️ Form invalide");
      return;
    }

    this.saving = true;

    this.evalService.soumettre(this.form)
      .subscribe({
        next: (res) => {

          console.log("✅ saved:", res);

          this.monEvaluation = res;
          this.success = true;
          this.saving = false;

          this.chargerMoyenne();
        },
        error: (err) => {

          console.error("❌ save error:", err);

          this.error = err?.error?.message || 'Erreur lors de la sauvegarde';
          this.saving = false;
        }
      });
  }

  // ── VALIDATION ─────────────────────────────────────────
  formulaireValide(): boolean {

    const notes = [
      this.form.noteRapport,
      this.form.notePresentation,
      this.form.noteTechnique,
      this.form.noteComportement
    ];

    if (notes.every(n => n == null)) {
      this.error = 'Veuillez saisir au moins une note';
      return false;
    }

    if (notes.some(n => n != null && (n < 0 || n > 20))) {
      this.error = 'Notes doivent être entre 0 et 20';
      return false;
    }

    return true;
  }

  // ── HELPERS ────────────────────────────────────────────
  get noteFinalePreview(): number | null {
    return this.evalService.calculerNoteFinaleLocale(
      this.form.noteRapport,
      this.form.notePresentation,
      this.form.noteTechnique,
      this.form.noteComportement
    );
  }

  get estDejaEvalue(): boolean {
    return this.monEvaluation !== null;
  }

  heureFinCalc(h?: string, d?: number): string {
    if (!h || !d) return '';
    const [hh, mm] = h.split(':').map(Number);
    const date = new Date(0, 0, 0, hh, mm + d);
    return date.toTimeString().slice(0, 5);
  }

  initiales(p?: string, n?: string): string {
    return ((p?.[0] ?? '') + (n?.[0] ?? '')).toUpperCase();
  }

  statutLabel(s?: string): string {
    switch (s) {
      case 'PLANIFIEE': return 'Planifiée';
      case 'VALIDEE': return 'Validée';
      case 'ANNULEE': return 'Annulée';
      default: return '—';
    }
  }

  statutBadgeClass(s?: string): string {
    switch (s) {
      case 'PLANIFIEE': return 'badge bg-warning';
      case 'VALIDEE': return 'badge bg-success';
      case 'ANNULEE': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}