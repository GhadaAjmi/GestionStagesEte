import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { CreateUserComponent } from './create-user/create-user.component';
import { UtilisateursComponent } from './utilisateurs/utilisateurs.component';
import { SallesComponent } from './salles/salles.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../core/core.module';
import { ImportUtilisateurComponent } from './import-utilisateur/import-utilisateur.component';


@NgModule({
  declarations: [
    CreateUserComponent,
    UtilisateursComponent,
    SallesComponent,
    ImportUtilisateurComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
     RouterModule   ,
      FormsModule,           
    ReactiveFormsModule,
    CoreModule
  ]
})
export class AdminModule { }
