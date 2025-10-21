import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { PrivatePage } from './private.page';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrivateRoutingModule } from './private-routing.module';



@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        PrivateRoutingModule,
    ],
    declarations: [
        PrivatePage,

    ],
    exports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        PrivateRoutingModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrivateModule { }
