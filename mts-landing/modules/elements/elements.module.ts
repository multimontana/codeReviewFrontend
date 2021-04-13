import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MtsLandingButtonComponent,
  MtsLandingTextComponent,
  MtsLandingTitleComponent,
} from '@app/modules/mts-landing/modules/elements/components';



@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    MtsLandingButtonComponent,
    MtsLandingTitleComponent,
    MtsLandingTextComponent,
  ],
  exports: [
    MtsLandingButtonComponent,
    MtsLandingTitleComponent,
    MtsLandingTextComponent,
  ]
})
export class ElementsModule { }
