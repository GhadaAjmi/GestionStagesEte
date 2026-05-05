import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnseignantRoutingModule } from './enseignant-routing.module';
import { MesSoutenancesComponent } from './mes-soutenances/mes-soutenances.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EvaluationComponent } from './evaluation/evaluation.component';


@NgModule({
  declarations: [
    MesSoutenancesComponent,
    EvaluationComponent
  ],
  imports: [
    CommonModule,
    EnseignantRoutingModule, 
    FormsModule, 
    ReactiveFormsModule
  ]
})
export class EnseignantModule { }
