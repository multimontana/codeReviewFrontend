import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MtsLandingMainPageComponent } from './components/mts-landing-main-page/mts-landing-main-page.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: MtsLandingMainPageComponent,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class MtsLandingRoutingModule {
}
