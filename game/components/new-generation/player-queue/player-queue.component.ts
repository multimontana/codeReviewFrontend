import * as moment from 'moment';

import { BehaviorSubject, interval, Observable } from 'rxjs';
import { BoardType, GameRatingMode } from '@app/broadcast/core/tour/tour.model';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { first, tap, withLatestFrom } from 'rxjs/operators';

import { AccountService } from '@app/account/account-module/services/account.service';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { GameState } from '@app/modules/game/state/game.state';
import { ICountry } from '@app/broadcast/core/country/country.model';
import { IPlayerInQueue } from '@app/modules/game/state/player-queue-response.model';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { trackByIndex, untilDestroyed } from '@app/@core';

@Component({
  selector: 'wc-player-queue',
  templateUrl: './player-queue.component.html',
  styleUrls: ['./player-queue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerQueueComponent implements OnInit, OnDestroy {

  @Select(GameState.gameInProgress) gameInProgress$: Observable<boolean>;

  public playersList: IPlayerInQueue[] = [];
  public selectedPlayer: IPlayerInQueue;
  public moment = moment;
  public initialLoading = false;
  public trackByIndexFn = trackByIndex;

  public GameRatingMode = GameRatingMode;

  public durationFormat: moment.DurationFormatSettings = {
    trim: 'both',
    trunc: true,
    usePlural: false,
    useSignificantDigits: true
  };

  private countries$: BehaviorSubject<ICountry[]> = new BehaviorSubject([]);
  private isLoading$ = new BehaviorSubject(false);

  constructor(
    private gameResourceService: GameResourceService,
    private gameSharedService: GameSharedService,
    private route: Router,
    private countryService: CountryResourceService,
    private accountService: AccountService,
    private cd: ChangeDetectorRef,
  ) {
    this.countryService.getAll()
      .pipe(first())
      .subscribe(this.countries$);
  }

  ngOnInit() {
    this.fetchHistory();
    interval(5000).pipe(
      withLatestFrom(this.gameInProgress$),
      untilDestroyed(this)
    ).subscribe(([_, gameInProgress]) => {
      if (!gameInProgress) {
        this.fetchHistory();
      }
    });
  }

  ngOnDestroy(): void {
  }

  public selectPlayer(player: IPlayerInQueue) {
    this.selectedPlayer = player;
    this.cd.detectChanges();
  }

  public joinToGame(player: IPlayerInQueue) {
    const url = `/singlegames/invite/${player.invite_code}/human`;
    this.route.navigate([url]).then();
  }

  public getCountryCode(code: number) {
    return this.countryService.getCountryCode(code);
  }

  public boardTypeTitle(boardType: BoardType) {
    this.gameSharedService.boardTypeTitle(boardType);
  }

  private fetchHistory() {
    this.isLoading$.next(true);
    this.gameResourceService.getPlayerQueue()
      .pipe(
        untilDestroyed(this))
      .subscribe((results) => {
        this.isLoading$.next(false);
        this.initialLoading = true;
        this.playersList = results;
        this.cd.detectChanges();
      });
  }
}
