import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrivatePage } from './private.page';
// import { roleGuard } from 'src/app/core/guards/role/role.guard';
// import { ConfigGuard } from 'src/app/core/guards/config/config.guard';
// import { appShutdownGuard } from 'src/app/core/guards/app-shutdown/app-shutdown.guard';
// import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';

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
                path: 'evaluaciones',
                // canActivate: [appShutdownGuard, ConfigGuard, roleGuard],
                loadChildren: () =>
                    import('./pages/evaluaciones/evaluaciones.module').then(
                        (m) => m.EvaluacionesPageModule
                    ),
            },

            {
                path: 'usuarios',
                // canActivate: [appShutdownGuard, ConfigGuard, roleGuard],
                loadChildren: () =>
                    import('./pages/usuarios/usuarios.module').then(
                        (m) => m.UsuariosPageModule
                    ),
            },







        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PrivateRoutingModule { }
