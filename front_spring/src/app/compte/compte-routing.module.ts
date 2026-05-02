import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ProfileeditComponent } from './profileedit/profileedit.component';
import { ProfileComponent } from './profile/profile.component';
import { LayoutComponent } from '../front/layout/layout.component';

const routes: Routes = [
  // --------------------- Sans layout ---------------------
  {
    path: 'login',
    component: LoginComponent
  },

  

  // --------------------- Avec layout : navbar + sidebar ---------------------
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'profile/edit',
        component: ProfileeditComponent
      },
      {
    path: 'profile/password',
    component: ResetPasswordComponent
  }
    ]
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompteRoutingModule { }
