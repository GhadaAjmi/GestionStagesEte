import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MesSoutenancesComponent } from './mes-soutenances/mes-soutenances.component';

const routes: Routes = [ {path : 'mes-soutenances', component: MesSoutenancesComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnseignantRoutingModule { }
