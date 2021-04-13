import * as fromAuth from '@app/auth/auth.reducer';
import { selectToken } from '@app/auth/auth.reducer';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, merge, Observable, of, Subject } from 'rxjs';
import {
  CallAnArbiter,
  CancelDraw,
  DownloadPGN,
  Draw,
  FlipBoard,
  GetTimeControls,
  Resign,
  RestartGame,
  SetDefaultNewMessage,
  SetDefaultValuesAfterGame,
  SetGameMenuVisible,
  SetNewMessage,
  SetOpponentMode,
  SetPlayerColor,
  SetSelectedRatingMode,
  SetSelectedTimeControl,
  SetShowChat,
  SetTimerInitializedInMoves,
  TourBoardReady,
} from '@app/modules/game/state/game.actions';
import {
  CheckStateEnum,
  ForceInterface,
  GameBadgeNotification,
  GameBadgeNotificationEnum,
  GameMoveIterface,
  GameStateInterface,
  NewMessageInterface,
  OpponentModeEnum,
  PlayerEnum
} from '@app/modules/game/models';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { EndReason, GameResult } from '@app/modules/game/state/game-result-enum';
import { GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import { GameState } from '@app/modules/game/state/game.state';
import { OnlineTournamentInterface, OnlineTournamentStandingInterface } from '@app/modules/game/modules/tournaments/models';
import { select, Store as NGRXStore } from '@ngrx/store';
import { Select, Store } from '@ngxs/store';
import {
  SetCurrentTourNumber,
  SetHasNoTourNotification,
  SetLastTourFlag,
  SetReadyToTourUpdate,
  SetTournamentInfo,
  SetTournamentOpponentInfo,
  SetTournamentPlayerInfo,
  SetTourStarted,
  TourReady
} from '@app/modules/game/modules/tournaments/states/tournament.actions';
import {
  catchError,
  debounceTime,
  defaultIfEmpty,
  delay,
  distinctUntilChanged,
  filter,
  first,
  map,
  mergeMap,
  skipWhile,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { ChatSocketService } from '@app/broadcast/chess/chat/services/chat-socket.service';
import { ChessColors } from '../../../../state/game-chess-colors.model';
import { ChessgroundAudioService } from '@app/shared/widgets/chessground/chessground.audio.service';
import { GameDataService } from '../../../../services/game-data.service';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { GameService } from '@app/modules/game/state/game.service';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { GameTranslateService } from '../../../../services/game-translate.service';
import { IAccount } from '@app/account/account-store/account.model';
import { IGameBoard } from '@app/modules/game/state/game-board.model';
import { PlayerInterface } from '@app/broadcast/core/player/player.model';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { OnlineTournamentResourceService } from '@app/modules/game/modules/tournaments/providers/tournament.resource.service';
import { OnlineTournamentService } from '@app/modules/game/modules/tournaments/services/tournament.service';
import { SetLastConnectionActive } from '../../../../state/game.actions';
import { TFigure } from '@app/shared/widgets/chessground/figure.model';
import { TourResourceService } from '@app/broadcast/core/tour/tour-resource.service';
import { TournamentGameState } from '@app/modules/game/modules/tournaments/states/tournament.game.state';
import { TournamentState } from '@app/modules/game/modules/tournaments/states/tournament.state';
import { TournamentStatus } from '../../../../../../broadcast/core/tournament/tournament.model';
import { TranslateService } from '@ngx-translate/core';
import { untilDestroyed } from '@app/@core';
import { TournamentLogService } from '@app/modules/game/modules/tournaments/services/tournament.log.service';
import { SocketConnectionService } from '@app/auth/socket-connection.service';
import { SocketBaseMessageInterface } from '@app/shared/socket/socket-base-message.model';

@Component({
  selector: 'wc-tournament-game-page',
  templateUrl: './tournament-game-page.component.html',
  styleUrls: ['./tournament-game-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentGamePageComponent implements OnInit, OnDestroy {

  @Select(GameState.waitingOpponent) waitingOpponent$: Observable<boolean>;
  @Select(GameState.gameReady) gameReady$: Observable<boolean>;
  @Select(GameState.isResultShown) isResultShown$: Observable<boolean>;
  @Select(GameState.selectedMove) selectedMove$: Observable<GameMoveIterface>;
  @Select(GameState.gameInProgress) gameInProgress$: Observable<boolean>;
  @Select(GameState.timeControls) timeControls$: Observable<ITimeControl[]>;
  @Select(GameState.selectedTimeControl) selectedTimeControl$: Observable<ITimeControl>;
  @Select(GameState.jwt) jwt$: Observable<string>;
  @Select(GameState.getChatId) getChatId$: Observable<string>;
  @Select(TournamentGameState.nextTourJWT) nextTourJWT$: Observable<string>;
  @Select(TournamentGameState.getCurrentActiveBoardId) currentActiveBoardId$: Observable<string>;
  @Select(TournamentGameState.nextTourBoardId) nextTourBoardId$: Observable<string>;
  @Select(TournamentGameState.nextTourId) nextTourId$: Observable<string>;
  @Select(TournamentGameState.getPlayerRank) playerRank$: Observable<number>;
  @Select(TournamentGameState.getPlayerScore) playerScore$: Observable<number>;
  @Select(TournamentGameState.getOpponentRank) opponentRank$: Observable<number>;
  @Select(TournamentGameState.getOpponentScore) opponentScore$: Observable<number>;
  @Select(TournamentGameState.tournamentId) tournamentId$: Observable<number>;
  @Select(TournamentGameState.nextTourBoardCreated) nextTourBoardCreated$: Observable<boolean>;
  @Select(TournamentGameState.readyToTourUpdate) readyToTourUpdate$: Observable<boolean>;
  @Select(TournamentGameState.isLastTour) isLastTour$: Observable<boolean>;
  @Select(TournamentGameState.tournamentName) tournamentName$: Observable<string>;
  @Select(TournamentGameState.tournamentCurrentTourNumber) tournamentCurrentTourNumber$: Observable<number>;
  @Select(TournamentGameState.getCurrentTourId) getCurrentTourId$: Observable<number>;
  @Select(TournamentGameState.isTourStarted) tourStarted$: Observable<boolean>;
  @Select(TournamentGameState.hasNoTour) hasNoTour$: Observable<boolean>;
  @Select(TournamentGameState.hasNoTourNotification) hasNoTourNotification$: Observable<boolean>;
  @Select(TournamentGameState.tournamentIsOver) tournamentIsOver$: Observable<boolean>;
  @Select(TournamentState.getTournament) tournament$: Observable<OnlineTournamentInterface>;
  @Select(GameState.board) board$: Observable<IGameBoard>;
  @Select(GameState.error) error$: Observable<string>;
  @Select(GameState.playerColor) playerColor$: Observable<ChessColors>;
  @Select(GameState.isMyMove) isPlayerMove$: Observable<boolean>;
  @Select(GameState.isOpponentMove) isOpponentMove$: Observable<boolean>;
  @Select(GameState.player) player$: Observable<PlayerInterface>;
  @Select(GameState.playerTimer) playerTimer$: Observable<number>;
  @Select(GameState.capturedByPlayer) _capturedByPlayer$: Observable<TFigure[]>;
  @Select(GameState.capturedByOpponent) _capturedByOpponent$: Observable<TFigure[]>;
  @Select(GameState.gameResult) gameResult$: Observable<GameResult>;
  @Select(GameState.endReason) endReason$: Observable<EndReason>;
  @Select(GameState.opponent) opponent$: Observable<PlayerInterface>;
  @Select(GameState.opponentTimer) opponentTimer$: Observable<number>;
  @Select(GameState.getCheckState) isCheck$: Observable<CheckStateEnum>;
  @Select(GameState.isPlayerOfferedDraw) isPlayerOfferedDraw$: Observable<boolean>;
  @Select(GameState.isPlayerReadyToOfferDraw) isPlayerReadyToOfferDraw$: Observable<boolean>;
  @Select(GameState.opponentOfferedDraw) isOpponentOfferedDraw$: Observable<boolean>;
  @Select(GameState.getIsThreefoldRepetition) isThreefoldRepetition$: Observable<boolean>;
  @Select(GameState.isLetsPlayNotification) isLetsPlayNotification$: Observable<boolean>;
  @Select(GameState.isPlayerAnonymous) isPlayerAnonymous$: Observable<boolean>;
  @Select(GameState.force) force$: Observable<ForceInterface>;
  @Select(GameState.canCallAnArbiter) canCallAnArbiter$: Observable<boolean>;
  @Select(GameState.gameRatingMode) gameRatingMode$: Observable<GameRatingMode>;
  @Select(GameState.opponentMode) opponentMode$: Observable<OpponentModeEnum>;
  @Select(GameState.playerType) playerType$: Observable<PlayerEnum>;
  @Select(GameState.promotionPopupVisible) promotionPopupVisible$: Observable<boolean>;
  @Select(GameState.playerTimeLimitNotification) playerTimeLimitNotification$: Observable<boolean>;
  @Select(GameState.opponentTimeLimitNotification) opponentTimeLimitNotification$: Observable<boolean>;
  @Select(GameState.isBoardFlipped) boardIsFlipped$: Observable<boolean>;
  @Select(GameState.gameMenuVisible) gameMenuVisible$: Observable<boolean>;
  @Select(GameState.pgnUrl) pgnUrl$: Observable<string>;
  @Select(GameState.getUID) getUID$: Observable<string>;
  @Select(GameState.getReplayNotification) getReplayNotification$: Observable<string>;
  @Select(GameState.getIsReplay) getIsReplay$: Observable<boolean>;
  @Select(GameState.getRematchNotification) getRematchNotfication$: Observable<string>;
  @Select(GameState.getIsRematch) getIsRematch$: Observable<boolean>;
  @Select(GameState.getRematchInvite) getRematchInvite$: Observable<string>;
  @Select(GameState.getShowChat) getShowChat$: Observable<boolean>;
  @Select(GameState.account) account$: Observable<IAccount>;
  @Select(GameState.boardId) getBoardId$: Observable<string>;
  @Select(GameState.getLastChatId) getLastChatId$: Observable<string>;
  @Select(GameState.getNewMessage) getNewMessage$: Observable<NewMessageInterface>;
  @Select(GameState.timerInitializedInMoves) timerInitializedInMoves$: Observable<boolean>;
  @Select(GameState.isSubscribedToBoard) boardSubscribed$: Observable<boolean>;
  @Select(GameState.connectionActive) connectionActive$: Observable<boolean>;
  @ViewChild('notificationsBodyResult', { static: false, read: ElementRef })
  notificationsBodyResult: ElementRef;

  GameBadgeNotificationEnum = GameBadgeNotificationEnum;
  ChessColors = ChessColors;
  private tournamentIsOver: boolean;
  private hasNoTour: boolean;
  private isLastTour: boolean;
  public showResult$ = new BehaviorSubject(false);
  public openedMenu = true;
  public capturedByPlayer$: Observable<TFigure[]> = this._capturedByPlayer$.pipe(delay(100));
  public capturedByOpponent$: Observable<TFigure[]> = this._capturedByOpponent$.pipe(delay(100));
  public _gameReady$: Observable<boolean> = this.gameReady$.pipe(delay(50));
  public _gameInProgress$: Observable<boolean> = this.gameInProgress$.pipe(
    tap((gip) => {
      if (!gip) {
      }
    }),
    switchMap((gip) => {
      if (gip) {
        return of(gip);
      } else {
        return of(gip).pipe(delay(5000));
      }
    })
  );

  public isMenuVisible$ = this.waitingOpponent$.pipe(
    withLatestFrom(this.opponentMode$),
    map(([waitingOpponent, opponentMode]) => {
      return waitingOpponent && (opponentMode === OpponentModeEnum.HUMAN || opponentMode === OpponentModeEnum.FRIEND);
    })
  );

  public isAntiCheatPopupVisible$ = new BehaviorSubject(false);
  public resultButtonsVisible$ = new BehaviorSubject(false);
  public countdownTimer$ = new BehaviorSubject(0);

  public gameReviewMode$ = this.selectedMove$.pipe(map((selectedMove) => !!selectedMove));

  public playerName$ = this.player$.pipe(
    withLatestFrom(this.isPlayerAnonymous$),
    map(([player, isPlayerAnonymous]) =>
      isPlayerAnonymous
        ? 'You'
        : player
        ? player.full_name
          ? player.full_name
          : player.nickname
          ? player.nickname
          : 'You'
        : 'You'
    )
  );

  public opponentName$ = this.opponent$.pipe(
    map((opponent) =>
      opponent
        ? opponent.full_name
          ? opponent.full_name
          : opponent.nickname
          ? opponent.nickname
          : 'Anonymous'
        : 'Anonymous'
    )
  );

  public topBadgeNotify: Observable<any> = combineLatest([
    this.isResultShown$,
    this.isCheck$,
    this.isPlayerOfferedDraw$,
    this.isPlayerReadyToOfferDraw$,
    this.isOpponentOfferedDraw$,
    this.isLetsPlayNotification$,
    this.selectedMove$,
  ]).pipe(
    withLatestFrom(
      this.endReason$,
      this.gameResult$,
      this.opponentName$,
      this.gameTranslateService.getMsgBadgeNotify()
    ),
    map(this.gameDataService.getTopBadgeNotify()),
    withLatestFrom(this.gameReviewMode$),
    mergeMap(([notify, gameReviewMode]) => {
      if (!notify) {
        return of(notify);
      }

      if (notify.notificationType === GameBadgeNotificationEnum.Action || this.innerWidth > 999 || gameReviewMode) {
        this.modalService.closeAll();
        return of(notify);
      } else {
        return merge(of(notify), of(null).pipe(delay(5000)));
      }
    })
  );

  public bottomBadgeNotify: Observable<GameBadgeNotification> = combineLatest([
    this.isResultShown$,
    this.isCheck$,
    this.isOpponentOfferedDraw$,
  ]).pipe(
    withLatestFrom(
      this.endReason$,
      this.gameResult$,
      this.isThreefoldRepetition$,
      this.gameTranslateService.getMsgBadgeNotify()
    ),
    // TODO разобраться с ошибкой в консоли
    map(this.gameDataService.getBottomBadgeNotify()),
    mergeMap((notify: GameBadgeNotification) => {
      if (!notify) {
        return of(notify);
      }

      if (notify.notificationType === GameBadgeNotificationEnum.AcceptDraw || this.innerWidth > 999) {
        return of(notify);
      } else {
        return merge(of(notify), of(null).pipe(delay(5000)));
      }
    })
  );

  public playerMaterialAdvantage$: Observable<number> = this.force$.pipe(
    withLatestFrom(this.playerColor$),
    delay(100),
    map(([force, playerColor]) => {
      const { whiteForce, blackForce } = force;
      return playerColor === ChessColors.White ? whiteForce - blackForce : blackForce - whiteForce;
    })
  );

  public opponentMaterialAdvantage$: Observable<number> = this.force$.pipe(
    withLatestFrom(this.playerColor$),
    delay(100),
    map(([force, playerColor]) => {
      const { whiteForce, blackForce } = force;
      return playerColor === ChessColors.White ? blackForce - whiteForce : whiteForce - blackForce;
    })
  );
  public isAntiCheatCameraRecording$ = combineLatest([this.isPlayerMove$, this.isOpponentMove$]).pipe(
    map(() => {
      return true;
    }),
    mergeMap(() => {
      return merge(of(true), of(false).pipe(delay(500)));
    })
  );

  public isCameraVisible$ = combineLatest([this.gameReady$, this.isAntiCheatPopupVisible$, this.gameRatingMode$]).pipe(
    map(([gameReady, antiCheatPopupVisible, gameRatingMode]) => {
      return gameReady && (antiCheatPopupVisible || gameRatingMode === GameRatingMode.FIDERATED);
    })
  );

  public isCameraShadedVisible$ = combineLatest([
    this.gameReady$,
    this.isAntiCheatPopupVisible$,
    this.gameRatingMode$,
    this.opponentMode$,
  ]).pipe(
    map(([gameReady, antiCheatPopupVisible, gameRatingMode, opponentMode]) => {
      return (
        gameReady &&
        !antiCheatPopupVisible &&
        gameRatingMode !== GameRatingMode.FIDERATED &&
        opponentMode !== OpponentModeEnum.BOT
      );
    })
  );

  /**
   * The result of the player
   * @type {Subject<OnlineTournamentStandingInterface>}
   * @memberof TournamentGamePageComponent
   */
  public standing$: Observable<OnlineTournamentStandingInterface> = combineLatest([
    this.isResultShown$.pipe(
      filter((result) => !!result && result === true)
    ),
    this.player$.pipe(
      filter((player) => !!player),
      map((player) => player.uid)
    ),
    this.tournamentId$.pipe(filter((tournamentId) => !!tournamentId)),
  ]).pipe(
    switchMap(([result, playerUID, tournamentID]) => {
      return of(true).pipe(
        switchMap((_) =>
          this.tournamentResource
            .getStandignResult(Number(tournamentID))
            .pipe(
              map(
                (standings) => standings.find((standing) => standing.player_uid === playerUID)
              )
            )
        )
      );
    }),
    untilDestroyed(this)
  );

  public _getChatID$ = combineLatest([this.getChatId$, this.currentActiveBoardId$, this.connectionActive$]).pipe(
    distinctUntilChanged(),
    switchMap(([chatID, boardId, isConnection]) => {
      if (chatID && boardId && isConnection) {
        return this.gameService.getChatID(boardId);
      }
      if (boardId && !chatID && isConnection) {
        return this.gameService.getChatID(boardId);
      } else {
        return of(null);
      }
    }),
    untilDestroyed(this)
  );

  private innerWidth = window.innerWidth;
  private toggleChat = false;
  private routeBoardId$ = this.route.params.pipe(
    untilDestroyed(this),
    map((params) => (params && params['board_id'] ? params['board_id'] : null)),
    tap((board_id) => {
      if (board_id) {
        this.tournamentLogService.setNavigatedToTournamentBoard(board_id);
        this.store.dispatch(new CancelDraw());
      }
    })
  );

  private routeBoard$: Observable<IGameBoard> = this.routeBoardId$.pipe(
    untilDestroyed(this),
    mergeMap((id) => {
      if (id) {
        return this.resource.getBoard(id).pipe(catchError(() => of(null)));
      } else {
        return of(null);
      }
    })
  );
  private token$ = this.authStore.pipe(select(selectToken));

  constructor(
    private store: Store,
    private modalService: ModalWindowsService,
    private route: ActivatedRoute,
    private router: Router,
    private resource: GameResourceService,
    private tournamentResource: OnlineTournamentResourceService,
    private tournamentService: OnlineTournamentService,
    private gameSharedService: GameSharedService,
    private audioService: ChessgroundAudioService,
    private authStore: NGRXStore<fromAuth.State>,
    private gameService: GameService,
    private tourService: TourResourceService,
    private chatService: ChatSocketService,
    private translateService: TranslateService,
    private gameTranslateService: GameTranslateService,
    private gameDataService: GameDataService,
    private cdr: ChangeDetectorRef,
    private gameResourceService: GameResourceService,
    private tournamentLogService: TournamentLogService,
    private socketConnectionService: SocketConnectionService<
      SocketBaseMessageInterface,
      SocketBaseMessageInterface>
  ) {
    this.gameService.initGameTimer();
  }

  ngOnInit() {
    this.store.dispatch(new GetTimeControls());
    this.store.dispatch(new SetPlayerColor(ChessColors.White));
    this.subToConnectionActive();
    this.subToLossSocketMessages();
    this.subToCurrentActiveBoard();
    this.subToError();
    this.subToResultShown();
    this.subToGameInProgress();
    this.subToSelectedMoveAndMenuVisible();
    this.initTournament();
    this.subsToChat();
    this.initModalNotifications();
    this.setLanguage();

    this.tournamentIsOver$.subscribe(tournamentIsOver => {
      this.tournamentIsOver = tournamentIsOver;
    });
    this.hasNoTour$.subscribe(hasNoTour => {
      this.hasNoTour = hasNoTour;
    });
    this.isLastTour$.subscribe(isLastTour => {
      this.isLastTour = isLastTour;
    });
  }

  ngOnDestroy() {
    this.gameService.destroyGameTimer$.next();

    if ((this.isLastTour && this.hasNoTour) || this.tournamentIsOver) {
      this.store.dispatch(new SetDefaultValuesAfterGame());
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = event.target.innerWidth;
  }

  public openAntiCheatPopup(): void {
    this.isAntiCheatPopupVisible$.next(true);
  }

  public closeAntiCheatPopup(): void {
    this.isAntiCheatPopupVisible$.next(false);
  }

  // open/close menu
  public openMenu(): void {
    this.openedMenu = !this.openedMenu;
    this.store.dispatch(new SetGameMenuVisible(this.openedMenu));
    this.modalService.closeAll();
    this.cdr.detectChanges();
  }

  onMouseEnter() {
    if (this.innerWidth > 999) {
      this.openedMenu = true;
      this.store.dispatch(new SetGameMenuVisible(this.openedMenu));
      this.cdr.detectChanges();
    }
  }

  onMouseLeave() {
    if (this.innerWidth > 999) {
      this.openedMenu = false;
      this.store.dispatch(new SetGameMenuVisible(this.openedMenu));
      this.cdr.detectChanges();
    }
  }

  public sendReport(): void {
    this.store.dispatch(new CallAnArbiter());
  }

  public showNotifications(): void {
    this.modalService.closeAll();
    this.showResult$.next(false);
    this.sendStatistics('Notation');
  }

  public showResult(): void {
    this.modalService.closeAll();
    this.showResult$.next(true);
    this.sendStatistics('Result');
  }

  public offerDraw(): void {
    this.store.dispatch(new Draw());
  }

  public showChat(): void {
    this.toggleChat = !this.toggleChat;
    this.store.dispatch(new SetShowChat(this.toggleChat));
    this.cdr.detectChanges();
  }

  public cancelDrawOffer(): void {
    this.modalService.closeAll();
    this.store.dispatch(new CancelDraw());
  }

  public resign(): void {
    this.modalService.closeAll();
    this.store.dispatch(new Resign());
  }

  public flipBack(): void {
    this.modalService.closeAll();
    this.store.dispatch(new FlipBoard(false));
  }

  public downloadPGN(): void {
    this.modalService.closeAll();
    this.store.dispatch(new DownloadPGN());
  }

  public prepareHowler() {
    this.audioService.prepareHowler();
  }

  private setLanguage(): void {
    this.gameTranslateService.getMyLang()
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((lang: string) => {
        this.translateService.use(lang);
      });
  }

  private sendStatistics(text): void {
    this.tournament$.pipe(first()).subscribe((tournament) => {
      window['dataLayerPush'](
        'whcTournament',
        'Tournament',
        'Game',
        text,
        tournament.title,
        '',
        tournament.id,
        tournament.status === TournamentStatus.EXPECTED
          ? 'future'
          : tournament.status === TournamentStatus.GOES
          ? 'actual'
          : 'ended'
      );
    });
  }

  private subToConnectionActive(): void {
    this.connectionActive$
      .pipe(
        skipWhile(connect => connect),
        withLatestFrom(this.boardSubscribed$, this.jwt$),
        untilDestroyed(this))
      .subscribe(([active, boardSubscribed, jwt]) => {
        if (active) {
          this.actualizeBoardStatus(boardSubscribed, jwt);
          this.store.dispatch(new SetLastConnectionActive(true));
        }
        if (!active && jwt && !this.socketConnectionService.isDisconnect) {
          this.modalService.alertConnect();
        }
      });
  }

  private subToCurrentActiveBoard(): void {
    this.currentActiveBoardId$
      .pipe(first(), withLatestFrom(this.tournamentId$))
      .subscribe(([currentActiveBoard, tournamentId]) => {
        if (!currentActiveBoard) {
          if (tournamentId) {
            this.router.navigate(['/tournament', tournamentId]);
          } else {
            this.router.navigate(['/']);
          }
        }
      });
  }

  private subToError(): void {
    this.error$
      .pipe(
        untilDestroyed(this),
        filter((v) => !!v)
      )
      .subscribe((e) => {
        this.store.dispatch(new RestartGame());
      });
  }

  private subToResultShown(): void {
    this.isResultShown$
      .pipe(withLatestFrom(this.playerType$, this.gameRatingMode$, this.isLastTour$), untilDestroyed(this))
      .subscribe(([result, playerType, gameRatingMode, isLastTour]) => {
        if (result) {
          if (playerType !== PlayerEnum.Anonymous && gameRatingMode === GameRatingMode.UNRATED) {
            this.showResult$.next(false);
            this.resultButtonsVisible$.next(false);
            return;
          }
          this.resultButtonsVisible$.next(true);
          this.showResult$.next(true);
        } else {
          this.showResult$.next(false);
        }
      });
  }

  private subToGameInProgress(): void {
    this.gameInProgress$
      .pipe(
        delay(2000), // небольшая задержка, поскольку при мгновенной отправке бек отправляет 404
        withLatestFrom(this.canCallAnArbiter$, this.opponentMode$, this.selectedTimeControl$, this.gameRatingMode$),
        untilDestroyed(this)
      )
      .subscribe(([gameInProgress, canCallAnArbitrer, opponentMode, selectedTimeControl, gameRatingMode]) => {
        if (gameInProgress && opponentMode === OpponentModeEnum.HUMAN) {
          window['dataLayerPush'](
            'wchPlay',
            'Play',
            'Find opponent success',
            this.gameSharedService.convertBoardType(selectedTimeControl.board_type),
            this.gameSharedService.convertTime(selectedTimeControl),
            this.gameSharedService.convertGameMode(gameRatingMode)
          );
        }
        if (!gameInProgress && !canCallAnArbitrer) {
          this.store.dispatch(new CallAnArbiter());
        }
      });
  }

  private subToSelectedMoveAndMenuVisible(): void {
    this.selectedMove$.pipe(untilDestroyed(this)).subscribe((selectedMove) => {
      if (selectedMove && this.notificationsBodyResult) {
        this.notificationsBodyResult.nativeElement.scrollTo(0, 31 * (selectedMove.move_number - 1));
      }
    });

    this.gameMenuVisible$.pipe(untilDestroyed(this)).subscribe((gameMenuVisible) => {
      this.openedMenu = gameMenuVisible;
      this.cdr.detectChanges();
    });
  }

  private initTournament(): void {
    combineLatest([this.routeBoardId$, this.getCurrentTourId$, this.routeBoard$, this.nextTourBoardCreated$])
      .pipe(
        distinctUntilChanged(),
        withLatestFrom(
          this.tournamentId$,
          this.timerInitializedInMoves$,
          this.readyToTourUpdate$,
          this.boardSubscribed$,
          this.jwt$
        ),
        untilDestroyed(this)
      )
      .subscribe(
        ([
           some,
           tournamentId,
           timerInitializedInMoves,
           readyToTourUpdate,
           boardSubscribed,
           jwt,
         ]) => {
          const [boardId, tourId, board, nextTourBoardCreated] = some;
          if (boardId && tourId && board && !boardSubscribed) {
            // Chat
            this.store.dispatch(new SetShowChat(false));
            this.store.dispatch(new SetDefaultNewMessage());
            this.toggleChat = false;

            if (!nextTourBoardCreated || !readyToTourUpdate) {
              if (!readyToTourUpdate && nextTourBoardCreated) {
                this.store.dispatch(new SetReadyToTourUpdate(true));
              }

              this.resource
                .getOnlineTournamentById(+tournamentId)
                .pipe(untilDestroyed(this))
                .subscribe((tournament: OnlineTournamentInterface) => {
                  this.store.dispatch(new SetTournamentInfo(tournament.title, tournament.number_of_tours));
                  this.store.dispatch(new SetSelectedRatingMode(tournament.rating_type));
                });

              this.tourService
                .getWithDefaults(tourId)
                .pipe(untilDestroyed(this))
                .subscribe((tourWithDefaults) => {
                  if (!timerInitializedInMoves) {
                    this.store.dispatch(new SetSelectedTimeControl(tourWithDefaults.tour.time_control));
                  } else {
                    this.store.dispatch(new SetTimerInitializedInMoves(false));
                  }
                  this.store.dispatch(new SetLastTourFlag(tourWithDefaults.tour.is_last));
                  this.store.dispatch(new SetCurrentTourNumber(tourWithDefaults.tour.tour_number));
                  const timerLeft = moment(tourWithDefaults.tour.datetime_of_round).diff(moment(), 'seconds');
                  this.countdownTimer$.next(timerLeft);
                  if (timerLeft <= 0) {
                    this.store.dispatch(new SetTourStarted());
                  }
                });

              const tempBoard = {
                ...board,
              };

              if (!tempBoard.moves) {
                tempBoard.moves = [];
              }

              tempBoard.id = boardId;
              tempBoard.board_id = boardId;

              this.store.dispatch(new TourReady(tempBoard));
              this.store.dispatch(new TourBoardReady(tempBoard));
              this.store.dispatch(new SetOpponentMode(OpponentModeEnum.HUMAN));

              this.tournamentLogService.loadBoardInfo(board);

              combineLatest([
                this.tournamentResource.getOnlineTournamentStandings(tournamentId),
                this.player$.pipe(filter((player) => !!player)),
                this.opponent$.pipe(filter((opponent) => !!opponent)),
              ])
                .pipe(untilDestroyed(this))
                .subscribe(([standings, player, opponent]) => {
                  standings.data.forEach((standing) => {
                    if (standing.player_uid === player.uid) {
                      this.store.dispatch(new SetTournamentPlayerInfo(standing.rank, standing.points));
                    }

                    if (standing.player_uid === opponent.uid) {
                      this.store.dispatch(new SetTournamentOpponentInfo(standing.rank, standing.points));
                    }
                  });
                });
            }
          }
        }
      );

    this.tourStarted$
      .pipe(distinctUntilChanged(), withLatestFrom(this.jwt$), untilDestroyed(this))
      .subscribe(([tourStarted, jwt]) => {
        if (tourStarted && !!jwt) {
          this.tournamentService.subscribeToTourBoard(jwt);
        }
      });
  }

  private subsToChat(): void {
    combineLatest([this._getChatID$, this.token$, this.getLastChatId$])
      .pipe(distinctUntilChanged())
      .subscribe(([chatID, jwt, lastChatID]) => {
        if (lastChatID && jwt) {
          this.chatService.unsubscribeChat(lastChatID, jwt);
        }
        if (chatID && jwt) {
          this.chatService.subscribeChat(chatID, jwt);
        }
      });

    combineLatest([
      this._getChatID$,
      this.getShowChat$.pipe(filter((i) => i === false)),
      this.account$.pipe(
        filter((i) => !!i),
        map((i) => i.id)
      ),
    ])
      .pipe(
        distinctUntilChanged(),
        switchMap(([chatID, isShow, accountID]) => {
          if (!isShow) {
            return this.chatService.messages$.pipe(
              map(({ comments }) => comments),
              filter((comments) => comments.length > 0),
              map((comments) => comments.filter((comment) => comment.chat === chatID && comment.user.id !== accountID)),
              defaultIfEmpty([])
            );
          } else {
            of([]);
          }
        })
      )
      .pipe(withLatestFrom(this.getNewMessage$))
      .subscribe(([comments, newMessage]) => {
        if (comments.length > 0) {
          if (newMessage.id !== comments[0].id) {
            this.store.dispatch(new SetNewMessage(comments[0].id, comments[0].user.id, true, false));
          }
        }
      });
  }

  private initModalNotifications(): void {
    /**
     * Close all popus message
     */
    combineLatest([this._gameReady$, this.isResultShown$, this.boardSubscribed$])
      .pipe(untilDestroyed(this))
      .subscribe(([gameReady, showResult, boardSubscribed]) => {
        if (!gameReady && !showResult && !boardSubscribed) {
          this.modalService.closeAll();
        }
      });

    this.modalService.closeAll();

    this.hasNoTourNotification$
      .pipe(
        distinctUntilChanged(),
        filter((hasNoTour) => !!hasNoTour),
        delay(100),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.modalService.alert(
          '',
          'Oops, we don\'t have an opponent for you this round. But the good news is you won this tour!'
        );
        this.store.dispatch(new SetHasNoTourNotification(false));
      });

    this.gameResourceService.getRemainingWaitOpponentSeconds()
      .pipe(
        withLatestFrom(this.translateService.get('GAME.WAITING_FOR_OPPONENT_IN_TOURNAMENT')),
        untilDestroyed(this)
      )
      .subscribe(([remainingSeconds, message]) => {
        this.modalService.alertWithCountDown(
          '',
          message,
          550,
          moment().add(remainingSeconds, 's').toISOString()
        );
      });

    this.gameInProgress$
      .pipe(
        distinctUntilChanged(),
        filter((gameInProgress) => !!gameInProgress)
      )
      .subscribe(() => {
        this.modalService.closeAll();
      });
  }

  private subToLossSocketMessages(): void {
    this.gameResourceService.getLossOfSocketMessage()
      .pipe(
        withLatestFrom(this.boardSubscribed$, this.jwt$),
        untilDestroyed(this))
      .subscribe(([_, boardSubscribed, jwt]) => {
        this.actualizeBoardStatus(boardSubscribed, jwt);
      });
  }

  private actualizeBoardStatus(boardSubscribed: boolean, jwt: string): void {
    if (boardSubscribed && jwt) {
      this.tournamentService.subscribeToTourBoard(jwt);
    } else {
      this.tournamentResource.updateTournamentStatus();
    }
  }
}
