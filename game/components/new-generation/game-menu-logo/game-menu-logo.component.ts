import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Select } from '@ngxs/store';
import { takeUntil } from 'rxjs/operators';

import { GameRatingMode } from '@app/broadcast/core/tour/tour.model';
import { NewMessageInterface } from '@app/modules/game/models';
import { GameState } from '@app/modules/game/state/game.state';
import { OnlineTournamentInterface } from '@app/modules/game/modules/tournaments/models';
import { TournamentState } from '@app/modules/game/modules/tournaments/states/tournament.state';
@Component({
  selector: 'game-menu-logo',
  templateUrl: './game-menu-logo.component.html',
  styleUrls: ['./game-menu-logo.component.scss']
})
export class GameMenuLogoComponent implements OnInit, OnDestroy {

  @Input()
  isTournamentMenu = false;

  @Select(GameState.gameMenuVisible) gameMenuVisible$: Observable<boolean>;
  @Select(GameState.gameRatingMode) gameRatingMode$: Observable<GameRatingMode>;
  @Select(GameState.gameInProgress) gameInProgress$: Observable<boolean>;
  @Select(GameState.getNewMessage) getNewMessage$: Observable<NewMessageInterface>;
  @Select(TournamentState.getTournament) tournament$: Observable<OnlineTournamentInterface>;

  GameRatingMode = GameRatingMode;
  openmenu = false;
  destroy$ = new Subject();

  constructor(
  ) {
    this.gameMenuVisible$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((menuVisible) => {
      this.openmenu = menuVisible;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
