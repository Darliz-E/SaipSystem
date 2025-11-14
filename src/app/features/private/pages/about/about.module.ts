import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutPage } from './about.page';
import { AboutPageRoutingModule } from './about.page-routing.module';

@NgModule({
  imports: [CommonModule, AboutPageRoutingModule],
  declarations: [AboutPage],
})
export class AboutPageModule {}
