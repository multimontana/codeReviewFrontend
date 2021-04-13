import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { IPlayerCompetitors } from '@app/modules/app-common/services/player-rating.model';
import { GamePlayerRatingService } from '@app/modules/game/services/game-player-rating-service';
import { PluralService } from '@app/shared/services/plural.service';

@Component({
  selector: 'game-main-best-player',
  templateUrl: './game-main-best-player.component.html',
  styleUrls: ['./game-main-best-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainBestPlayerComponent {

  public bestPlayer$: Observable<IPlayerCompetitors> = this.playerRatingResourceService.getBestPlayer();
  public currentLanguage: string;

  constructor(
    private playerRatingResourceService: GamePlayerRatingService,
    private translateService: TranslateService,
    private pluralService: PluralService
  ) {
    this.translateService.onLangChange.subscribe((lang) => {
      this.currentLanguage = lang.lang
    });
  }

  public getTranslation(age) {
    return this.pluralService.getPlural(age, this.currentLanguage);
  }

  public plural(number, titles) {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
  }
}
