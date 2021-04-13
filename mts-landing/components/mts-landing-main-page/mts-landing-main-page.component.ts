import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MtsLandingService } from '@app/modules/mts-landing/services/mts-landing.service';

@Component({
  selector: 'mts-landing-main-page',
  templateUrl: './mts-landing-main-page.component.html',
  styleUrls: ['./mts-landing-main-page.component.scss', './../../settings.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MtsLandingMainPageComponent {
  constructor(public mtsService: MtsLandingService) { }

  closePopupOnOutsideClick() {
    this.mtsService.popupRequestType$.next(null);
  }
}
