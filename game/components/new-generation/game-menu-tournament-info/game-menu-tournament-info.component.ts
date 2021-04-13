import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { GameResult } from '../../../state/game-result-enum';
import { GameState } from '../../../state/game.state';
import { OnlineTournamentInterface } from '@app/modules/game/modules/tournaments/models';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { TournamentGameState } from '@app/modules/game/modules/tournaments/states/tournament.game.state';
import { TournamentState } from '@app/modules/game/modules/tournaments/states/tournament.state';
import { TournamentStatus } from '@app/broadcast/core/tournament/tournament.model';
@Component({
  selector: 'game-menu-tournament-info',
  templateUrl: 'game-menu-tournament-info.component.html',
  styleUrls: ['game-menu-tournament-info.component.scss'],
})
export class GameMenuTournamentInfoComponent implements OnInit, OnDestroy {

  /**
   * Destruction of the observer.
   * @type {Subject}
   * @memberof GameMenuTournamentInfoComponent
   */
  destroy$ = new Subject();

  @Select(TournamentGameState.tournamentId) tournamentId$: Observable<number>;
  @Select(TournamentGameState.tournamentName) tournamentName$: Observable<string>;
  @Select(TournamentGameState.tournamentNumberOfTours) tournamentNumberOfTours$: Observable<number>;
  @Select(TournamentGameState.tournamentCurrentTourNumber) tournamentCurrentTourNumber$: Observable<number>;
  @Select(TournamentState.getTournament) tournament$: Observable<OnlineTournamentInterface>;
  /**
   * Result of the current game
   * @type {Observable<GameResult>} enum type
   * @see {@link src/app/modules/game/state/game-result-enum.ts}
   * @memberof GameMenuTournamentInfoComponent
   */
  @Select(GameState.gameResult) gameResult$: Observable<GameResult>;

  /**
   *Creates an instance of GameMenuTournamentInfoComponent.
   * @param {ModalWindowsService} modalService
   * @param {Router} router
   * @memberof GameMenuTournamentInfoComponent
   */
  constructor(
    private modalService: ModalWindowsService,
    private router: Router,
  ){}

  ngOnInit() {
  }

  /**
   * Return to the tournament lobby
   * @memberof GameMenuTournamentInfoComponent
   */
  goToLobby() {
    this.tournamentId$.pipe(
      takeUntil(this.destroy$)
    ).subscribe( (tournamentId) => {
      this.modalService.closeAll();
      this.router.navigate([`/tournament/${tournamentId}`]).then(() => {});
    });

    this.tournament$.pipe(first()).subscribe((tournament) => {
      window['dataLayerPush'](
        'whcTournament',
        'Tournament',
        'Game',
        'Tournaments icon',
        tournament.title,
        '',
        tournament.id,
        tournament.status === TournamentStatus.EXPECTED ? 'future' : tournament.status === TournamentStatus.GOES ? 'actual' : 'ended'
      );
    })
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
