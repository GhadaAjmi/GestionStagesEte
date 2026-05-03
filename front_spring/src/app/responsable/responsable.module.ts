import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResponsableRoutingModule } from './responsable-routing.module';
import { AllenseignantsComponent } from './Enseignants/allenseignants/allenseignants.component';
import { DemandeDetailsComponent } from './stages/demande-details/demande-details.component';
import { DemandesstageComponent } from './stages/demandesstage/demandesstage.component';
import { EditSoutenanceComponent } from './soutenances/edit-soutenance/edit-soutenance.component';
import { ListesoutenancesComponent } from './soutenances/listesoutenances/listesoutenances.component';
import { NewSoutenanceComponent } from './soutenances/new-soutenance/new-soutenance.component';
import { PlanningIng1Component } from './soutenances/planning-ing1/planning-ing1.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AllEtudiantsComponent } from './all-etudiants/all-etudiants.component';


@NgModule({
  declarations: [
    AllenseignantsComponent,
    DemandeDetailsComponent,
    DemandesstageComponent,
    EditSoutenanceComponent,
    ListesoutenancesComponent,
    NewSoutenanceComponent,
    PlanningIng1Component,
    AllEtudiantsComponent
  ],
  imports: [
    CommonModule,
    ResponsableRoutingModule,
     RouterModule,
    FormsModule,         
    ReactiveFormsModule 
  ]
})
export class ResponsableModule { }
