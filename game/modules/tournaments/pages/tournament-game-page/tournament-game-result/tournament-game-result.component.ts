import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { Select } from '@ngxs/store';
import { GameState } from '@app/modules/game/state/game.state';
import { PlayerEnum } from '@app/modules/game/models';
import { BehaviorSubject, Observable, Subject, combineLatest, of } from 'rxjs';
import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';

import { GameRatingMode } from '@app/broadcast/core/tour/tour.model';
import { GameResult } from '@app/modules/game/state/game-result-enum';
import { IAccount } from '@app/account/account-store/account.model';
import { OnlineTournamentStandingInterface } from '@app/modules/game/modules/tournaments/models';
import { PlayerInterface } from '@app/broadcast/core/player/player.model';
import { OnlineTournamentService } from '@app/modules/game/modules/tournaments/services/tournament.service';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { Router } from '@angular/router';
import { TournamentGameState } from '@app/modules/game/modules/tournaments/states/tournament.game.state';
import { untilDestroyed } from '@app/@core';

@Component({
  selector: 'tournament-game-result',
  templateUrl: './tournament-game-result.component.html',
  styleUrls: ['./tournament-game-result.component.scss']
})
export class TournamentGameResultComponent implements OnInit, OnDestroy, OnChanges {

  private isLoader = null;

  @Select(GameState.isResultShown) isResultShown$: Observable<boolean>;
  @Select(GameState.gameResult) gameResult$: Observable<GameResult>;
  @Select(GameState.ratingChange) ratingChange$: Observable<number>;
  @Select(GameState.account) account$: Observable<IAccount>;
  @Select(GameState.player) player$: Observable<PlayerInterface>;
  @Select(GameState.gameRatingMode) gameRatingMode$: Observable<GameRatingMode>;
  @Select(GameState.playerType) playerType$: Observable<PlayerEnum>;

  @Select(TournamentGameState.tournamentId) tournamentId$: Observable<number>;
  @Select(TournamentGameState.isLastTour) isLastTour$: Observable<boolean>;

  public readonly PlayerType = PlayerEnum;
  public readonly GameRatingMode = GameRatingMode;

  @Input() standing: OnlineTournamentStandingInterface;

  @OnChangesInputObservable('standing')
  public standing$ = new BehaviorSubject<OnlineTournamentStandingInterface>(this.standing);
  public resultDelta = 0;

  constructor(
    private paygatePopupService: PaygatePopupService,
    private router: Router,
    public tournamentService: OnlineTournamentService,
    private modalService: ModalWindowsService
  ) {
    this.account$.pipe(filter(a => !!a)).subscribe((account) => {
      return account.subscriptions;
    });

    this.standing$.subscribe( (data) => {
      this.isLoader = data || null;
    });
  }

  ngOnInit() {
    this.setResultDelta();
  }

  @OnChangesObservable()
  ngOnChanges() {}

  ngOnDestroy(): void { }


  public showLoader(): boolean {
    return this.isLoader == null;
  }


  public goToLobby(): void {
    this.tournamentId$.pipe(
      untilDestroyed(this)
    ).subscribe( (tournamentId) => {
      this.modalService.closeAll();
      this.router.navigate([`/tournament/${tournamentId}`]).then(() => {});
    });
  }

  public navigateToFideRegister(): void {
    this.paygatePopupService.setState({ fideSelected: true });
    this.paygatePopupService.stepLoaded$.next('payment');
    this.router.navigate(['', { outlets: { p: ['paygate', 'payment']} }]);
    this.modalService.closeAll();
  }

  private setResultDelta(): void {
    this.gameResult$.pipe(
      untilDestroyed(this)
    ).subscribe((result) => {
      switch (result) {
        case GameResult.WON:
          this.resultDelta = 1;
          break;
        case GameResult.DRAW:
          this.resultDelta = 0.5;
          break;
        case GameResult.LOST:
          this.resultDelta = 0;
          break;
      }
    });
  }
}
