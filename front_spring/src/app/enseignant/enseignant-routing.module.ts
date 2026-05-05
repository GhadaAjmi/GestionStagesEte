import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MesSoutenancesComponent } from './mes-soutenances/mes-soutenances.component';
import { EvaluationComponent } from './evaluation/evaluation.component';

const routes: Routes = [
   {path : '', component: MesSoutenancesComponent},
{ path: 'evaluation/:id', component: EvaluationComponent }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnseignantRoutingModule { }
