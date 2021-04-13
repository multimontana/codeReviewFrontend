import * as fromRoot from '@app/reducers';
import {
  AbortGame,
  RejectOpponentRequestLast,
  ResetQuickstartFlag,
  SetGameSettings, SetInviteCode, SetQuickstartFlag,
  SetReplayNotification, SetStartOnlineRatingRange, SetUidForLoadSavedOpponentRequest, SetWidthOnlineRatingRange
} from '../../../../state/game.actions';
import { AccountVerification, IAccountRating, ISettingsGameAccount } from '@app/account/account-store/account.model';
import { ActivatedRoute, NavigationStart, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import {
  ClearOnlineRequestStatus,
  RejectOpponentRequest,
  RequestOpponent,
  RestartGame,
  SetCancelInvite,
  SetNotification,
  SetOpponentMode,
  SetSelectedRatingMode,
  SetSelectedTimeControl,
  SetSelectedTimeControlRatingMode
} from '../../../../state/game.actions';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import {
  GameSavedOpponentRequestInterface, GamingSelectorMode,
  OnlineRatingInterface,
  OpponentModeEnum,
  StartEnum,
  SubmitButtonModeEnum
} from '@app/modules/game/models';
import { GameState } from '@app/modules/game/state/game.state';
import { Store as NgrxStore,
  select } from '@ngrx/store';
import { Select, Store } from '@ngxs/store';
import { distinctUntilChanged, filter, first, map, skip, switchAll, take, takeUntil, takeWhile, withLatestFrom } from 'rxjs/operators';

import { AccountService } from '@app/account/account-module/services/account.service';
import { GameSettingsWindowsComponent } from '@app/modal-windows/game-settings-windows/game-settings-windows.component';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';

import { MatDialog } from '@angular/material/dialog';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { TournamentGameState } from '@app/modules/game/modules/tournaments/states/tournament.game.state';
import { environment } from '@env';
import { selectAccount } from '@app/account/account-store/account.reducer';
import { selectFideIdPlan } from '@app/purchases/subscriptions/subscriptions.reducer';
import { selectIsAuthorized } from '@app/auth/auth.reducer';
import { truthy } from '@app/shared/helpers/rxjs-operators.helper';
import { untilDestroyed } from '@app/@core';
import { Location } from '@angular/common';
import { HostListener } from '@angular/core';
import GameParamsEmitter from '../../../../../../../emiiters/GameParamsEmitter.js';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';

@Component({
  selector: 'game-launch-settings',
  templateUrl: 'launch-settings.component.html',
  styleUrls: ['launch-settings.component.scss']
})
export class GameLaunchSettingsComponent implements OnInit, OnDestroy {
  @Select(GameState.waitingOpponent) waitingOpponent$: Observable<boolean>;
  @Select(GameState.onlineRequestFailed) onlineRequestFailed$: Observable<boolean>;
  @Select(GameState.gameReady) gameReady$: Observable<boolean>;
  @Select(GameState.timeControls) timeControls$: Observable<ITimeControl[]>;
  @Select(GameState.selectedTimeControl) timeControl$: Observable<ITimeControl>;
  @Select(GameState.accountRating) accountRating$: Observable<IAccountRating>;
  @Select(GameState.onlineRatings) onlineRatings$: Observable<OnlineRatingInterface[]>;
  @Select(GameState.notification) notification$: Observable<string>;
  @Select(GameState.getIsReplay) getIsReplay$: Observable<boolean>;
  @Select(GameState.lastOpponentMode) lastOpponentMode$: Observable<OpponentModeEnum>;
  @Select(GameState.gameRatingMode) gameRatingMode$: Observable<GameRatingMode>;
  /**
   * Get game settings;
   */
  @Select(GameState.getGameSettings) gameSettings$: Observable<ISettingsGameAccount>;
  /**
   * invite code
   */
  @Select(GameState.getInviteCode) inviteCode$: Observable<string>;
  @Select(GameState.getCancelInvite) getCancelInvite$: Observable<boolean>;
  /**
   * replay
   */
  @Select(GameState.getReplayNotification) getReplayNotification$: Observable<string>;
  /**
   * rematch
   */
  @Select(GameState.getRematchNotification) getRematchNotification$: Observable<string>;
  @Select(GameState.getIsRematch) getIsRematch$: Observable<boolean>;
  @Select(GameState.getQuickStart) getQuickStart$: Observable<StartEnum>;
  @Select(GameState.uidForLoadSavedOpponentRequest) uidForLoadSavedOpponentRequest$: Observable<string>;

  @Select(TournamentGameState.tournamentGameInProgressOrJustFinished)

  public tournamentGameInProgressOrJustFinished$: Observable<boolean>;

  public settingsForm = new FormGroup({
    timeControl: new FormControl(null),
    ratingMode: new FormControl(GameRatingMode.UNRATED),
    ratingRange: new FormControl()
  });

  public gameURL = environment['gameUrl'];
  public inviteCode = '';

  public playComputerIsSearching$ = new BehaviorSubject(false);
  public submitButtonMode = SubmitButtonModeEnum.FIND_OPPONENT;
  public SubmitButtonMode = SubmitButtonModeEnum;
  public GameRatingMode = GameRatingMode;
  public GamingSelectorMode = GamingSelectorMode;

  public disabled$: Subject<boolean> = new BehaviorSubject(true);
  public isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized),
  );

  private fidePurchased$: Observable<boolean> = this.store$.pipe(
    select(selectFideIdPlan),
    map((fidePlan) => {
      return fidePlan && fidePlan.is_active;
    })
  );

  private fideIdStatus$: Observable<AccountVerification> = this.store$.pipe(
    select(selectAccount),
    map((account) => {
      if (account && account.account) {
        return account.account.fide_verified_status;
      }

      return AccountVerification.NOT_VERIFIED;
    })
  );

  private showCopied$ = new BehaviorSubject(false);

  private gameSettings: ISettingsGameAccount;

  private _oppmode: OpponentModeEnum;

  private routeBoardId$ = this.route.params.pipe(
    map(params => (params && params['board_id']) ? params['board_id'] : null),
  );

  private playParam$ = this.route.queryParams.pipe(
    map(params => (params && params['play']) ? params['play'] : null),
  );

  @ViewChild('fieldInviteURL', {static: false}) fieldInviteURL: ElementRef<any>;

  constructor(
    private store: Store,
    private store$: NgrxStore<fromRoot.State>,
    private router: Router,
    private route: ActivatedRoute,
    private paygatePopupService: PaygatePopupService,
    private gameSharedService: GameSharedService,
    private modal: ModalWindowsService,
    private dialog: MatDialog,
    public accountService: AccountService,
    private location: Location,
    private _route: ActivatedRoute,
    private gameService: GameResourceService
  ) {
    const snapshot: ParamMap = _route.snapshot.queryParamMap;
    const gameInvite = JSON.parse(window.localStorage.getItem('game_invite'));
    this.getCancelInvite$
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        if (data) {
          this.submitButtonMode = SubmitButtonModeEnum.CANCEL_INVITE;
        }
      });

    this.inviteCode$
      .pipe(untilDestroyed(this))
      .subscribe(data => {
      if (data) {
        this.inviteCode = data;
      } else {
        this.submitButtonMode = SubmitButtonModeEnum.FIND_OPPONENT;
        this.settingsForm.enable();
      }
    });

    this.gameSettings$
      .pipe(untilDestroyed(this))
      .subscribe((settings) => this.gameSettings = settings);
  }

  ngOnInit(): void {
    const fn = GameParamsEmitter.subscribe(data => {
      switch (data.opponentMode) {
        case 'human' :
          setTimeout(() => {
             this.findOpponent();
           }, 1000);
          break;
        case 'friend' :
          setTimeout(() => {
            this.inviteFriend();
          }, 1000);
          break;
      }
    });
    GameParamsEmitter.unsubscribe(fn);
    combineLatest([
      this.settingsForm.valueChanges,
      this.isAuthorized$,
      this.fidePurchased$,
      this.fideIdStatus$,
      this.getCancelInvite$,
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([value, isAuthorized, fidePurchased, fideIdStatus, cancelInvite]) => {
        if (!cancelInvite && this.submitButtonMode !== SubmitButtonModeEnum.SEARCHING
        && this.submitButtonMode !== SubmitButtonModeEnum.INVITE_FRIEND) {
        this.submitButtonMode = SubmitButtonModeEnum.FIND_OPPONENT;
        if (value && value.ratingMode === GameRatingMode.RATED && !isAuthorized) {
          this.submitButtonMode = SubmitButtonModeEnum.CREATE_ACCOUNT;
        } else if (value && value.ratingMode === GameRatingMode.FIDERATED) {
          if (isAuthorized) {
            if (!fidePurchased) {
              this.submitButtonMode = SubmitButtonModeEnum.UPGRADE_NOW;
            } else {
              if (!fideIdStatus) {
                this.submitButtonMode = SubmitButtonModeEnum.NEED_FIDE_ID_REGISTER;
              } else if (fideIdStatus === AccountVerification.ON_CHECK) {
                this.submitButtonMode = SubmitButtonModeEnum.NEED_FIDE_ID_APPROVE;
              }
            }
          } else {
            this.submitButtonMode = SubmitButtonModeEnum.CREATE_ACCOUNT;
          }
        }
      }
    });

    this.timeControl$
      .pipe(
        filter((timecontrol) => !!timecontrol),
        untilDestroyed(this)
      ).subscribe((timecontrol) => {
      if (this.settingsForm.controls['timeControl'].value !== timecontrol) {
          this.settingsForm.patchValue({
            timeControl: timecontrol
          });
        }
      });

    this.gameRatingMode$
      .pipe(
        filter((gameRatingMode) => !!gameRatingMode),
        untilDestroyed(this)
      ).subscribe((gameRatingMode) => {
        if (this.settingsForm.controls['ratingMode'].value !== gameRatingMode) {
          this.settingsForm.patchValue({
            ratingMode: gameRatingMode
          });
        }
      });

    combineLatest([
      this.settingsForm.controls['timeControl'].valueChanges
        .pipe(distinctUntilChanged()),
      this.getCancelInvite$,
      this.inviteCode$,
      this.routeBoardId$,
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([value, cancel, inviteCode, boardId]) => {
        if (!cancel && !inviteCode && !boardId) {
          this.store.dispatch(new SetSelectedTimeControl(value));
        }
      });

    combineLatest([
      this.settingsForm.controls['ratingMode'].valueChanges.pipe(
        untilDestroyed(this)
      ),
      this.getReplayNotification$,
    ])
      .pipe(
        withLatestFrom(this.getIsRematch$, this.inviteCode$),
        distinctUntilChanged(),
        untilDestroyed(this)
      )
      .subscribe(([some, rematch, inviteCode]) => {
        const [ratingMode, _] = some;
        if (!rematch && !inviteCode) {
          this.store.dispatch(new SetSelectedRatingMode(ratingMode));
        }
      });

    this.onlineRequestFailed$
      .pipe(untilDestroyed(this))
      .subscribe((onlineRequestFailed) => {
        if (onlineRequestFailed) {
          this.playComputerIsSearching$.next(false);
          this.submitButtonMode = SubmitButtonModeEnum.FIND_OPPONENT;
          this.modal.alert('', `We couldn't connect you with the opponent. It's rare but it happens. Please search again!`);
          this.settingsForm.enable();
          this.store.dispatch(new ClearOnlineRequestStatus());
        }
      });

    this.getQuickStart$
      .pipe(
        truthy(),
        first(),
        untilDestroyed(this)
      )
      .subscribe(quickStart => {
        if (quickStart) {
          this.store.dispatch(new ResetQuickstartFlag())
            .pipe(untilDestroyed(this))
            .subscribe(_ => {
                this.onlineRatings$.pipe(
                  truthy(),
                  filter((onlineRatings) => !!onlineRatings.length),
                  first(),
                  untilDestroyed(this)
                ).subscribe(v => {
                  this.disabled$.next(false);
                  if (quickStart === StartEnum.Quickstart) {
                    this.findOpponent();
                  } else if (quickStart === StartEnum.Computer) {
                    this.playComputer();
                  } else if (quickStart === StartEnum.InviteFriend) {
                    this.inviteFriend();
                  } else if (quickStart === StartEnum.CreateAccount) {
                    this.createAccount();
                  }
                });
              }
            );
        } else {
          this.disabled$.next(false);
        }
      });

    this.uidForLoadSavedOpponentRequest$
      .pipe(
        truthy(),
        first(),
        untilDestroyed(this)
      )
      .subscribe((uid) => {
        this.getSettingsFromSavedRequest(uid);
      });

    combineLatest([this.playParam$, this.timeControl$])
      .pipe(untilDestroyed(this))
      .subscribe(([playParam, timeControl]) => {
        if (playParam === 'computer' && !!timeControl) {
          const urlTree = this.router.parseUrl(this.router.url);
          urlTree.queryParams = {};
          this.router.navigateByUrl(urlTree, { skipLocationChange: false });

          setTimeout(() => {
            this.store.dispatch(new SetStartOnlineRatingRange(10));
            this.store.dispatch(new SetWidthOnlineRatingRange(10));

            this.playComputer();
          }, 500);
        }
    });
  }

  ngOnDestroy() {
    this.store.dispatch(new SetUidForLoadSavedOpponentRequest(''));
  }

  @HostListener('window:popstate')
  onPopState(): void {
    if (this.location.path() === this.generateMembershipUrlPattern('paygate', 'payment')) {
      this.paygatePopupService.setState({fideSelected: true});
      this.paygatePopupService.stepLoaded$.next('payment');
      window['dataLayerPush'](
        'wchPlay',
        'Play',
        'Upgrade now',
        this.gameSharedService.convertBoardType(this.settingsForm.value['timeControl'].board_type),
        this.gameSharedService.convertTime(this.settingsForm.value['timeControl']),
        this.gameSharedService.convertGameMode(this.settingsForm.value['ratingMode'])
      );
    }
  }

  public findOpponent(event?: Event): void {
    if (!this.playComputerIsSearching$.value) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.store.dispatch(new SetOpponentMode(OpponentModeEnum.HUMAN));
      this.gameReady$
        .pipe(
          first(),
          untilDestroyed(this))
        .subscribe((ready) => {
          this.submitButtonMode = SubmitButtonModeEnum.SEARCHING;
          if (ready) {
            this.store.dispatch(new RestartGame());
          }
          this.settingsForm.disable();
          this.store.dispatch(new RequestOpponent());
        });
      window['dataLayerPush'](
        'wchPlay',
        'Play',
        'Find opponent',
        this.gameSharedService.convertBoardType(
          this.settingsForm.value['timeControl'] && this.settingsForm.value['timeControl'].board_type),
        this.gameSharedService.convertTime(this.settingsForm.value['timeControl']),
        this.gameSharedService.convertGameMode(this.settingsForm.value['ratingMode'])
      );
    }
  }

  public generateMembershipUrlPattern(component: string, type: string): string {
    return `/singlegames(p:${component}/${type})`;
  }

  public inviteFriend(event?: Event): void {
    if (this.submitButtonMode !== SubmitButtonModeEnum.SEARCHING && this.submitButtonMode !== SubmitButtonModeEnum.CREATE_ACCOUNT) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.store.dispatch(new SetOpponentMode(OpponentModeEnum.FRIEND));
      this.gameReady$
        .pipe(
          first(),
          untilDestroyed(this))
        .subscribe((ready) => {
        if (ready) {
          this.store.dispatch(new RestartGame());
        }
        this.settingsForm.disable();
        this.store.dispatch(new RequestOpponent());
        this.submitButtonMode = SubmitButtonModeEnum.INVITE_FRIEND;
      });
      window['dataLayerPush'](
        'wchPlay',
        'Play',
        'Invite a friend',
        this.gameSharedService.convertBoardType(this.settingsForm.value['timeControl'].board_type),
        this.gameSharedService.convertTime(this.settingsForm.value['timeControl']),
        this.gameSharedService.convertGameMode(this.settingsForm.value['ratingMode'])
      );
    }
  }

  public stopSearching(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.gameReady$
      .pipe(
        first(),
        untilDestroyed(this))
      .subscribe(() => {
        this.store.dispatch(new RejectOpponentRequest());
        this.settingsForm.enable();
        this.submitButtonMode = SubmitButtonModeEnum.FIND_OPPONENT;
      });
    window['dataLayerPush'](
      'wchPlay',
      'Play',
      'Enough!',
      this.gameSharedService.convertBoardType(this.settingsForm.value['timeControl'].board_type),
      this.gameSharedService.convertTime(this.settingsForm.value['timeControl']),
      this.gameSharedService.convertGameMode(this.settingsForm.value['ratingMode'])
    );
  }

  public setCancelInvite(event: Event): void {
    this.submitButtonMode = SubmitButtonModeEnum.FIND_OPPONENT;
    this.store.dispatch(new SetNotification(''));
    if (this._oppmode === OpponentModeEnum.BOT) {
      this.store.dispatch(new AbortGame());
    } else {
      this.store.dispatch(new SetCancelInvite(false));
    }
    this.stopSearching(event);
  }

  public cancelRematch(event: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.store.dispatch(new SetReplayNotification(null));
    this.store.dispatch(new SetNotification(''));
    this.settingsForm.enable();
    this.submitButtonMode = SubmitButtonModeEnum.FIND_OPPONENT;
    this.lastOpponentMode$
      .pipe(
        distinctUntilChanged(),
        first(),
        untilDestroyed(this)
      )
      .subscribe((opponent) => {
        if (opponent === OpponentModeEnum.BOT) {
          this.store.dispatch(new AbortGame());
        } else {
          this.gameReady$.pipe(take(1)).subscribe(() => {
            this.store.dispatch(new RejectOpponentRequestLast());
          });
        }
      });
  }

  public createAccount(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    window['dataLayerPush'](
      'wchPlay',
      'Play',
      'Create account',
      this.gameSharedService.convertBoardType(this.settingsForm.value['timeControl'].board_type),
      this.gameSharedService.convertTime(this.settingsForm.value['timeControl']),
      this.gameSharedService.convertGameMode(this.settingsForm.value['ratingMode'])
    );
    this.router.navigate(['', {outlets: {p: ['paygate', 'register']}}]);
  }

  public updateAccount(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.paygatePopupService.setState({fideSelected: true});
    this.paygatePopupService.stepLoaded$.next('payment');
    window['dataLayerPush'](
      'wchPlay',
      'Play',
      'Upgrade now',
      this.gameSharedService.convertBoardType(this.settingsForm.value['timeControl'].board_type),
      this.gameSharedService.convertTime(this.settingsForm.value['timeControl']),
      this.gameSharedService.convertGameMode(this.settingsForm.value['ratingMode'])
    );
    this.router.navigate(['', {outlets: {p: ['paygate', 'payment']}}]);
  }

  public registerFideId(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.paygatePopupService.setState({fideSelected: true});
    this.router.navigate(['', {outlets: {p: ['paygate', 'fide']}}]);
  }

  public playComputer(event?: Event) {
    if (this.submitButtonMode !== SubmitButtonModeEnum.SEARCHING) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.settingsForm.patchValue({
        ratingMode: GameRatingMode.UNRATED
      });
      this.store.dispatch(new SetSelectedTimeControlRatingMode(
        this.settingsForm.value['timeControl'],
        GameRatingMode.UNRATED
      ));
      this.store.dispatch(new SetOpponentMode(OpponentModeEnum.BOT));
      this.gameReady$
        .pipe(
          first(),
          untilDestroyed(this))
        .subscribe((ready) => {
          if (ready) {
            this.store.dispatch(new RestartGame());
          }
          this.playComputerIsSearching$.next(true);
          this.settingsForm.disable();
          this.store.dispatch(new RequestOpponent());
        });

      window['dataLayerPush'](
        'wchPlay',
        'Play',
        'Play computer',
        this.gameSharedService.convertBoardType(this.settingsForm.value['timeControl'].board_type),
        this.gameSharedService.convertTime(this.settingsForm.value['timeControl']),
        this.gameSharedService.convertGameMode(this.settingsForm.value['ratingMode'])
      );
    }
  }

  public onCopyLink(event: Event) {
    try {
      const el = this.fieldInviteURL.nativeElement;
      el.select();
      const status = document.execCommand('copy');
      (event.target as any).focus();
      this.showCopied$.next(true);
    } catch (err) {
      console.error('Unable to copy');
    }
  }

  public disabledSearch(button: SubmitButtonModeEnum): boolean {
    return ([SubmitButtonModeEnum.SEARCHING, SubmitButtonModeEnum.INVITE_FRIEND, SubmitButtonModeEnum.CANCEL_INVITE].includes(button));
  }

  public disabledInvited(button: SubmitButtonModeEnum): boolean {
    return ([
      SubmitButtonModeEnum.SEARCHING,
      SubmitButtonModeEnum.CREATE_ACCOUNT,
      SubmitButtonModeEnum.INVITE_FRIEND,
      SubmitButtonModeEnum.CANCEL_INVITE].includes(button));
  }

  public hideNotification() {
    this.store.dispatch(new SetNotification(''));
  }

  public settings() {
    // TODO: нужно будет создать универсальный классы с методами для проверки значений
    const checkResults = function (source) {
      return !!(source['board_last_move_style']
        && source['board_style']
        && source['board_legal_move_style']);
    };
    return this.dialog.open(GameSettingsWindowsComponent, {
      panelClass: 'game-settings-player',
      disableClose: true,
      data: this.gameSettings
    }).afterClosed()
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((result) => {
        if (checkResults(result)) {
          this.store.dispatch(new SetGameSettings(
            result['board_style'],
            result['board_last_move_style'],
            result['board_legal_move_style'],
            result['is_sound_enabled']
          ));
        }
      });
  }

  private getSettingsFromSavedRequest(uid) {
    this.gameSharedService.getSavedSearchOpponentRequest(uid)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((savedRequest: GameSavedOpponentRequestInterface) => {
        const lowerRating = savedRequest.rating_limits.lower;
        const upperRating = savedRequest.rating_limits.upper;
        this.store.dispatch(new SetSelectedTimeControl(savedRequest.time_control && savedRequest.time_control[0]));
        this.store.dispatch(new SetSelectedRatingMode(savedRequest.rating && savedRequest.rating[0]));
        this.store.dispatch(new SetStartOnlineRatingRange(lowerRating / 10));
        this.store.dispatch(new SetWidthOnlineRatingRange((upperRating - lowerRating) / 10));
        this.store.dispatch(new SetOpponentMode(savedRequest.opp_mode));
        switch (savedRequest.opp_mode) {
        case OpponentModeEnum.BOT:
          this.store.dispatch(new SetQuickstartFlag(StartEnum.Computer));
        break;
        case OpponentModeEnum.HUMAN:
          this.store.dispatch(new SetQuickstartFlag(StartEnum.Quickstart));
        break;
        case OpponentModeEnum.FRIEND:
          console.log('set quick start invite friend');
          this.store.dispatch(new SetQuickstartFlag(StartEnum.InviteFriend));
        break;
      }
    });
  }
}
