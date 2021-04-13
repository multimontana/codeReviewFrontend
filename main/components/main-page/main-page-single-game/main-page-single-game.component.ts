import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { untilDestroyed } from '@app/@core';
import { AccountVerification, IAccountRating, ISettingsGameAccount } from '@app/account/account-store/account.model';
import { selectAccount } from '@app/account/account-store/account.reducer';
import { selectIsAuthorized } from '@app/auth/auth.reducer';
import { GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import {
  GameSavedOpponentRequestInterface,
  OnlineRatingInterface,
  OpponentModeEnum,
  StartEnum,
  SubmitButtonModeEnum
} from '@app/modules/game/models';
import {
  GetTimeControls,
  SetNotification,
  SetSelectedRatingMode,
  SetSelectedTimeControl
} from '@app/modules/game/state/game.actions';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { GameState } from '@app/modules/game/state/game.state';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { selectFideIdPlan } from '@app/purchases/subscriptions/subscriptions.reducer';
import * as fromRoot from '@app/reducers';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';
import { select, Store as NgrxStore } from '@ngrx/store';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, first, map, switchMap, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'main-page-single-game',
  templateUrl: './main-page-single-game.component.html',
  styleUrls: ['./main-page-single-game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPageSingleGameComponent implements OnInit, OnDestroy {

  @Select(GameState.getUID) playerUid$: Observable<string>;
  @Select(GameState.waitingOpponent) waitingOpponent$: Observable<boolean>;
  @Select(GameState.onlineRequestFailed) onlineRequestFailed$: Observable<boolean>;
  @Select(GameState.gameReady) gameReady$: Observable<boolean>;
  @Select(GameState.timeControls) timeControls$: Observable<ITimeControl[]>;
  @Select(GameState.selectedTimeControl) timeControl$: Observable<ITimeControl>;
  @Select(GameState.gameRatingMode) gameRatingMode$: Observable<GameRatingMode>;
  @Select(GameState.accountRating) accountRating$: Observable<IAccountRating>;
  @Select(GameState.onlineRatings) onlineRatings$: Observable<OnlineRatingInterface[]>;
  @Select(GameState.startIndexOnlineRatingRange) startIndexOnlineRatingRange$: Observable<number>;
  @Select(GameState.widthOnlineRatingRange) widthOnlineRatingRange$: Observable<number>;
  @Select(GameState.opponentMode) opponentMode$: Observable<OpponentModeEnum>;
  @Select(GameState.notification) notification$: Observable<string>;
  @Select(GameState.getIsReplay) getIsReplay$: Observable<boolean>;
  @Select(GameState.lastOpponentMode) lastOpponentMode$: Observable<OpponentModeEnum>;
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

  @ViewChild('fieldInviteURL', { static: false }) fieldInviteURL: ElementRef<any>;

  @Input() full = false;

  public settingsForm = new FormGroup({
    timeControl: new FormControl(null),
    ratingMode: new FormControl(GameRatingMode.UNRATED),
    ratingRange: new FormControl()
  });
  public submitButtonMode = SubmitButtonModeEnum.FIND_OPPONENT;
  public SubmitButtonMode = SubmitButtonModeEnum;
  public GameRatingMode = GameRatingMode;
  public disabled$: Subject<boolean> = new BehaviorSubject(true);

  private inviteCode = '';
  private isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized)
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

  constructor(
    private store: Store,
    private store$: NgrxStore<fromRoot.State>,
    private router: Router,
    private paygatePopupService: PaygatePopupService,
    private gameSharedService: GameSharedService,
    private modal: ModalWindowsService,
    private dialog: MatDialog,
    private paygateService: PaygatePopupManagerService,
    private cdr: ChangeDetectorRef
  ) {
    this.subToCancelInvite();
    this.subToInviteCode();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetTimeControls());
    this.subForSubmitButtonMode();
    this.subToTimeControl();
    this.subToFormTimeControlValue();
    this.subToFormRatingModeValue();
  }

  ngOnDestroy() {
  }

  public findOpponent($event?: MouseEvent): void {
    $event && $event.stopPropagation();
    this.saveRequestAndNavigate(OpponentModeEnum.HUMAN);
  }

  public inviteFriend($event?: MouseEvent): void {
    $event && $event.stopPropagation();
    this.saveRequestAndNavigate(OpponentModeEnum.FRIEND);
  }

  public playComputer($event?: MouseEvent): void {
    $event && $event.stopPropagation();
    this.saveRequestAndNavigate(OpponentModeEnum.BOT);
  }

  public createAccount(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.router.navigate(['', { outlets: { p: ['paygate', 'register'] } }]);
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

  private subToCancelInvite() {
    this.getCancelInvite$
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        if (data) {
          this.submitButtonMode = SubmitButtonModeEnum.CANCEL_INVITE;
          this.cdr.detectChanges();
        }
      });
  }

  private subToInviteCode() {
    this.inviteCode$
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        if (data) {
          this.inviteCode = data;
        } else {
          this.submitButtonMode = SubmitButtonModeEnum.FIND_OPPONENT;
          this.settingsForm.enable();
        }
        this.cdr.detectChanges();
      });
  }

  private subForSubmitButtonMode(): void {
    combineLatest([
      this.settingsForm.valueChanges,
      this.isAuthorized$,
      this.fidePurchased$,
      this.fideIdStatus$,
      this.getCancelInvite$,
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([value, isAuthorized, fidePurchased, fideIdStatus, cancelInvite]) => {
        if (!cancelInvite) {
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
        this.cdr.detectChanges();
      });
  }

  private subToTimeControl(): void {
    this.timeControl$
      .pipe(
        filter((timecontrol) => !!timecontrol),
        first(),
        untilDestroyed(this))
      .subscribe((timecontrol) => {
        this.settingsForm.patchValue({
          timeControl: timecontrol
        });
      });
  }

  private subToFormTimeControlValue(): void {
    combineLatest([
      this.settingsForm.controls['timeControl'].valueChanges
        .pipe(distinctUntilChanged()),
      this.getCancelInvite$,
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([value, cancel]) => {
        if (!cancel) {
          this.store.dispatch(new SetSelectedTimeControl(value));
        }
      });
  }

  private subToFormRatingModeValue(): void {
    combineLatest([
      this.settingsForm.controls['ratingMode'].valueChanges,
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
  }

  private saveRequestAndNavigate(opponentMode: OpponentModeEnum): void {
    combineLatest([
      this.playerUid$,
      this.onlineRatings$,
      this.timeControl$,
      this.gameRatingMode$,
      this.startIndexOnlineRatingRange$,
      this.widthOnlineRatingRange$,
    ])
      .pipe(
        map(([
               playerUid,
               onlineRatings,
               timeControl,
               gameRatingMode,
               startIndexOnlineRatingRange,
               widthOnlineRatingRange]): GameSavedOpponentRequestInterface => ({
            player_uid: playerUid,
            rating: [gameRatingMode],
            opp_mode: opponentMode,
            time_control: [timeControl.id],
            rating_limits: {
              lower: onlineRatings[startIndexOnlineRatingRange].rating,
              upper: onlineRatings[startIndexOnlineRatingRange + widthOnlineRatingRange].rating
            }
          })
        ),
        first(),
        switchMap((saveRequest) => this.gameSharedService.saveSearchOpponentRequest(saveRequest)),
        untilDestroyed(this)
      )
      .subscribe(
        (response: GameSavedOpponentRequestInterface) => {
          this.paygateService.crossAppNavigate(true, '/singlegames', false, response.player_uid);
        }
      );
  }
}
