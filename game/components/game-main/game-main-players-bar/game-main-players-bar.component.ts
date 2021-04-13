import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { trackByIndex } from '@app/@core';
import { BarItemInterface } from '@app/modules/game/models';
import { PlayerDataService } from '@app/modules/game/services/player-data-service';

@Component({
  selector: 'wc-game-main-players-bar',
  templateUrl: './game-main-players-bar.component.html',
  styleUrls: ['./game-main-players-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainPlayersBarComponent {

  public trackByIndexFn = trackByIndex;
  public data$: Observable<BarItemInterface[]> = this.playerRatingsDataService.getAll().pipe(map(arr => {
    const arrRes: BarItemInterface[] = ( arr || [] ).filter(item => item.result && item.result >= 1 && item.result <= 3);
    if (arrRes.length <= 0) {
      return [];
    }
    const koef = Math.ceil(30 / arrRes.length);
    const res: BarItemInterface[] = [];
    for (let i = 0; i < koef; i++) {
      res.push(...arrRes);
    }
    return res;
  }));

  constructor(
    private playerRatingsDataService: PlayerDataService,
  ) {
  }

}
