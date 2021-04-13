import { Component } from '@angular/core';
import { AccountService } from '@app/account/account-module/services/account.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'game-main-promo-mts',
  templateUrl: './game-main-promo-mts.component.html',
  styleUrls: ['./game-main-promo-mts.component.scss'],
})
export class GameMainPromoMtsComponent {
  public displayBlock = true;

  constructor(
    public accountService: AccountService,
    public translate: TranslateService
  ) {
    this.translate.onLangChange.subscribe((lang) => {
      this.displayBlock = lang.lang === 'ru';
    });
  }
}
