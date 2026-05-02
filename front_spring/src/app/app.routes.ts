import { Routes } from '@angular/router';
import { LayoutComponent } from './front/layout/layout.component';


export const routes: Routes = [
 

     {
    path: '',
    loadChildren: () =>
      import('./compte/compte.module').then(m => m.CompteModule)
  },
  
      // --------------------- Super Admin ---------------------
  {
    path: 'admin',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./admin/admin.module').then(m => m.AdminModule),
        // canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ROLE_SUPER_ADMIN'] }
      }
    ]
  },

  // --------------------- Responsable ---------------------
  {
    path: 'responsable',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./responsable/responsable.module').then(m => m.ResponsableModule),
        data: { roles: ['ROLE_RESPONSABLE', 'ROLE_SERVICE_STAGE'] }
      }
    ]
  },
  // --------------------- Service stage---------------------
  {
    path: 'service_stage',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./responsable/responsable.module').then(m => m.ResponsableModule),
        data: { roles: [ 'ROLE_SERVICE_STAGE'] }
      }
    ]
  },
      // --------------------- Chef departement ---------------------
 {
    path: 'chef_departement',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./chef/chef.module').then(m => m.ChefModule),
        data: { roles: ['ROLE_CHEF_DEPARTEMENT'] }
      }
    ]
  },

  // --------------------- Etudiant ---------------------
  {
    path: 'etudiant',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./etudiant/etudiant.module').then(m => m.EtudiantModule),
        data: { roles: ['ROLE_ETUDIANT'] }
      }
    ]
  },

  // --------------------- Enseignant ---------------------
  {
    path: 'enseignant',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./enseignant/enseignant.module').then(m => m.EnseignantModule),
        data: { roles: ['ROLE_ENSEIGNANT'] }
      }
    ]
  },

 
  { path: '**', redirectTo: '' }



];
