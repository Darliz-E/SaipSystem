import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrivatePage } from './private.page';
import { roleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: PrivatePage,
    children: [
      {
        path: 'dashboard',
        // canActivate: [appShutdownGuard, ConfigGuard, roleGuard],
        loadChildren: () =>
          import('./pages/dashboard/dashboard.module').then(
            (m) => m.DashboardPageModule
          ),
      },
      {
        path: 'clubes',
        // canActivate: [appShutdownGuard, ConfigGuard, roleGuard],
        loadChildren: () =>
          import('./pages/clubes/clubes.module').then(
            (m) => m.ClubesPageModule
          ),
      },
      {
        path: 'pelotones',
        // canActivate: [appShutdownGuard, ConfigGuard, roleGuard],
        loadChildren: () =>
          import('./pages/pelotones/pelotones.module').then(
            (m) => m.PelotonesPageModule
          ),
      },
      {
        path: 'evaluaciones',
        // canActivate: [appShutdownGuard, ConfigGuard, roleGuard],
        loadChildren: () =>
          import('./pages/evaluaciones/evaluaciones.module').then(
            (m) => m.EvaluacionesPageModule
          ),
      },

      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: ['administrador'] },
        loadChildren: () =>
          import('./pages/usuarios/usuarios.module').then(
            (m) => m.UsuariosPageModule
          ),
      },
      {
        path: 'about',
        loadChildren: () =>
          import('./pages/about/about.module').then((m) => m.AboutPageModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivateRoutingModule {}
