import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllenseignantsComponent } from './Enseignants/allenseignants/allenseignants.component';
import { EditSoutenanceComponent } from './soutenances/edit-soutenance/edit-soutenance.component';
import { ListesoutenancesComponent } from './soutenances/listesoutenances/listesoutenances.component';
import { NewSoutenanceComponent } from './soutenances/new-soutenance/new-soutenance.component';
import { PlanningIng1Component } from './soutenances/planning-ing1/planning-ing1.component';
import { DemandesstageComponent } from './stages/demandesstage/demandesstage.component';
import { DemandeDetailsComponent } from './stages/demande-details/demande-details.component';
import { AllEtudiantsComponent } from './all-etudiants/all-etudiants.component';

const routes: Routes = [
  { path: 'enseignants', component: AllenseignantsComponent },

  { path: 'soutenances', component: ListesoutenancesComponent },
  { path: 'soutenances/new', component: NewSoutenanceComponent },
    { path: 'soutenances/planning', component: PlanningIng1Component },

  { path: 'soutenances/edit-groupe/:id', component: EditSoutenanceComponent },

  { path: 'demandes', component: DemandesstageComponent},
  { path: 'demandes/details', component: DemandeDetailsComponent },

{ path: 'demandes/details/:id', component: DemandeDetailsComponent },
{ path: 'enseignants', component: AllenseignantsComponent },
{ path: 'etudiants', component: AllEtudiantsComponent },


];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResponsableRoutingModule { }
