import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditsoutenanceComponent } from './editsoutenance/editsoutenance.component';
import { NewsoutenanceComponent } from './newsoutenance/newsoutenance.component';
import { PlanningIng2Component } from './planning-ing2/planning-ing2.component';
import { SoutenancesComponent } from './soutenances/soutenances.component';
import { AllenseignantsComponent } from '../responsable/Enseignants/allenseignants/allenseignants.component';


const routes: Routes = [
  { path: 'soutenances', component: SoutenancesComponent },
    { path: 'enseignants', component: AllenseignantsComponent },

  { path: 'soutenances/planning',component: PlanningIng2Component},
  { path: 'soutenances/edit/:id',component: EditsoutenanceComponent},
  { path: 'soutenances/new', component: NewsoutenanceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChefRoutingModule { }
