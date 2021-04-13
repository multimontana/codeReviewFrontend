import * as fromAuth from '../../../../../../auth/auth.reducer';
import { selectToken } from '../../../../../../auth/auth.reducer';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AddGameBoard,
  CallAnArbiter,
  CancelDraw,
  DownloadPGN,
  Draw,
  FlipBoard,
  GameBoardCreated,
  GetTimeControls,
  RejectOpponentRequest,
  Resign,
  RestartGame,
  SetCancelInvite,
  SetInviteCode,
  SetNewMessage,
  SetNotification,
  SetSelectedRatingMode,
  SetSelectedTimeControl,
  SetShowChat,
  SubscribeToBoard,
} from '../../../../state/game.actions';
import { BehaviorSubject, combineLatest, merge, Observable, of, Subject } from 'rxjs';
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
import { select, Store as NGRXStore } from '@ngrx/store';
import { Select, Store } from '@ngxs/store';
import {
  catchError,
  debounceTime,
  defaultIfEmpty,
  delay,
  distinct,
  distinctUntilChanged,
  filter,
  first,
  map,
  mergeMap,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { ChatSocketService } from '@app/broadcast/chess/chat/services/chat-socket.service';
import { ChessColors } from '@app/modules/game/state/game-chess-colors.model';
import { ChessgroundAudioService } from '@app/shared/widgets/chessground/chessground.audio.service';
import { EOppMode } from '@app/modules/game/state/online-request-response.model';
import { GameDataService } from '../../../../services/game-data.service';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { GameService } from '@app/modules/game/state/game.service';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { GameTranslateService } from '../../../../services/game-translate.service';
import { IAccount } from '@app/account/account-store/account.model';
import { IGameBoard } from '../../../../state/game-board.model';
import { PlayerInterface } from '@app/broadcast/core/player/player.model';
import { MatDialog } from '@angular/material/dialog';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { SetGameMenuVisible } from '@app/modules/game/state/game.actions';
import { TFigure } from '@app/shared/widgets/chessground/figure.model';
import { TournamentGameState } from '@app/modules/game/modules/tournaments/states/tournament.game.state';
import { TranslateService } from '@ngx-translate/core';
import { untilDestroyed } from '@app/@core';
import * as moment from 'moment';
import { truthy } from '@app/shared/helpers/rxjs-operators.helper';
import { SocketConnectionService } from '@app/auth/socket-connection.service';
import { SocketBaseMessageInterface } from '@app/shared/socket/socket-base-message.model';

@Component({
  selector: 'game-page',
  templateUrl: 'game-page.component.html',
  styleUrls: ['game-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GamePageComponent implements OnInit, OnDestroy {

  @Select(GameState.waitingOpponent) waitingOpponent$: Observable<boolean>;
  @Select(GameState.gameReady) gameReady$: Observable<boolean>;
  @Select(GameState.isResultShown) isResultShown$: Observable<boolean>;
  @Select(GameState.selectedMove) selectedMove$: Observable<GameMoveIterface>;
  @Select(GameState.gameInProgress) gameInProgress$: Observable<boolean>;
  @Select(GameState.gameSuccessfullyStarted) gameSuccessfullyStarted$: Observable<boolean>;
  @Select(GameState.timeControls) timeControls$: Observable<ITimeControl[]>;
  @Select(GameState.selectedTimeControl) selectedTimeControl$: Observable<ITimeControl>;
  @Select(GameState.boardId) boardId$: Observable<string>;
  @Select(GameState.jwt) jwt$: Observable<string>;
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
  @Select(GameState.getLastChatId) getLastChatId$: Observable<string>;
  @Select(GameState.getNewMessage) getNewMessage$: Observable<NewMessageInterface>;
  @Select((state: { GameState: { connectionActive: boolean } }) => state.GameState.connectionActive) connectionActive$: Observable<boolean>;
  @Select(TournamentGameState.tourBoardId) tourBoardId$: Observable<string>;

  @ViewChild('notificationsBodyResult', { static: false, read: ElementRef })
  notificationsBodyResult: ElementRef;

  ChessColors = ChessColors;
  GameBadgeNotificationEnum = GameBadgeNotificationEnum;
  gameReady = false;
  analyze = false;
  analyzeMobile = false;
  analyzeDesktop = false;
  boardId = null;
  protected gameId = '';
  public showResult$ = new BehaviorSubject(false);
  public openedMenu = true;
  public rivalVideo = true;
  public capturedByPlayer$: Observable<TFigure[]> = this._capturedByPlayer$.pipe(delay(100));
  public capturedByOpponent$: Observable<TFigure[]> = this._capturedByOpponent$.pipe(delay(100));
  public _gameReady$: Observable<boolean> = this.gameReady$.pipe(
    delay(50),
    withLatestFrom(this.boardId$, this.tourBoardId$),
    map(([gameReady, boardId, tourBoardId]) => {
      if (boardId !== tourBoardId) {
        return gameReady;
      }

      return false;
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

  public gameReviewMode$ = this.selectedMove$.pipe(map((selectedMove) => !!selectedMove));

  public playerName$ = this.player$.pipe(
    withLatestFrom(this.isPlayerAnonymous$),
    map(([player, isPlayerAnonymous]) =>
      isPlayerAnonymous ? 'You' : player ? (player.full_name ? player.full_name : player.nickname ? player.nickname : 'You') : 'You'
    )
  );

  public opponentName$ = this.opponent$.pipe(
    map((opponent) =>
      opponent ? (opponent.full_name ? opponent.full_name : opponent.nickname ? opponent.nickname : 'Anonymous') : 'Anonymous'
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
      this.gameTranslateService.getMsgBadgeNotify(),
    ),
    map(this.gameDataService.getTopBadgeNotify()),
    withLatestFrom(this.gameReviewMode$),
    mergeMap(([notify, gameReviewMode]) => {
      if (!notify) {
        return of(notify);
      }

      if (notify.notificationType === GameBadgeNotificationEnum.Action || this.innerWidth > 999 || gameReviewMode) {
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
    map(this.gameDataService.getBottomBadgeNotify()),
    mergeMap((notify: GameBadgeNotification) => {
      if (!notify) {
        return of(notify);
      }
      if (
        notify.notificationType === GameBadgeNotificationEnum.AcceptDraw ||
        (this.innerWidth >= 999 || this.innerWidth <= 999)
      ) {
        if (notify.notificationType === GameBadgeNotificationEnum.Info) {
          setTimeout(() => {
            this.analyze = true;
          },  2000);
        }
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

  public isCameraVisible$ = combineLatest([
    this.gameReady$,
    this.isAntiCheatPopupVisible$,
    this.gameRatingMode$,
  ]).pipe(
    map(([gameReady, antiCheatPopupVisible, gameRatingMode]) => {
      return gameReady && (antiCheatPopupVisible || gameRatingMode === GameRatingMode.FIDERATED);
    })
  );

  public isCameraShadedVisible$ = combineLatest([
    this.gameReady$,
    this.isAntiCheatPopupVisible$,
    this.gameRatingMode$,
    this.opponentMode$,
  ])
    .pipe(
      map(([gameReady, antiCheatPopupVisible, gameRatingMode, opponentMode]) => {
        return gameReady && !antiCheatPopupVisible && gameRatingMode !== GameRatingMode.FIDERATED && opponentMode !== OpponentModeEnum.BOT;
      })
    );

  public getChatID$ = combineLatest([this.boardId$, this._gameReady$]).pipe(
    filter(([boardId, ready]) => Boolean(ready && boardId)),
    mergeMap(([boardId, ready]) => {
      if (ready !== this.gameReady && boardId !== this.boardId) {
        this.gameReady = ready;
        this.boardId = boardId;
        return this.gameService.getChatID(boardId);
      } else {
        return of(null);
      }
    })
  );

  private routeBoardId$ = this.route.params.pipe(
    untilDestroyed(this),
    map((params) => (params && params['board_id'] ? params['board_id'] : null))
  );

  private routeInviteId$ = this.route.params.pipe(
    untilDestroyed(this),
    map((params) => (params && params['invite_code'] ? params['invite_code'] : null))
  );

  private routeOppMode$ = this.route.params.pipe(
    untilDestroyed(this),
    map((params) => (params && params['opp_mode'] ? params['opp_mode'] : null))
  );

  private routeInvite$: Observable<any> = combineLatest([
    this.routeInviteId$.pipe(filter((invite) => !!invite)),
    this.getUID$.pipe(
      filter((uid) => !!uid),
      distinct()
    ),
    this.routeOppMode$,
  ]).pipe(
    // TODO: костыль для отправки запроса на подключение по инвайту после подключения к сокетам
    delay(1000),
    untilDestroyed(this),
    mergeMap(([invite, uid, oppMode]) => {
      if (invite) {
        return this.resource.requestInvite(invite, uid, oppMode ? oppMode : EOppMode.FRIEND).pipe(catchError(() => of(null)));
      } else {
        return of(null);
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

  private _gameState$: Subject<GameStateInterface> = new Subject();
  private token$ = this.authStore.pipe(select(selectToken));
  private innerWidth = window.innerWidth;
  private toggleChat = false;

  constructor(
    private store: Store,
    private modalService: ModalWindowsService,
    private route: ActivatedRoute,
    private router: Router,
    private resource: GameResourceService,
    private gameSharedService: GameSharedService,
    private dialog: MatDialog,
    private audioService: ChessgroundAudioService,
    private gameService: GameService,
    private authStore: NGRXStore<fromAuth.State>,
    private chatService: ChatSocketService,
    private gameTranslateService: GameTranslateService,
    private translateService: TranslateService,
    private gameDataService: GameDataService,
    private cdr: ChangeDetectorRef,
    private socketConnectionService: SocketConnectionService<
      SocketBaseMessageInterface,
      SocketBaseMessageInterface>
  ) {
    this.gameService.initGameTimer();
    this.initGameRoutes();
  }

  public getGameId(): void {
    const id = window.location.pathname.split('/');
    this.gameId = id[2];
  }

  ngOnInit() {
    if (window.innerWidth < 1000) {
      this.analyzeDesktop = false;
      this.analyzeMobile = true;
    } else {
      this.analyzeDesktop = true;
      this.analyzeMobile = false;
    }
    this.getGameId();
    this.store.dispatch(new GetTimeControls());
    this.setLanguage();
    this.subToConnectionActive();
    this.subToResultShown();
    this.subToGameInProgress();
    this.subToSelectedMoveAndMenuVisible();
    this.subToRouteInvite();
    this.subsToChat();
    this.subToRemainingWaitOpponent();
    this.subToLossSocketMessages();
    this.subToGameSuccessfullyStarted();
  }

  ngOnDestroy() {
    this.gameService.destroyGameTimer$.next();
    this.boardId$
      .pipe(
        withLatestFrom(this.waitingOpponent$),
        first())
      .subscribe(([boardId, waitingOpponent]) => {
        if (waitingOpponent && !boardId) {
          this.store.dispatch(new RejectOpponentRequest());
        }
      });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = event.target.innerWidth;
    if (event.target.innerWidth < 1000) {
      this.analyzeDesktop = false;
      this.analyzeMobile = true;
    } else {
      this.analyzeMobile = false;
      this.analyzeDesktop = true;
    }
    this.cdr.detectChanges();
  }

  public cancelReplayGame() {
    this.gameService.cancelRematch();
  }

  public replayGame() {
    this.gameService.rematch();
  }

  public isReplay() {
    return this.gameService.isEnd();
  }

  public openAntiCheatPopup() {
    this.isAntiCheatPopupVisible$.next(true);
  }

  public closeAntiCheatPopup() {
    this.isAntiCheatPopupVisible$.next(false);
  }

  // open/close menu
  public openMenu() {
    this.openedMenu = !this.openedMenu;
    this.store.dispatch(new SetGameMenuVisible(this.openedMenu));
    this.cdr.detectChanges();
  }

  public sendReport() {
    this.store.dispatch(new CallAnArbiter());
  }

  public showNotifications() {
    this.showResult$.next(false);
  }

  public showResult() {
    this.showResult$.next(true);
  }

  public offerDraw() {
    this.store.dispatch(new Draw());
  }

  public onMouseEnter() {
    if (this.innerWidth > 999) {
      this.rivalVideo = false;
      this.openedMenu = true;
      this.store.dispatch(new SetGameMenuVisible(this.openedMenu));
      this.cdr.detectChanges();
    }
  }

  public onMouseLeave() {
    if (this.innerWidth > 999) {
      this.rivalVideo = true;
      this.openedMenu = false;
      this.store.dispatch(new SetGameMenuVisible(this.openedMenu));
      this.cdr.detectChanges();
    }
  }

  public showChat() {
    this.toggleChat = !this.toggleChat;
    this.store.dispatch(new SetShowChat(this.toggleChat));
    this.cdr.detectChanges();
  }

  public cancelDrawOffer() {
    this.store.dispatch(new CancelDraw());
  }

  public resign() {
    this.store.dispatch(new Resign());
  }

  public flipBack() {
    this.store.dispatch(new FlipBoard(false));
  }

  public downloadPGN(): void {
    this.store.dispatch(new DownloadPGN());
  }

  public prepareHowler() {
    this.audioService.prepareHowler();
  }

  private setLanguage() {
    this.gameTranslateService.getLanguage()
      .pipe(
        untilDestroyed(this)
      )
      .subscribe();
  }

  private subToConnectionActive() {
    this.connectionActive$
      .pipe(
        debounceTime(200),
        withLatestFrom(this.boardId$, this.gameInProgress$, this.jwt$),
        untilDestroyed(this)
      )
      .subscribe(([active, boardId, gip, jwt]) => {
        this.setLanguage();
        if (active) {
          // TODO  надо закрывать конкретный алерт про энтэрнеты
          this.modalService.closeAll();
        }
        if (active && boardId && gip && jwt) {
          this.resource.subscribeToBoard(boardId, jwt);
        }
        if (!active && boardId && jwt && !this.socketConnectionService.isDisconnect) {
          this.modalService.alertConnect();
        }
      });
  }

  private initGameRoutes(): void {
    this.store.subscribe((s) => {
      this._gameState$.next(s['GameState'] as GameStateInterface);
    });
    const state$ = this._gameState$.pipe(
      distinctUntilChanged((s1: GameStateInterface, s2: GameStateInterface) => {
        return s1.jwt === s2.jwt && s1.boardId === s2.boardId;
      })
    );
    let state = this.store.snapshot()['GameState'];
    let routerBoard = null;
    let routerBoardId = null;

    this.error$
      .pipe(
        untilDestroyed(this),
        filter((v) => !!v)
        // tap(alert),
      )
      .subscribe((e) => {
        this.store.dispatch(new RestartGame());
      });

    this.boardId$
      .pipe(untilDestroyed(this), withLatestFrom(this.routeBoardId$, this.tourBoardId$))
      .subscribe(([boardId, routeBoardId, tourBoardId]) => {
        if (!routerBoardId && boardId && boardId !== routeBoardId && boardId !== tourBoardId) {
          this.router.navigate([`/singlegames/${boardId}`]).then();
        } else if (routerBoardId && !boardId && !state.board) {
          this.router.navigate(['/singlegames/'], { replaceUrl: true }).then(() => history.back());
        }
      });

    const tick$ = new Subject();

    this.routeBoard$
      .pipe(
        untilDestroyed(this),
        withLatestFrom(this.tourBoardId$)
      )
      .subscribe(([board, tourBoardId]) => {
        const id = routerBoardId;
        const { boardId, jwt } = state;
        if (!jwt && !!id) {
          this.router.navigate(['/singlegames'], { replaceUrl: true }).then(() => history.back());
        } else if (boardId && jwt && !id && boardId !== tourBoardId) {
          this.router.navigate([`/singlegames/${boardId}`]).then();
        } else if (!boardId && !id && !!jwt) {
          this.store.dispatch(new RestartGame());
        } else if (boardId && !id) {
        } else if (!!jwt && !boardId && !!id && !!board) {
          this.store.dispatch(new GameBoardCreated(board.board_id, jwt, board.white_player.uid));
          this.store.dispatch(new AddGameBoard(board));
          this.store.dispatch(new SubscribeToBoard(jwt));
        } else if (!!boardId && !!id && !!jwt && !!board) {
          this.store.dispatch(new AddGameBoard(board));
          this.store.dispatch(new SubscribeToBoard(jwt));
        } else if (!!id && jwt && !board && !boardId) {
          this.router.navigate(['/singlegames'], { replaceUrl: true }).then(() => history.back());
        } else {
        }
      });

    state$.subscribe((_state) => {
      state = _state;
      tick$.next();
    });

    this.routeBoardId$.subscribe((_routeBoardId) => {
      routerBoardId = _routeBoardId;
      // tick$.next();
    });
    this.routeBoard$.subscribe((_routerBoard) => {
      routerBoard = _routerBoard;
      tick$.next();
    });
  }

  private subToResultShown(): void {
    this.isResultShown$
      .pipe(
        filter((v) => !!v),
        withLatestFrom(this.playerType$, this.gameRatingMode$),
        untilDestroyed(this)
      )
      .subscribe(([result, playerType, gameRatingMode]) => {
        if (playerType !== PlayerEnum.Anonymous && gameRatingMode === GameRatingMode.UNRATED) {
          this.showResult$.next(false);
          this.resultButtonsVisible$.next(false);
          return;
        }
        this.resultButtonsVisible$.next(true);
        this.showResult$.next(true);
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
    this.selectedMove$.pipe(
      untilDestroyed(this)
    ).subscribe((selectedMove) => {
      if (selectedMove && this.notificationsBodyResult) {
        this.notificationsBodyResult.nativeElement.scrollTo(0, 31 * (selectedMove.move_number - 1));
      }
    });

    this.gameMenuVisible$.pipe(untilDestroyed(this)).subscribe((gameMenuVisible) => {
      this.openedMenu = gameMenuVisible;
      this.cdr.detectChanges();
    });
  }

  private subToRouteInvite(): void {
    this.routeInvite$.subscribe((data) => {
      this.router.navigate(['/singlegames'], { skipLocationChange: false });
      this.store.dispatch(new SetCancelInvite(true));
      if (data['errorCode']) {
        this.store.dispatch(new SetNotification(`${data['errorMsg']}`));
        this.store.dispatch(new SetCancelInvite(false));
      } else {
        this.translateService.get(`MESSAGES.WELCOME_TO_GAME`).subscribe((msg) => {
          this.store.dispatch(new SetNotification(msg));
        });
        this.store.dispatch(new SetSelectedTimeControl(data['time_control'][0]));
        this.store.dispatch(new SetSelectedRatingMode(data['rating'][0]));
        this.store.dispatch(new SetInviteCode(data['opp_mode'], data['invite_code'], data['uid']));
      }
    });
  }

  private subsToChat(): void {
    combineLatest([this.getChatID$, this.token$, this._gameReady$, this.getLastChatId$])
      .pipe(distinctUntilChanged())
      .subscribe(([chatID, jwt, ready, lastChatID]) => {
        if (!ready && lastChatID && jwt) {
          this.chatService.unsubscribeChat(lastChatID, jwt);
        }
        if (ready && chatID && jwt) {
          this.chatService.subscribeChat(chatID, jwt);
        }
      });

    combineLatest([
      this.getChatID$,
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

  private subToRemainingWaitOpponent(): void {
    this.resource.getRemainingWaitOpponentSeconds()
      .pipe(
        delay(1000),
        withLatestFrom(
          this.gameSuccessfullyStarted$,
          this.translateService.get('GAME.WAITING_FOR_OPPONENT')
        ),
        untilDestroyed(this)
      )
      .subscribe(([remainingSeconds, gameStarted, message]) => {
        if (!gameStarted) {
          this.modalService.alertWithCountDown(
            '',
            message,
            550,
            moment().add(remainingSeconds, 's').toISOString()
          );
        }
      });
  }

  private subToGameSuccessfullyStarted(): void {
    this.gameSuccessfullyStarted$
      .pipe(
        truthy(),
        untilDestroyed(this))
      .subscribe(() => {
        this.modalService.closeAll();
      });
  }

  private subToLossSocketMessages(): void {
    this.resource.getLossOfSocketMessage()
      .pipe(
        withLatestFrom(this.gameInProgress$, this.boardId$, this.jwt$),
        untilDestroyed(this))
      .subscribe(([_, gameInProgress, boardId, jwt]) => {
        if (gameInProgress) {
          this.resource.subscribeToBoard(boardId, jwt);
        }
      });
  }
}
