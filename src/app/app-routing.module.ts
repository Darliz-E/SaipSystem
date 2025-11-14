import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./features/public/pages/login/login.module').then(
        (m) => m.LoginPageModule
      ),
  },
  {
    path: 'private',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/private/private.module').then((m) => m.PrivateModule),
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
