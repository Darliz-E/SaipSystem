import { NgModule } from '@angular/core';
import { PrivateModule } from '../../private.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ClubesPage } from './clubes.page';
import { ClubesPageRoutingModule } from './clubes.page-routing.module';

@NgModule({
    imports: [
        ClubesPageRoutingModule,
        PrivateModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
    ],
    declarations: [ClubesPage],
})
export class ClubesPageModule { }
