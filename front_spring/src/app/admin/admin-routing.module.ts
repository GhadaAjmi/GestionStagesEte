import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UtilisateursComponent } from './utilisateurs/utilisateurs.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { SallesComponent } from './salles/salles.component';

const routes: Routes = [
    { path: '', component: UtilisateursComponent },

  { path: 'utilisateurs', component: UtilisateursComponent },
    { path: 'new', component: CreateUserComponent },
    { path: 'salles', component: SallesComponent },

  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
