import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { GamePlayerRatingService } from '@app/modules/game/services/game-player-rating-service';
import { IPlayerCompetitors } from '@app/modules/app-common/services/player-rating.model';
import { PlayerRatingState } from '@app/modules/app-common/state/player-rating.state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { trackByProp } from '@app/@core';
import { Select } from '@ngxs/store';

@Component({
  selector: 'game-champions-table',
  templateUrl: './game-champions-table.component.html',
  styleUrls: ['./game-champions-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameChampionsTableComponent {
  @Select(PlayerRatingState.bestPlayers) topPlayers$: Observable<IPlayerCompetitors[]>;

  public bestPlayers$: Observable<IPlayerCompetitors[]> = this.topPlayers$.pipe(
    map(players => players && players.length ? players : []),
  );
  public trackByFn = trackByProp<IPlayerCompetitors>('player_id');
  public listExpanded = false;

  constructor(
    private gamePlayerRatingService: GamePlayerRatingService,
    private cdr: ChangeDetectorRef
  ) {
  }

  public expandList(): void {
    this.listExpanded = true;
    this.cdr.detectChanges();
  }
}
