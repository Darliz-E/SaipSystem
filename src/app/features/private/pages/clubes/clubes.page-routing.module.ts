import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClubesPage } from './clubes.page';

const routes: Routes = [
    {
        path: '',
        component: ClubesPage,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ClubesPageRoutingModule { }
