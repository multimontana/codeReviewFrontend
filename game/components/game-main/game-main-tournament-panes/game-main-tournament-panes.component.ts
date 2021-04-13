import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import * as moment from 'moment';
import { map, switchMap } from 'rxjs/operators';
import { OnlineTournamentInterface } from '@app/modules/game/modules/tournaments/models';

@Component({
  selector: 'wc-game-main-tournament-panes',
  templateUrl: './game-main-tournament-panes.component.html',
  styleUrls: ['./game-main-tournament-panes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainTournamentPanesComponent {

  static COUNT = 5;

  now = moment().utcOffset(0);
  nowDate = moment().utcOffset(0).format('MM/DD/YYYY HH:mm:ss');
  fromDate = moment().utcOffset(0).subtract(48, 'hour').format('MM/DD/YYYY HH:mm:ss');
  toDate = moment().utcOffset(0).add(36, 'hour').format('MM/DD/YYYY HH:mm:ss');

  topFiveTournaments$: Observable<OnlineTournamentInterface[]> = this.gameResourceService.getOnlineTournaments(
    this.nowDate,
    this.toDate,
    undefined,
    undefined,
    GameMainTournamentPanesComponent.COUNT,
  ).pipe(
    switchMap((arr) => {
      const temp = (arr || []);
      const countLeft = GameMainTournamentPanesComponent.COUNT - temp.length;

      if (countLeft > 0) {
        return this.gameResourceService.getOnlineTournaments(
          this.fromDate,
          this.nowDate,
          undefined,
          undefined,
          countLeft,
          'desc',
        ).pipe(map((arr2) => {
          temp.push(...(arr2 || []));
          for (let i = 0; i < GameMainTournamentPanesComponent.COUNT - temp.length; i++) {
            temp.push({});
          }
          return temp;
        }));
      } else {
        return of(temp);
      }
    }),
  );

  constructor(
    private gameResourceService: GameResourceService,
  ) {
  }

}
