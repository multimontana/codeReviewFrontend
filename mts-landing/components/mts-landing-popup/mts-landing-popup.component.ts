import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@app/@core';
import { MtsRequestEnum } from '@app/modules/mts-landing/models/mts-landing.model';
import { MtsLandingService } from '@app/modules/mts-landing/services/mts-landing.service';

@Component({
  selector: 'wc-mts-landing-popup',
  templateUrl: './mts-landing-popup.component.html',
  styleUrls: ['./mts-landing-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MtsLandingPopupComponent implements OnInit, OnDestroy {
  public mtsRequestType = this.mtsService.popupRequestType$.value;
  public MtsRequestType = MtsRequestEnum;
  public mtsForm = new FormGroup({
    nickname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(
    private mtsService: MtsLandingService,
  ) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  public mtsFormSubmit() {
    if (this.mtsForm.valid) {
      const formValue = this.mtsForm.value;
      this.mtsService.sendMtsTournamentRequest({
        user_email: formValue.email.toLowerCase(),
        nickname: formValue.nickname,
        message_type: this.mtsRequestType
      })
        .pipe(
          untilDestroyed(this)
        )
        .subscribe(() => {
          this.mtsService.popupRequestType$.next(null);
        });
    }
  }

  public preventClosePopupOnOutsideClick(event) {
    event.stopPropagation();
  }

  public closePopup(): void {
    this.mtsService.popupRequestType$.next(null);
  }
}
