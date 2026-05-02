import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LayoutComponent } from './layout/layout.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    SidebarComponent,
    NavbarComponent,
    LayoutComponent
  ],
  imports: [
    CommonModule,
     RouterModule
       ],
  exports: [
   
    LayoutComponent
  ]
})
export class FrontModule { }
