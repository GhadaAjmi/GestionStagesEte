import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EtudiantRoutingModule } from './etudiant-routing.module';
import { ConsultationdocsComponent } from './consultationdocs/consultationdocs.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DemandeStageComponent } from './demande-stage/demande-stage.component';
import { JournalStageComponent } from './journal-stage/journal-stage.component';
import { MaSoutenanceComponent } from './ma-soutenace/ma-soutenance.component';
import { MesDocumentsComponent } from './mes-documents/mes-documents.component';
import { ListeEntreprisesComponent } from './liste-entreprises/liste-entreprises.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ConsultationdocsComponent,
    DashboardComponent,
    DemandeStageComponent,
    JournalStageComponent,
    MaSoutenanceComponent,
    MesDocumentsComponent,
    ListeEntreprisesComponent
  ],
  imports: [
    CommonModule,
    EtudiantRoutingModule, 
    FormsModule, 
    ReactiveFormsModule
  ]
})
export class EtudiantModule { }
