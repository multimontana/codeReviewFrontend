import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GameScreenService } from '@app/modules/game/state/game.screen.service';
import { Observable } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import * as moment from 'moment';
import { PlayerResourceService } from '@app/broadcast/core/player/player-resource.service';

@Component({
  selector: 'game-main',
  templateUrl: './game-main.component.html',
  styleUrls: ['./game-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainComponent implements OnInit {
  public tournamentCount$: Observable<number>;
  public tournamentCountToday$: Observable<number>;
  public onlinePlayerCount$: Observable<number>;

  private endTime = moment().utcOffset(0).format('MM/DD/YYYY HH:mm:ss');
  private startOfDay = moment().utcOffset(0).startOf('day').format('MM/DD/YYYY HH:mm:ss');
  private monthAgo = moment().startOf('day').subtract(30, 'day').format('MM/DD/YYYY HH:mm:ss');

  constructor(
    public screenService: GameScreenService,
    private gameService: GameResourceService,
    private playerResourceService: PlayerResourceService
  ) {}

  ngOnInit(): void {
    this.initTournamentCount();
    this.initTournamentTodayCount();
    this.initOnlinePlayerCount();
  }

  private initTournamentCount(): void {
    this.tournamentCount$ = this.gameService
      .getOnlineTournamentsCount(this.monthAgo, this.endTime)
      .pipe(
        map(count => count || 0),
        shareReplay(1)
      );
  }

  private initTournamentTodayCount(): void {
    this.tournamentCountToday$ = this.gameService
      .getOnlineTournamentsCount(this.startOfDay, this.endTime)
      .pipe(
        map(count => count || 0),
        shareReplay(1)
      );
  }

  private initOnlinePlayerCount(): void {
    this.onlinePlayerCount$ = this.playerResourceService
      .getOnlinePlayersCount()
      .pipe(
        map(count => count || 0),
        shareReplay(1)
      );
  }
}
