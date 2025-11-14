import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PelotonesPage } from './pelotones.page';

const routes: Routes = [
  {
    path: '',
    component: PelotonesPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PelotonesPageRoutingModule {}
