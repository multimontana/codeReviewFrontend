import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { GameScreenService } from '@app/modules/game/state/game.screen.service';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { PlayerResourceService } from '@app/broadcast/core/player/player-resource.service';
import { map, shareReplay, tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie';

@Component({
  selector: 'wc-game-home-page',
  templateUrl: './game-home-page.component.html',
  styleUrls: ['./game-home-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameHomePageComponent implements OnInit {
  public tournamentCount$: Observable<number>;
  public tournamentCountToday$: Observable<number>;
  public onlinePlayerCount$: Observable<number>;

  private endTime = moment().utcOffset(0).format('MM/DD/YYYY HH:mm:ss');
  private startOfDay = moment().utcOffset(0).startOf('day').format('MM/DD/YYYY HH:mm:ss');
  private monthAgo = moment().startOf('day').subtract(30, 'day').format('MM/DD/YYYY HH:mm:ss');

  constructor(
    public screenService: GameScreenService,
    private gameService: GameResourceService,
    private playerResourceService: PlayerResourceService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.initOnlinePlayerCount();
    this.initTournamentCount();
    this.initTournamentTodayCount();
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
        tap(count => { localStorage.setItem("onlineUsers", `${count}`) }),
        map(count => count || 0),
        shareReplay(1)
      );
  }
}
