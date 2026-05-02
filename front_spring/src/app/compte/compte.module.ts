import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompteRoutingModule } from './compte-routing.module';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { ProfileviewComponent } from './profileview/profileview.component';
import { ProfileeditComponent } from './profileedit/profileedit.component';


@NgModule({
  declarations: [
    LoginComponent,
    ProfileComponent,
    ResetPasswordComponent,
    ProfileviewComponent,
    ProfileeditComponent
  ],
  imports: [
    CommonModule,
    CompteRoutingModule,
    CoreModule,
    ReactiveFormsModule
  ]
})
export class CompteModule { }
