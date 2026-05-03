import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DemandeStageComponent } from './demande-stage/demande-stage.component';
import { MaSoutenanceComponent } from './ma-soutenace/ma-soutenance.component';
import { MesDocumentsComponent } from './mes-documents/mes-documents.component';
import { JournalStageComponent } from './journal-stage/journal-stage.component';
import { ConsultationdocsComponent } from './consultationdocs/consultationdocs.component';
import { ListeEntreprisesComponent } from './liste-entreprises/liste-entreprises.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  { path: 'mon-stage', component: DemandeStageComponent },
  { path: 'ma-soutenance', component: MaSoutenanceComponent },
  { path: 'mes-documents', component: MesDocumentsComponent },

 { path: 'mon-journal', component: JournalStageComponent },
  { path: 'documents/archives', component: ConsultationdocsComponent },
 { path: 'entreprises', component: ListeEntreprisesComponent },

  // Ajoutez vos autres routes ici au fur et à mesure :
  // { path: 'documents', component: DocumentsComponent },
  // { path: 'depot', component: DepotComponent },
  // { path: 'mon-stage', component: MonStageComponent },
  // { path: 'soutenance', component: SoutenanceComponent },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EtudiantRoutingModule { }
