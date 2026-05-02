import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Salle, TypeLocalisation } from '../../models/salle copy';
import { SalleService } from '../../services/salle.service';

declare var $: any; // For Bootstrap modal

@Component({
  selector: 'app-salles',
  templateUrl: './salles.component.html',
  styleUrl: './salles.component.css'
})
export class SallesComponent implements OnInit {

  salles: Salle[] = [];
  filteredSalles: Salle[] = [];

  salleForm: FormGroup;

  filterLocalisation: string = '';
  isEditMode: boolean = false;
  selectedSalle: Salle | null = null;

  localisationTypes = Object.values(TypeLocalisation);

  constructor(
    private salleService: SalleService,
    private fb: FormBuilder
  ) {
    this.salleForm = this.fb.group({
      code: ['', Validators.required],
      localisation: ['PRINCIPALE', Validators.required],
      supportePresentation: [false],
      supportePoster: [false]
    });
  }

  ngOnInit(): void {
    this.loadSalles();
  }

  loadSalles(): void {
    this.salleService.getAllSalles().subscribe({
      next: data => {
        this.salles = data.map(salle => ({
          ...salle,
          supportePresentation: !!salle.supportePresentation,
          supportePoster: !!salle.supportePoster
        }));

        this.filterSalles();
      },
      error: err => {
        console.error('Error loading salles', err);
      }
    });
  }

  filterSalles(): void {
    if (this.filterLocalisation.trim()) {
      this.filteredSalles = this.salles.filter(
        s => s.localisation === this.filterLocalisation
      );
    } else {
      this.filteredSalles = [...this.salles];
    }
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedSalle = null;

    this.salleForm.reset({
      code: '',
      localisation: 'PRINCIPALE',
      supportePresentation: false,
      supportePoster: false
    });

    $('#salleModal').modal('show');
  }

  openEditModal(salle: Salle): void {
    this.isEditMode = true;
    this.selectedSalle = salle;

    this.salleForm.reset({
      code: salle.code || '',
      localisation: salle.localisation || 'PRINCIPALE',
      supportePresentation: !!salle.supportePresentation,
      supportePoster: !!salle.supportePoster
    });

    $('#salleModal').modal('show');
  }

  saveSalle(): void {
    if (this.salleForm.invalid) {
      this.salleForm.markAllAsTouched();
      return;
    }

    const salle: Salle = {
      ...this.salleForm.value,
      supportePresentation: !!this.salleForm.value.supportePresentation,
      supportePoster: !!this.salleForm.value.supportePoster
    };

    if (this.isEditMode && this.selectedSalle?.id) {
      this.salleService.updateSalle(this.selectedSalle.id, salle).subscribe({
        next: () => {
          this.loadSalles();
          $('#salleModal').modal('hide');
        },
        error: err => {
          console.error('Error updating salle', err);
        }
      });

      return;
    }

    this.salleService.createSalle(salle).subscribe({
      next: () => {
        this.loadSalles();
        $('#salleModal').modal('hide');
      },
      error: err => {
        console.error('Error creating salle', err);
      }
    });
  }

  deleteSalle(salle: Salle): void {
    if (!salle.id) {
      console.error('Salle ID introuvable.');
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer la salle ${salle.code} ?`)) {
      this.salleService.deleteSalle(salle.id).subscribe({
        next: () => {
          this.loadSalles();
        },
        error: err => {
          console.error('Error deleting salle', err);
        }
      });
    }
  }

  getLocalisationBadgeClass(localisation: string): string {
    switch (localisation?.toUpperCase()) {
      case 'PRINCIPALE':
        return 'badge bg-primary-subtle text-primary';

      case 'ANNEXE':
        return 'badge bg-info-subtle text-info';

      default:
        return 'badge bg-secondary-subtle text-secondary';
    }
  }
}