import { NgModule } from '@angular/core';
import { PrivateModule } from '../../private.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { EvaluacionesPage } from './evaluaciones.page';
import { EvaluacionesPageRoutingModule } from './evaluaciones.page-routing.module';

@NgModule({
    imports: [
        EvaluacionesPageRoutingModule,
        PrivateModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
    ],
    declarations: [EvaluacionesPage],
})
export class EvaluacionesPageModule { }
