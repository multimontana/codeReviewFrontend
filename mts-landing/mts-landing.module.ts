import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@app/layout/layout.module';
import {
  MtsLandingContentComponent,
  MtsLandingFooterComponent,
  MtsLandingMainPageComponent,
  MtsLandingPopupComponent
} from '@app/modules/mts-landing/components';
import { MtsLandingRoutingModule } from '@app/modules/mts-landing/mts-landing-routing.module';
import { MtsLandingService } from '@app/modules/mts-landing/services/mts-landing.service';
import { SvgModule } from '@app/modules/svg/svg.module';
import { ElementsModule } from './modules/elements/elements.module';

@NgModule({
  imports: [
    CommonModule,
    SvgModule,
    ElementsModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MtsLandingRoutingModule,
  ],
  declarations: [
    MtsLandingMainPageComponent,
    MtsLandingFooterComponent,
    MtsLandingContentComponent,
    MtsLandingPopupComponent,
  ],
  providers: [
    MtsLandingService,
  ]
})
export class MtsLandingModule {
}
