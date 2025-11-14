import { NgModule } from '@angular/core';
import { PrivateModule } from '../../private.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PelotonesPage } from './pelotones.page';
import { PelotonesPageRoutingModule } from './pelotones.page-routing.module';

@NgModule({
  imports: [
    PelotonesPageRoutingModule,
    PrivateModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [PelotonesPage],
})
export class PelotonesPageModule {}
