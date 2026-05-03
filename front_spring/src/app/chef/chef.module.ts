import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChefRoutingModule } from './chef-routing.module';
import { PlanningIng2Component } from './planning-ing2/planning-ing2.component';
import { SoutenancesComponent } from './soutenances/soutenances.component';
import { NewsoutenanceComponent } from './newsoutenance/newsoutenance.component';
import { EditsoutenanceComponent } from './editsoutenance/editsoutenance.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    PlanningIng2Component,
    SoutenancesComponent,
    NewsoutenanceComponent,
    EditsoutenanceComponent
  ],
  imports: [
    CommonModule,
    ChefRoutingModule,
     ReactiveFormsModule,
    FormsModule
  ]
})
export class ChefModule { }
