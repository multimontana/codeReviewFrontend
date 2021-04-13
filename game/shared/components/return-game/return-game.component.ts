import { BehaviorSubject } from 'rxjs';
import * as fromRoot from '@app/reducers';
import * as moment from 'moment';

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import {
  UpdateMeEnum,
  OnlineTournamentStandingInterface,
  UpdateMeResponseInterface,
} from '@app/modules/game/modules/tournaments/models';
import { Store as NGRXStore, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  filter,
  first,
  map,
  shareReplay,
  switchMap,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';

import { GameTranslateService } from '../../../services/game-translate.service';
import { IAccount } from '@app/account/account-store/account.model';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { OnlineTournamentResourceService } from '@app/modules/game/modules/tournaments/providers/tournament.resource.service';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { TourResourceService } from '@app/broadcast/core/tour/tour-resource.service';
import { TournamentGameState } from '../../../modules/tournaments/states/tournament.game.state';
import { TournamentState } from '@app/modules/game/modules/tournaments/states/tournament.state';
import { selectMyAccount } from '@app/account/account-store/account.reducer';
import { untilDestroyed } from '@app/@core';
import { SetPlayerDisqualified } from '@app/modules/game/modules/tournaments/states/tournament.actions';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { truthy } from '@app/shared/helpers/rxjs-operators.helper';
import { TournamentLogService } from '@app/modules/game/modules/tournaments/services/tournament.log.service';

@Component({
  selector: 'wc-return-game',
  templateUrl: './return-game.component.html',
  styleUrls: ['./return-game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ReturnGameComponent implements OnInit, OnDestroy {
  @Select(TournamentGameState.hasNoTour) hasNoTour$: Observable<boolean>;
  @Select(TournamentGameState.getCurrentTourId) getCurrentTourId$: Observable<number>;
  // @Select(TournamentState.getStandings) getStandings$: Observable<OnlineTournamentStandingInterface[]>;

  public readonly account$: Observable<IAccount> = this.store$
    .pipe(
      select(selectMyAccount),
      shareReplay(1)
    );

  public readonly countdownTimer$: Observable<number> = this.getCurrentTourId$.pipe(
    switchMap((id) => {
      return this.tourService.getWithDefaults(id)
        .pipe(map((m) => moment(m.tour.datetime_of_round).diff(moment(), 'seconds')));
    }),
  );

  public readonly player$ = this.account$.pipe(
    filter((account) => !!account),
    map((account) => account.player),
    filter((player) => !!player),
  );

  public isShowReturnGame$: Observable<boolean>;

  private lastUpdateMe$ = new BehaviorSubject<UpdateMeResponseInterface>(null);

  constructor(
    private tourService: TourResourceService,
    private store$: NGRXStore<fromRoot.State>,
    private store: Store,
    private router: Router,
    private modalService: ModalWindowsService,
    private onlineTournamentResource: OnlineTournamentResourceService,
    private gameTranslateService: GameTranslateService,
    private gameResourceService: GameResourceService,
    private tournamentLogService: TournamentLogService
  ) {}

  ngOnInit(): void {
    this.subToAccount();
    this.subToLossSocketMessages();
    this.isShowReturnGame$ = this.lastUpdateMe$
      .pipe(
        map(this.checkOnShow()),
      );
  }

  ngOnDestroy(): void {
  }

  public goToBoard(): void {
    this.lastUpdateMe$.pipe(
      withLatestFrom(this.hasNoTour$),
      first()
    ).subscribe(([updateMe, hasNoTour]) => {
      if (
        updateMe.status === UpdateMeEnum.GAME_IN_PROGRESS ||
        (updateMe.status === UpdateMeEnum.WAITING_FOR_NEXT_TOUR && updateMe.board_uid)
      ) {
        this.modalService.closeAll();
        this.router.navigate([`/tournament/pairing/${updateMe.board_uid}/`]).then(() => {});
      } else {
        if (hasNoTour || updateMe.is_first_tour) {
          this.subToGameTranslateService('TEXT.OOPS_HAVE_OPPONENT');
        } else {
          this.subToGameTranslateService('TEXT.OOPS_YOU_LOST');
        }
      }
    });
  }

  private subToGameTranslateService(textConst: string): void {
    this.gameTranslateService
      .getTranslate(textConst)
      .pipe(
        first()
      )
      .subscribe((msg) => {
        this.modalService.alert('', msg);
      });
  }

  private checkOnShow(): (value: UpdateMeResponseInterface, index: number) => boolean {
    return (updateMe) => {
      if (!updateMe) {
        return false;
      }

      if ([UpdateMeEnum.GAMEOVER, UpdateMeEnum.TOURNAMENT_OVER].includes(updateMe.status)) {
        return false;
      }

      if (updateMe.status === UpdateMeEnum.PLAYER_DISQUALIFIED) {
        this.store.dispatch(new SetPlayerDisqualified(true));
        return false;
      }

      if (updateMe.is_first_tour) {
        return true;
      }

      if (UpdateMeEnum.WAITING_FOR_NEXT_TOUR === updateMe.status) {
        return (updateMe.board_uid) ? true : false;
      }
      if (UpdateMeEnum.GAME_IN_PROGRESS === updateMe.status) {
        return true;
      }
    };
  }

  private getUpdateMe(): void {
    this.onlineTournamentResource.updateMe()
      .pipe(untilDestroyed(this))
      .subscribe((updateMe) => {
        this.lastUpdateMe$.next(updateMe);
        this.onlineTournamentResource.initTournamentAfterUpdateMe(updateMe, false);
        this.tournamentLogService.loadUpdateMeResponse(updateMe);
      });
  }

  private subToAccount(): void {
    this.account$
      .pipe(
        truthy(),
        throttleTime(500),
        untilDestroyed(this)
      )
      .subscribe((acc) => {
        this.getUpdateMe();
      });
  }

  private subToLossSocketMessages(): void {
    this.gameResourceService.getLossOfSocketMessage()
      .pipe(
        withLatestFrom(this.account$),
        untilDestroyed(this))
      .subscribe(([loss, account]) => {
        if (account) {
          this.getUpdateMe();
        }
      });
  }
}
