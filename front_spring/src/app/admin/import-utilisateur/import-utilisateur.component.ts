import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportResult, UtilisateurImportService } from '../../services/utilisateur-import.service';
import { Utilisateur } from '../../models/utilisateur.models';

type ImportStep = 'idle' | 'preview' | 'loading' | 'done' | 'error';

@Component({
  selector: 'app-import-utilisateur',
    templateUrl: './import-utilisateur.component.html',

  standalone: false,  
  styleUrl: './import-utilisateur.component.css'


})
export class ImportUtilisateurComponent {

  step: ImportStep = 'idle';
  selectedFile: File | null = null;
  parseErrors: string[] = [];
  parsedUsers: Utilisateur[] = [];
  importResult: ImportResult | null = null;
  serverError = '';

  // Pour la pagination du tableau de prévisualisation
  previewPage = 0;
  previewPageSize = 5;

  constructor(private importService: UtilisateurImportService) {}

  // ── Drag & Drop ─────────────────────────────────────────────────────────────
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.handleFile(input.files[0]);
  }

  // ── Traitement du fichier ────────────────────────────────────────────────────
  async handleFile(file: File) {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      this.step = 'error';
      this.serverError = 'Format invalide. Veuillez sélectionner un fichier .xlsx ou .xls';
      return;
    }

    this.selectedFile = file;
    this.step = 'loading';

    try {
      const { data, errors } = await this.importService.parseExcelFile(file);
      this.parsedUsers = data;
      this.parseErrors = errors;
      this.previewPage = 0;
      this.step = 'preview';
    } catch (err: any) {
      this.step = 'error';
      this.serverError = err;
    }
  }

  // ── Envoi vers le backend ────────────────────────────────────────────────────
  submitImport() {
    if (!this.parsedUsers.length) return;
    this.step = 'loading';

    this.importService.importUsers(this.parsedUsers).subscribe({
      next: (result) => {
        this.importResult = result;
        this.step = 'done';
      },
      error: (err) => {
        this.serverError = err;
        this.step = 'error';
      }
    });
  }

  // ── Template Excel ───────────────────────────────────────────────────────────
  downloadTemplate() {
    this.importService.downloadTemplate();
  }

  // ── Navigation ───────────────────────────────────────────────────────────────
  reset() {
    this.step = 'idle';
    this.selectedFile = null;
    this.parsedUsers = [];
    this.parseErrors = [];
    this.importResult = null;
    this.serverError = '';
  }

  // ── Pagination prévisualisation ──────────────────────────────────────────────
  get previewRows(): Utilisateur[] {
    const start = this.previewPage * this.previewPageSize;
    return this.parsedUsers.slice(start, start + this.previewPageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.parsedUsers.length / this.previewPageSize);
  }

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      ETUDIANT: 'badge-blue',
      ENSEIGNANT: 'badge-green',
      ADMIN: 'badge-red',
      RESPONSABLE: 'badge-purple',
      CHEF_DEPARTEMENT: 'badge-orange',
      SERVICE_STAGE: 'badge-teal',
    };
    return map[role] || 'badge-gray';
  }
}