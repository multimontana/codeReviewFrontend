import { GameStateInterface, OpponentModeEnum, ForceInterface, OnlineRatingInterface, PlayerEnum } from '@app/modules/game/models';
import { catchError, distinct, filter, take } from 'rxjs/operators';
import { AccountResourceService } from './../../../account/account-store/account-resource.service';
import { Action, NgxsOnInit, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  AbortGame,
  AddGameBoard,
  AddNewMove,
  CallAnArbiter,
  CancelDraw,
  ClearGameResult,
  ClearOnlineRequestStatus,
  DownloadPGN,
  Draw,
  FlipBoard,
  GameBoardCreated,
  GameError,
  GameReady,
  GetOnlineRatings,
  GetTimeControls,
  InitRatingRange,
  InviteCancelRequest,
  OpponentOfferADraw,
  RejectOpponentRequest,
  RejectOpponentRequestLast,
  RequestInvite,
  RequestOpponent,
  ResetQuickstartFlag,
  ResetRematch,
  Resign,
  RestartGame,
  SelectMove,
  SendBugReport,
  SetAccount,
  SetAccountRating,
  SetBoardSubscribed,
  SetBugReportModalOpened,
  SetCancelInvite,
  SetCapturedByBlack,
  SetCapturedByWhite,
  SetChatId,
  SetCheck,
  SetCheckmate,
  SetCheckmateReview,
  SetConnectionActive,
  SetDefaultNewMessage,
  SetDefaultValuesAfterGame,
  SetFlagRematch,
  SetFlagReplay,
  SetForce,
  SetGameMenuVisible,
  SetGameReady,
  SetGameResult,
  SetGameSettings,
  SetGameSuccessfullyStarted,
  SetInviteCode,
  SetLastConnectionActive,
  SetLeftExpandingRatingRange,
  SetNewMessage,
  SetNotification,
  SetOnlineRatings,
  SetOpponentMode,
  SetOpponentTimer,
  SetPgnUrl,
  SetPlayer,
  SetPlayerAbortedGame,
  SetPlayerColor,
  SetPlayerTimer,
  SetPromotionPopupVisible,
  SetQuickstartFlag,
  SetRatingChange,
  SetRematchInvite,
  SetReplayNotification,
  SetSelectedRatingMode,
  SetSelectedTimeControl,
  SetSelectedTimeControlRatingMode,
  SetShowChat,
  SetStartOnlineRatingRange,
  SetTimeControls,
  SetTimeLimitNotification,
  SetTimerInitializedInMoves,
  SetUidForLoadSavedOpponentRequest,
  SetWidthOnlineRatingRange,
  ShowGameResult,
  SocketMessage,
  SubscribeToBoard,
  TourBoardReady,
  UpdateFinalTimer,
  UpdateTourJWT
} from './game.actions';
import { ActionSource } from './action-source.enum';
import { GameResourceService } from './game.resouce.service';
import { PlayerInterface } from '@app/broadcast/core/player/player.model';
import { Result } from '@app/broadcast/core/result/result.model';
import { EndReason, GameResult } from './game-result-enum';
import { IAccount,
  IAccountGameBoardStyle,
  IAccountGameLastMove,
  IAccountLegalMove,
  IAccountRating,
} from '@app/account/account-store/account.model';
import { BoardType,
  GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import * as moment from 'moment';
import { select, Store as NgrxStore } from '@ngrx/store';
import { selectUID } from '@app/auth/auth.reducer';
import { CheckmateState, TFigure } from '@app/shared/widgets/chessground/figure.model';
import { ChessColors } from '@app/modules/game/state/game-chess-colors.model';
import * as forRoot from '@app/reducers';
import { environment } from '../../../../environments/environment';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { OnlineRequestResponseStatus } from '@app/modules/game/state/online-request-response.model';
import * as fromAccount from '@app/account/account-store/account.reducer';
import { of } from 'rxjs';
import { NewMessageInterface, RatingModeEnum, TimeLimitWarningEnum, CheckStateEnum, GameMoveIterface } from '@app/modules/game/models';
import { patch } from '@ngxs/store/operators';
import { TranslateService } from '@ngx-translate/core';
import { ChessgroundAudioService, SoundType } from '@app/shared/widgets/chessground/chessground.audio.service';

const defaultState: GameStateInterface = {
    waitingOpponent: false,
    requestOpponentUID: null,
    rating: null,
    boardId: null,
    error: null,
    jwt: window.localStorage.getItem('gaming-jwt'),
    uid: null,
    board: null,
    gameReady: false,
    gameSuccessfullyStarted: false,
    playerColor: ChessColors.White,
    selectedMove: null,
    player: null,
    opponent: null,
    isResultShown: false,
    gameResult: null,
    endReason: null,
    notification: null,
    letsPlayNotification: null,
    playerTimer: 0,
    opponentTimer: 0,
    ratingChange: null,
    opponentOfferedDraw: false,
    threefoldRepetition: false,
    playerOfferedDraw: false,
    playerReadyToOfferDraw: false,
    account: null,
    accountRating: {
      worldchess_rating: 1200,
      worldchess_bullet: 1200,
      worldchess_blitz: 1200,
      worldchess_rapid: 1200,
      fide_rating: 0,
      fide_bullet: 0,
      fide_blitz: 0,
      fide_rapid: 0,
    } as IAccountRating,
    socketMessages: [],
    pgnUrl: null,
    pgnName: null,
    timeControls: [],
    timeControlsRequest: false,
    selectedTimeControl: null,
    canCallAnArbiter: true,
    gameRatingMode: GameRatingMode.UNRATED,
    capturedByBlack: null,
    capturedByWhite: null,
    isCheck: false,
    checkmateState: CheckmateState.NoCheckmate,
    checkmateStateReview: CheckmateState.NoCheckmate,
    force: {
      whiteForce: 0,
      blackForce: 0
    },
    opponentMode: OpponentModeEnum.BOT,
    lastOpponentMode: OpponentModeEnum.BOT,
    lastRequestOpponentUID: null,
    promotionPopupVisible: false,
    gameMenuVisible: false,
    zeitnotAlreadyPlayed: false,
    playerTimeLimitNotification: TimeLimitWarningEnum.NoTimeLimitWarning,
    opponentTimeLimitNotification: TimeLimitWarningEnum.NoTimeLimitWarning,
    boardIsFlipped: false,
    bugReportModalOpened: false,
    onlineRatings: [],
    startIndexOnlineRatingRange: 0,
    widthOnlineRatingRange: 20,
    onlineRequestFailed: false,
    finalTimerUpdated: false,
    inviteCode: null,
    isCancel: false,
    replayNotification: null,
    isReplay: false,
    isRematch: false,
    rematchInvite: null,
    rematchNotification: null,
    opponentUID: null,
    chatId: null,
    lastChatId: null,
    showChat: false,
    newMessage: null,
    timerInitializedInMoves: false,
    quickstart: null,
    boardSubscribed: false,
    connectionActive: true,
    lastConnectActive: true,
    playerAbortedGame: false,
    uidForLoadSavedOpponentRequest: ''
};

const PRO_PLAN_STRIPE_ID = environment.pro_plan_stripe_id;
const FIDE_PLAN_STRIPE_ID = environment.fide_id_plan_stripe_id;
const PREMIUM_PLAN_PRODUCT = environment.premium_plan_stripe_id;

@State<GameStateInterface>({
  name: 'GameState',
  defaults: defaultState,
})
export class GameState implements NgxsOnInit {
  static isMyTurnToMove(state: GameStateInterface, isWhiteTurn) {
    return (state.playerColor === ChessColors.White && isWhiteTurn)
      || (state.playerColor === ChessColors.Black && !isWhiteTurn);
  }

  @Selector()
  static board(state: GameStateInterface) {
    return state.board;
  }

  @Selector()
  static error(state: GameStateInterface) {
    return state.error;
  }

  @Selector()
  static boardId(state: GameStateInterface) {
    return state.boardId;
  }

  @Selector()
  static jwt(state: GameStateInterface) {
    return state.jwt || window.localStorage.getItem('gaming-jwt');
  }

  @Selector()
  static getGameSettings(state: GameStateInterface) {
    if (!state.gameSettings) {
      if (state.account) {
        return {
          board_last_move_style: state.account.board_last_move_style || IAccountGameLastMove.HIGHLIGHT,
          board_legal_move_style: state.account.board_legal_move_style || IAccountLegalMove.SHOWDOTS,
          is_sound_enabled: state.account.is_sound_enabled || false,
          board_style: state.account.board_style || IAccountGameBoardStyle.STANDARD,
        };
      } else {
        return {
          board_style: IAccountGameBoardStyle.STANDARD,
          board_last_move_style: IAccountGameLastMove.HIGHLIGHT,
          board_legal_move_style: IAccountLegalMove.SHOWDOTS,
          is_sound_enabled: true,
        };
      }
    } else {
      return state.gameSettings;
    }
  }

  @Selector()
  static moves(state: GameStateInterface) {
    if (state.board) {
      return state.board.moves;
    }
  }

  @Selector()
  static lastMove(state: GameStateInterface) {
    if (state.board) {
      return state.board.moves.slice(-1).pop();
    }
  }

  @Selector()
  static playerColor(state: GameStateInterface) {
    return state.playerColor;
  }

  @Selector()
  static timerInitializedInMoves(state: GameStateInterface) {
    return state.timerInitializedInMoves;
  }

  @Selector()
  static getIsRematch(state: GameStateInterface) {
    return state.isRematch;
  }

  @Selector()
  static getQuickStart(state: GameStateInterface) {
    return state.quickstart;
  }


  @Selector()
  static isMyMove(state: GameStateInterface): boolean {
    if (!state.board || !state.gameReady || state.gameResult && state.finalTimerUpdated) {
      return false;
    }

    if (state.playerColor === ChessColors.White && state.board.moves.length === 0) {
      return true;
    }

    if (state.board.moves.length === 0) {
      return false;
    }

    const lastMove = state.board.moves.slice(-1).pop();
    return !(GameState.isMyTurnToMove(state, lastMove.is_white_move));
  }

  @Selector([GameState.isMyMove])
  static isOpponentMove(state: GameStateInterface, isMyMove): boolean {
    if (!state.board || !state.gameReady || state.gameResult  && state.finalTimerUpdated) {
      return false;
    }

    return !isMyMove;
  }

  @Selector()
  static waitingOpponent(state: GameStateInterface): boolean {
    return state.waitingOpponent;
  }

  @Selector()
  static getOpponentUID(state: GameStateInterface): string {
    return state.opponent.uid;
  }

  @Selector()
  static gameReady(state: GameStateInterface): boolean {
    return state.gameReady;
  }

  @Selector()
  static getChatId(state: GameStateInterface): string {
    return state.chatId;
  }

  @Selector()
  static selectedMove(state: GameStateInterface): GameMoveIterface {
    return state.selectedMove;
  }

  @Selector()
  static player(state: GameStateInterface): PlayerInterface {
    if (state.account && !state.player) {
      return {
        full_name: state.account.full_name,
        nickname: state.account.nickname,
        avatar: {
          full: state.account.avatar['full'],
        },
        rating: state.rating,
        fide_id: null,
        federation: null,
      } as PlayerInterface;
    }
    return state.player;
  }

  @Selector()
  static opponent(state: GameStateInterface): PlayerInterface {
    return state.opponent;
  }

  @Selector()
  static isResultShown(state: GameStateInterface): boolean {
    return state.isResultShown;
  }

  @Selector()
  static gameResult(state: GameStateInterface): GameResult {
    return state.gameResult;
  }

  @Selector()
  static endReason(state: GameStateInterface): EndReason {
    return state.endReason;
  }

  @Selector()
  static notification(state: GameStateInterface): string {
    return state.notification;
  }

  @Selector()
  static opponentOfferedDraw(state: GameStateInterface): boolean {
    return state.opponentOfferedDraw;
  }

  @Selector()
  static getIsThreefoldRepetition(state: GameStateInterface): boolean {
    return state.threefoldRepetition;
  }

  @Selector()
  static playerTimer(state: GameStateInterface): number {
    if (state.endReason === EndReason.TIME_CONTROL && state.gameResult === GameResult.LOST) {
      return 0;
    }

    return state.playerTimer;
  }

  @Selector()
  static opponentTimer(state: GameStateInterface): number {
    if (state.endReason === EndReason.TIME_CONTROL && state.gameResult === GameResult.WON) {
      return 0;
    }

    return state.opponentTimer;
  }

  @Selector()
  static ratingChange(state: GameStateInterface): number {
    return state.ratingChange;
  }

  @Selector()
  static account(state: GameStateInterface): IAccount {
    return state.account;
  }

  @Selector()
  static accountRating(state: GameStateInterface): IAccountRating {
    return state.accountRating;
  }

  @Selector()
  static gameInProgress(state: GameStateInterface): boolean {
    return state.gameReady && !state.gameResult && !state.waitingOpponent;
  }

  @Selector()
  static socketMessages(state: GameStateInterface): any[] {
    return state.socketMessages;
  }

  @Selector()
  static pgnUrl(state: GameStateInterface): string {
    return state.pgnUrl;
  }

  @Selector()
  static timeControls(state: GameStateInterface): ITimeControl[] {
    return state.timeControls;
  }

  @Selector()
  static selectedTimeControl(state: GameStateInterface): ITimeControl {
    return state.selectedTimeControl;
  }

  @Selector()
  static canCallAnArbiter(state: GameStateInterface): boolean {
    return state.canCallAnArbiter && Boolean(state.board);
  }

  @Selector()
  static capturedByPlayer(state: GameStateInterface): TFigure[] {
    if (state.playerColor === ChessColors.Black) {
      return state.capturedByBlack;
    }

    return state.capturedByWhite;
  }

  @Selector()
  static capturedByOpponent(state: GameStateInterface): TFigure[] {
    if (state.playerColor === ChessColors.Black) {
      return state.capturedByWhite;
    }

    return state.capturedByBlack;
  }

  @Selector([GameState.isMyMove])
  static getCheckState(state: GameStateInterface, isMyMove: boolean): CheckStateEnum {
    if (state.isCheck) {
      if (isMyMove) {
        return CheckStateEnum.OpponentChecks;
      }

      return CheckStateEnum.PlayerChecks;
    }
    return CheckStateEnum.NoCheck;
  }

  @Selector()
  static checkMateColor(state: GameStateInterface): ChessColors {
    if (state.checkmateState === CheckmateState.NoCheckmate) {
      return null;
    }
    return state.checkmateState === CheckmateState.BlackCheckmates
      ? ChessColors.White
      : ChessColors.Black;
  }

  @Selector()
  static checkMateColorReview(state: GameStateInterface): ChessColors {
    if (state.checkmateStateReview === CheckmateState.NoCheckmate) {
      return null;
    }
    return state.checkmateStateReview === CheckmateState.BlackCheckmates
      ? ChessColors.White
      : ChessColors.Black;
  }

  @Selector()
  static isPlayerOfferedDraw(state: GameStateInterface): boolean {
    return state.playerOfferedDraw;
  }

  @Selector()
  static isPlayerReadyToOfferDraw(state: GameStateInterface): boolean {
    return state.playerReadyToOfferDraw;
  }

  @Selector()
  static isLetsPlayNotification(state: GameStateInterface): boolean {
    return state.letsPlayNotification;
  }

  @Selector()
  static getLastChatId(state: GameStateInterface): string {
    return state.lastChatId;
  }

  @Selector()
  static isPlayerAnonymous(state: GameStateInterface): boolean {
    return !state.account;
  }

  @Selector()
  static force(state: GameStateInterface): ForceInterface {
    return state.force;
  }

  @Selector()
  static gameRatingMode(state: GameStateInterface): GameRatingMode {
    return state.gameRatingMode;
  }

  @Selector()
  static promotionPopupVisible(state: GameStateInterface): boolean {
    return state.promotionPopupVisible;
  }

  @Selector()
  static gameMenuVisible(state: GameStateInterface): boolean {
    return state.gameMenuVisible;
  }

  @Selector()
  static opponentMode(state: GameStateInterface): OpponentModeEnum {
    return state.opponentMode;
  }

  @Selector()
  static lastOpponentMode(state: GameStateInterface): OpponentModeEnum {
    return state.lastOpponentMode;
  }

  @Selector()
  static playerTimeLimitNotification(state: GameStateInterface): boolean {
    return state.playerTimeLimitNotification !== TimeLimitWarningEnum.NoTimeLimitWarning;
  }

  @Selector()
  static opponentTimeLimitNotification(state: GameStateInterface): boolean {
    return state.opponentTimeLimitNotification !== TimeLimitWarningEnum.NoTimeLimitWarning;
  }

  @Selector()
  static isBoardFlipped(state: GameStateInterface): boolean {
    return state.boardIsFlipped;
  }

  @Selector()
  static isBugReportModalOpened(state: GameStateInterface): boolean {
    return state.bugReportModalOpened;
  }

  @Selector()
  static onlineRatings(state: GameStateInterface): OnlineRatingInterface[] {
    return state.onlineRatings;
  }

  @Selector()
  static startIndexOnlineRatingRange(state: GameStateInterface): number {
    return state.startIndexOnlineRatingRange;
  }

  @Selector()
  static widthOnlineRatingRange(state: GameStateInterface): number {
    return state.widthOnlineRatingRange;
  }

  @Selector()
  static onlineRequestFailed(state: GameStateInterface): boolean {
    return state.onlineRequestFailed;
  }

  @Selector()
  static playerType(state: GameStateInterface): PlayerEnum {
    if (!state.account) {
      return PlayerEnum.Anonymous;
    }

    if (state.account.subscriptions.find(
      s => s.is_active && [FIDE_PLAN_STRIPE_ID].indexOf(s.plan.stripe_id) !== -1)
    ) {
      return PlayerEnum.FidePlayer;
    }

    return PlayerEnum.WCPlayer;
  }

  @Selector()
  static currentSelectedRating(state: GameStateInterface): number {
    if (state.selectedTimeControl) {
      switch (state.gameRatingMode) {
        case GameRatingMode.FIDERATED:
          switch (state.selectedTimeControl.board_type) {
            case BoardType.BLITZ:
              return state.accountRating && state.accountRating.fide_blitz;
            case BoardType.BULLET:
              return state.accountRating && state.accountRating.fide_bullet;
            case BoardType.RAPID:
              return state.accountRating && state.accountRating.fide_rapid;
          }
          break;
        case GameRatingMode.RATED:
        default:
          switch (state.selectedTimeControl.board_type) {
            case BoardType.BLITZ:
              return state.accountRating && state.accountRating.worldchess_blitz;
            case BoardType.BULLET:
              return state.accountRating && state.accountRating.worldchess_bullet;
            case BoardType.RAPID:
              return state.accountRating && state.accountRating.worldchess_rapid;
          }
      }
    }

    return 1200;
  }

  @Selector()
  static getInviteCode(state: GameStateInterface): string {
    return state.inviteCode;
  }

  @Selector()
  static getCancelInvite(state: GameStateInterface): boolean {
    return  state.isCancel;
  }

  @Selector()
  static getReplayNotification(state: GameStateInterface): string {
    return  state.replayNotification;
  }

  @Selector()
  static getUID(state: GameStateInterface): string {
    return state.uid;
  }

  @Selector()
  static getIsReplay(state: GameStateInterface): boolean {
    return state.isReplay;
  }

  @Selector()
  static getRematchInvite(state: GameStateInterface): string {
    return state.rematchInvite;
  }

  @Selector()
  static getRematchNotification(state: GameStateInterface): string {
    return state.rematchNotification;
  }

  @Selector()
  static getShowChat(state: GameStateInterface): boolean {
    return state.showChat;
  }

  @Selector()
  static isSubscribedToBoard(state: GameStateInterface): boolean {
    return state.boardSubscribed;
  }

  @Selector()
  static getNewMessage(state: GameStateInterface): NewMessageInterface {
    if (!state.newMessage) {
      return {
        id: 0,
        userId: 0,
        isNew: false,
        isChat: false,
        isFirst: true,
      };
    } else {
      return state.newMessage;
    }
  }

  @Selector()
  static connectionActive(state: GameStateInterface): boolean {
    return state.connectionActive;
  }

  @Selector()
  static getLastConnectionActive(state: GameStateInterface): boolean {
    return state.lastConnectActive;
  }

  @Selector()
  static uidForLoadSavedOpponentRequest(state: GameStateInterface): string {
    return state.uidForLoadSavedOpponentRequest;
  }

  @Selector()
  static gameSuccessfullyStarted(state: GameStateInterface): boolean {
    return state.gameSuccessfullyStarted;
  }

  constructor(
    private resource: GameResourceService,
    private store$: NgrxStore<forRoot.State>,
    private store: Store,
    private gameSharedService: GameSharedService,
    private accountResourceService: AccountResourceService,
    private accStore: NgrxStore<fromAccount.State>,
    private translateService: TranslateService,
    private audioService: ChessgroundAudioService,
  ) {
  }

  @Action({type: 'Set uid'})
  setUid(ctx: StateContext<GameStateInterface>, action: {uid: string}) {
    const state = ctx.getState();
    if (state.uid && state.uid === action.uid) {
      return;
    }

    this.accStore.pipe(
      select(fromAccount.selectMyAccount)
    ).subscribe(acc => {
      if (acc) {
        ctx.patchState({
          uid: action.uid,
          account: acc,
          gameSettings: {
            board_last_move_style: acc.board_last_move_style || IAccountGameLastMove.HIGHLIGHT,
            board_legal_move_style: acc.board_legal_move_style || IAccountLegalMove.SHOWDOTS,
            is_sound_enabled: acc.is_sound_enabled || false,
            board_style: acc.board_style || IAccountGameBoardStyle.STANDARD,
          }
        });
      }
    });

    ctx.patchState({
      uid: action.uid,
    });
  }

  @Action(SocketMessage)
  socketMessage(ctx: StateContext<GameStateInterface>, action: SocketMessage) {
    ctx.patchState({
      socketMessages: ctx.getState().socketMessages.concat({
        type: action.type,
        message: action.message,
        date: action.date,
      })
    });
  }

  @Action(SetShowChat)
  setShowChat(ctx: StateContext<GameStateInterface>, action: SetShowChat) {
    ctx.patchState({
      showChat: action.isShow
    });
  }

  @Action(UpdateTourJWT)
  updateTourJWT(ctx: StateContext<GameStateInterface>, action: UpdateTourJWT) {
    window.localStorage.setItem('gaming-jwt', action.jwt);
    window.localStorage.removeItem('next-tour-jwt');
    ctx.patchState({
      jwt: action.jwt
    });
  }

  @Action(AddNewMove)
  addNewMove(ctx: StateContext<GameStateInterface>, action: AddNewMove) {
    const state = ctx.getState();

    const isMyMove = GameState.isMyMove(state);
    let _patch: Partial<GameStateInterface> = {};

    if (action.move.seconds_left) {
      if (GameState.isMyTurnToMove(state, action.move.is_white_move)) {
        _patch.playerTimer = action.move.seconds_left;
      } else {
        _patch.opponentTimer = action.move.seconds_left;
      }
    }

    let lastMove: GameMoveIterface;
    if (state.board) {
      lastMove = state.board.moves
        && state.board.moves[state.board.moves.length - 1];
    }

    if (lastMove && (lastMove.fen === action.move.fen)) {
      // если ход явлется последним, то обновляем только оставшееся время
      ctx.patchState(_patch);
      return;
    }

    if (action.move.move_number === 1 && isMyMove) {
      window['dataLayerPush'](
        'wchGame',
        'Game',
        'Moves',
        this.gameSharedService.convertGameMode(state.gameRatingMode),
        null,
        null
      );
    }

    _patch = {
      ..._patch,
      board: {
        ...state.board,
        moves: [
          ...(state.board || {moves: []}).moves.filter(move => !(
            move.is_white_move === action.move.is_white_move &&
            move.san === action.move.san &&
            move.move_number === action.move.move_number
          )),
          action.move,
        ]
      },
      notification: isMyMove ? 'Opponent move!' : 'Your move!',
      letsPlayNotification: state.playerOfferedDraw && !isMyMove,
      playerOfferedDraw: isMyMove ? state.playerOfferedDraw : false,
      opponentOfferedDraw: isMyMove ? false : state.opponentOfferedDraw,
    };

    if (action.source === ActionSource.USER && state.board) {
      this.resource.addNewMove(state.board.id, action.move);
    }

    if (isMyMove && state.playerReadyToOfferDraw) {
      this.resource.callToDraw(state.board.id);
      _patch = {
        ..._patch,
        playerOfferedDraw: true,
        playerReadyToOfferDraw: false
      };
    }

    if (isMyMove && state.playerTimeLimitNotification === TimeLimitWarningEnum.IdleTimeLimitWarning) {
      _patch = {
        ..._patch,
        playerTimeLimitNotification: TimeLimitWarningEnum.NoTimeLimitWarning
      };
    } else if (!isMyMove && state.opponentTimeLimitNotification === TimeLimitWarningEnum.IdleTimeLimitWarning) {
      _patch = {
        ..._patch,
        opponentTimeLimitNotification: TimeLimitWarningEnum.NoTimeLimitWarning
      };
    }

    ctx.patchState(_patch);
  }

  @Action(AddGameBoard)
  addGameBoard(ctx: StateContext<GameStateInterface>, action: AddGameBoard) {
    const state = ctx.getState();
    if (!action.board) {
      return ctx.patchState({
        boardId: null,
        board: null,
      });
    }

    if (state.boardId !== action.board.id) {
      ctx.patchState({
        boardId: action.board.id,
      });
    }

    let player = action.board.white_player;
    let opponent = action.board.black_player;
    let playerColor = ChessColors.White;

    if (!state.uid) {
      playerColor = state.playerColor;
      if (playerColor === ChessColors.Black) {
        player = action.board.black_player;
        opponent = action.board.white_player;
      }
    } else if (action.board.black_player.uid === state.uid) {
      player = action.board.black_player;
      playerColor = ChessColors.Black;
      opponent = action.board.white_player;
    }

    ctx.patchState({
      player,
      opponent,
      playerColor,
      board: action.board,
      gameReady: true,
      waitingOpponent: false,
      isResultShown: false,
      endReason: null,
      rematchNotification: null,
      replayNotification: null,
      gameResult: null,
      opponentUID: opponent.uid
    });
  }

  @Action(TourBoardReady)
  tourReady(ctx: StateContext<GameStateInterface>, action: TourBoardReady) {
    const state = ctx.getState();
    if (!action.board) {
      return ctx.patchState({
        board: null
      });
    }

    let player = action.board.white_player;
    let opponent = action.board.black_player;
    let playerColor = ChessColors.White;

    if (!state.uid) {
      playerColor = state.playerColor;
      if (playerColor === ChessColors.Black) {
        player = action.board.black_player;
        opponent = action.board.white_player;
      }
    } else if (action.board.black_player.uid === state.uid) {
      player = action.board.black_player;
      playerColor = ChessColors.Black;
      opponent = action.board.white_player;
    }

    ctx.patchState({
      player,
      opponent,
      playerColor,
      board: action.board,
      gameReady: false,
      isCheck: false,
      checkmateState: CheckmateState.NoCheckmate,
      checkmateStateReview: CheckmateState.NoCheckmate,
      waitingOpponent: false,
      isResultShown: false,
      endReason: null,
      rematchNotification: null,
      replayNotification: null,
      gameResult: null,
      opponentUID: opponent.uid
    });
  }

  @Action(SetPlayerColor)
  setPlayerColor(ctx: StateContext<GameStateInterface>, action: SetPlayerColor) {
    ctx.patchState({
      playerColor: action.color,
    });
  }

  @Action(SetChatId)
  setChatId(ctx: StateContext<GameStateInterface>, action: SetChatId) {
    ctx.patchState({
      chatId: action.chatId,
      lastChatId: action.chatId
    });
  }

  @Action(ClearOnlineRequestStatus)
  clearOnlineRequestStatus(ctx: StateContext<GameStateInterface>, action: ClearOnlineRequestStatus) {
    ctx.patchState({
      onlineRequestFailed: false,
    });
  }

  @Action(RequestOpponent)
  requestOpponent(ctx: StateContext<GameStateInterface>, action: RequestOpponent) {
    const state = ctx.getState();
    const timeControlId = state.selectedTimeControl && state.selectedTimeControl.id || 9;
    const gameRatingMode = state.gameRatingMode;
    const opponentMode = state.opponentMode; // === OpponentMode.COMPUTER ? 'bot' : '';
    const ratingLimits = {
      lower: state.onlineRatings[state.startIndexOnlineRatingRange].rating,
      upper: state.onlineRatings[state.startIndexOnlineRatingRange + state.widthOnlineRatingRange].rating
    };
    let oppUID = null;

    if (action.oppUID) {
      oppUID = action.oppUID;
    }

    this.resource.requestOpponent(
      timeControlId, gameRatingMode, opponentMode, ratingLimits, oppUID
    ).subscribe(response => {
      ctx.patchState({
        inviteCode: response.invite_code
      });

      if (response.responseStatus === OnlineRequestResponseStatus.Success) {
        ctx.patchState({
          gameReady: false,
          waitingOpponent: true,
          isReplay: false,
          rematchInvite: null,
          endReason: null,
          requestOpponentUID: response.uid,
          lastRequestOpponentUID: response.uid,
          rating: response.rating,
        });
      }
      if (response.responseStatus === OnlineRequestResponseStatus.Fail) {
        ctx.patchState({
          waitingOpponent: false,
          onlineRequestFailed: true
        });
      }
    });
  }

  @Action(RequestInvite)
  requestInvite(ctx: StateContext<GameStateInterface>, action: RequestInvite) {
    const state = ctx.getState();
    this.resource.requestInvite(action.invite, state.uid, action.oppMode)
      .pipe(
        catchError(() => of(null))
      ).subscribe(data => {
      if ( data['errorCode']) {
        this.store.dispatch(new SetNotification(`${data['errorMsg']}`));
        this.store.dispatch(new SetCancelInvite(false));
      } else {
        if (data['opp_mode'] === OpponentModeEnum.FRIEND) {
          this.translateService.get('MESSAGES.FEW_SECONDS').pipe(take(1))
            .subscribe((msg) => this.store.dispatch(new SetNotification(msg)));
        }
        this.store.dispatch(new SetSelectedTimeControl(data['time_control'][0]));
        this.store.dispatch(new SetSelectedRatingMode(data['rating'][0]));
        this.store.dispatch(new SetInviteCode(
          data['opp_mode'],
          data['invite_code'],
          data['uid']
        ));
        }
      });
  }

  @Action(RejectOpponentRequest)
  rejectOpponentRequest(ctx: StateContext<GameStateInterface>, action: RejectOpponentRequest) {
    const state = ctx.getState();

    ctx.patchState({
      waitingOpponent: false,
      inviteCode: null
    });

    this.resource.rejectOpponentRequest(state.requestOpponentUID).subscribe();
  }

  @Action(RejectOpponentRequestLast)
  requestOpponentRequestLast(ctx: StateContext<GameStateInterface>, action: RejectOpponentRequestLast) {
    const state = ctx.getState();

    ctx.patchState({
      waitingOpponent: false,
    });
    this.resource.rejectOpponentRequest(state.lastRequestOpponentUID, state.opponentUID).subscribe();
  }

  @Action(InviteCancelRequest)
  inviteCancelRequest(ctx: StateContext<GameStateInterface>, action: InviteCancelRequest) {
    const state = ctx.getState();
    this.resource.inviteCancelRequest(
      state.rematchInvite,
      state.player.uid
    ).subscribe();
  }

  @Action(ResetRematch)
  resetRematch(ctx: StateContext<GameStateInterface>, action: ResetRematch) {
    ctx.patchState({
      isRematch: false,
      isReplay: false,
      replayNotification: null,
      rematchNotification: null,
      rematchInvite: null,
      endReason: null
    });
  }

  @Action(Resign)
  callToResign(ctx: StateContext<GameStateInterface>, action: Resign) {
    const state = ctx.getState();
    this.resource.callToResign(state.board.id);
  }

  @Action(Draw)
  callToDraw(ctx: StateContext<GameStateInterface>, action: Draw) {
    const state = ctx.getState();

    if (state.opponentOfferedDraw) {
      ctx.patchState({
        opponentOfferedDraw: false
      });
      this.resource.callToDraw(state.board.id);
    } else {
      ctx.patchState({
        playerReadyToOfferDraw: true
      });
    }
  }

  @Action(CancelDraw)
  cancelDraw(ctx: StateContext<GameStateInterface>, action: Draw) {
    const state = ctx.getState();

    if (state.playerReadyToOfferDraw) {
      ctx.patchState({
        playerReadyToOfferDraw: false
      });
    }

    if (state.playerOfferedDraw) {
      ctx.patchState({
        playerOfferedDraw: false
      });
      this.resource.cancelDrawOffer(state.board.id);
    }
  }

  @Action(GameError)
  setError(ctx: StateContext<GameStateInterface>, action: GameError) {
    ctx.patchState({
      error: action.text,
    });
  }

  @Action(OpponentOfferADraw)
  opponentOfferADraw(ctx: StateContext<GameStateInterface>, action: OpponentOfferADraw) {
    ctx.patchState({
      opponentOfferedDraw: action.offer,
      threefoldRepetition: action.threefoldRepetition
    });
  }

  @Action(GameBoardCreated)
  boardCreated(ctx: StateContext<GameStateInterface>, action: GameBoardCreated) {
    window.localStorage.setItem('gaming-jwt', action.jwt);
    const state = ctx.getState();
    if (state.isRematch && !state.waitingOpponent && state.lastOpponentMode !== OpponentModeEnum.BOT) {
      this.audioService.playSound(SoundType.call);
    }

    ctx.patchState({
      boardId: action.boardId,
      playerColor: state.uid === action.whitePlayerUid ? ChessColors.White : ChessColors.Black,
      jwt: action.jwt,
      isRematch: false,
      isReplay: false,
      endReason: null,
      inviteCode: null,
      rematchInvite: null,
      rematchNotification: null,
      replayNotification: null,
    });
  }

  @Action(SubscribeToBoard)
  subscribeToBoard(ctx: StateContext<GameStateInterface>, action: SubscribeToBoard) {
    const state = ctx.getState();
    this.resource.subscribeToBoard(state.boardId, action.jwt || state.board.jwt);
  }

  @Action(SetBoardSubscribed)
  setBoardSubscribed(ctx: StateContext<GameStateInterface>, action: SetBoardSubscribed) {
    ctx.patchState({
      boardSubscribed: action.flag
    });
  }


  @Action(GameReady)
  gameReady(ctx: StateContext<GameStateInterface>, action: GameReady) {
    ctx.patchState({
      gameReady: true,
    });
    // this.resource.startPing();
  }

  /**
   * Set flage for gameReady
   * @param ctx state
   * @param action
   */
  @Action(SetGameReady)
  setGameReady(ctx: StateContext<GameStateInterface>, action: SetGameReady) {
    ctx.patchState({
      gameReady: action.isGame
    });
  }

  @Action(SelectMove)
  selectMove(ctx: StateContext<GameStateInterface>, action: SelectMove) {
    ctx.patchState({
      selectedMove: action.move,
    });
  }

  @Action(SetPlayer)
  setPlayer(ctx: StateContext<GameStateInterface>, action: SetPlayer) {
    ctx.patchState({
      player: action.player,
    });
  }

  @Action(DownloadPGN)
  downloadPGN(ctx: StateContext<GameStateInterface>, action: DownloadPGN) {
    const state = ctx.getState();
    let pgnUrl = state.pgnUrl;
    let pgnName = state.pgnName;

    if (action.pgnUrl) {
      pgnUrl = action.pgnUrl;
    }
    if (action.pgnUrl) {
      pgnName = action.pgnName;
    }

    this.resource.getPGN(pgnUrl)
      .subscribe(x => {
        // It is necessary to create a new blob object with mime-type explicitly set
        // otherwise only Chrome works like it should
        const newBlob = new Blob([x], { type: 'application/text' });

        // IE doesn't allow using a blob object directly as link href
        // instead it is necessary to use msSaveOrOpenBlob
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(newBlob);
          return;
        }

        // For other browsers:
        // Create a link pointing to the ObjectURL containing the blob.
        const data = window.URL.createObjectURL(newBlob);

        const link = document.createElement('a');
        link.href = data;
        link.download = `PGN-${pgnUrl.split('/')[4]}.pgn`;
        if (pgnName) {
          link.download = pgnName;
        }
        // this is necessary as link.click() does not work on the latest firefox
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

        setTimeout(function () {
          // For Firefox it is necessary to delay revoking the ObjectURL
          window.URL.revokeObjectURL(data);
          link.remove();
        }, 100);
      });
  }

  @Action(RestartGame)
  restartGame(ctx: StateContext<GameStateInterface>, action: RestartGame) {
    const state = ctx.getState();
    if (state.board) {
      if (state.board.moves.length > 1) {
        this.resource.callToResign(state.board.id);
        ctx.patchState({
          isRematch: true,
        });
      } else {
        this.resource.abortGame(state.board.id, state.player.uid);
      }
    }

    ctx.dispatch(new SetDefaultValuesAfterGame());
  }

  @Action(ShowGameResult)
  showGameResult(ctx: StateContext<GameStateInterface>, action: ShowGameResult) {
    ctx.patchState({
      isResultShown: action.show,
    });
  }

  @Action(SetPlayerTimer)
  setPlayerTimer(ctx: StateContext<GameStateInterface>, action: SetPlayerTimer) {
    ctx.patchState({
      playerTimer: action.timer,
    });
  }

  @Action(SetOpponentTimer)
  setOpponentTimer(ctx: StateContext<GameStateInterface>, action: SetOpponentTimer) {
    ctx.patchState({
      opponentTimer: action.timer,
    });
  }

  @Action(InitRatingRange)
  initRatingRange(ctx: StateContext<GameStateInterface>, action: InitRatingRange) {
    const state = ctx.getState();
    const currentRating = GameState.currentSelectedRating(state);
    const startIndex = currentRating > 100 ? Math.floor((currentRating - 100) / 10) : 0;

    this.accStore.pipe(
      select(fromAccount.selectMyAccount)
    ).subscribe(accounts => {
      ctx.patchState({
        account: accounts
      });
    });

    if (!state.uidForLoadSavedOpponentRequest) {
      ctx.patchState({
        startIndexOnlineRatingRange: startIndex,
        widthOnlineRatingRange: 20
      });
    } else {
      ctx.dispatch(new SetUidForLoadSavedOpponentRequest(''));
    }
  }

  @Action(SetGameResult)
  setGameResult(ctx: StateContext<GameStateInterface>, action: SetGameResult) {
    const state = ctx.getState();
    let gameResult: GameResult;

    if (action.result === Result.WHITE_WIN) {
      gameResult = state.playerColor === ChessColors.White ? GameResult.WON : GameResult.LOST;
    }

    if (action.result === Result.BLACK_WIN) {
      gameResult = state.playerColor === ChessColors.Black ? GameResult.WON : GameResult.LOST;
    }

    if (action.result === Result.DRAW) {
      gameResult = GameResult.DRAW;
    }

    if (gameResult === GameResult.LOST && action.reason === EndReason.TIME_CONTROL) {
      ctx.patchState({
        playerTimer: 0
      });
    }

    ctx.patchState({
      gameResult,
      gameSuccessfullyStarted: false,
      boardSubscribed: false,
      endReason: action.reason,
      isRematch: false,
      isReplay: false,
      rematchNotification: null,
      replayNotification: null,
      playerOfferedDraw: false,
      opponentOfferedDraw: false,
      playerTimeLimitNotification: TimeLimitWarningEnum.NoTimeLimitWarning,
      opponentTimeLimitNotification: TimeLimitWarningEnum.NoTimeLimitWarning,
    });

    // this.resource.stopPing();
  }

  @Action(ClearGameResult)
  clearGameResult(ctx: StateContext<GameStateInterface>, action: ClearGameResult) {
    ctx.patchState({
      gameResult: null,
      endReason: null,
    });
  }

  @Action(SetNotification)
  setNotification(ctx: StateContext<GameStateInterface>, action: SetNotification) {
    ctx.patchState({
      notification: action.notification
    });
  }

  @Action(SetTimeLimitNotification)
  setTimeLimitNotification(ctx: StateContext<GameStateInterface>, action: SetTimeLimitNotification) {
    const state = ctx.getState();
    if (action.playerUid) {
      if (action.playerUid === state.opponent.uid) {
        ctx.patchState({
          opponentTimeLimitNotification: action.notification
        });
      } else {
        if (!state.zeitnotAlreadyPlayed) {
          this.audioService.playSound(SoundType.zeitnot);

          if (action.notification !== TimeLimitWarningEnum.IdleTimeLimitWarning) {
            ctx.patchState({
              zeitnotAlreadyPlayed: true,
            });
          }
        }

        ctx.patchState({
          playerTimeLimitNotification: action.notification
        });
      }
    } else {
      ctx.patchState({
        playerTimeLimitNotification: action.notification
      });
    }
  }

  @Action(SetRatingChange)
  setRatingChange(ctx: StateContext<GameStateInterface>, action: SetRatingChange) {
    const state = ctx.getState();
    let opponent = state.opponent;
    let player = state.player;

    if (state.ratingChange !== action.rating && action.boardID === state.boardId) {
      if (state.opponent.uid === action.userUID) {
        opponent = {
          ... opponent,
          rating: Number(opponent.rating) + action.rating,
        };
      }
      if (state.player.uid === action.userUID) {
        player = {
          ... player,
          rating: Number(player.rating) + action.rating,
        };
      }

      ctx.patchState({
        player,
        opponent,
        ratingChange: action.rating,
      });
    }
  }

  @Action(SetAccount)
  setAccount(ctx: StateContext<GameStateInterface>, action: SetAccount) {
    const state = ctx.getState();
    if (state.account && !action.account && state.player) {
      ctx.patchState({
        player: null,
      });
    }

    const _patch: any = {};
    if (action.account && action.account.uid) {
      _patch.uid = action.account && action.account.uid;
    }

    ctx.patchState({
      ..._patch,
      account: action.account,
      gameSettings: {
        board_last_move_style:  (action.account) ? action.account.board_last_move_style : IAccountGameLastMove.HIGHLIGHT,
        board_legal_move_style: (action.account) ? action.account.board_legal_move_style : IAccountLegalMove.SHOWDOTS,
        is_sound_enabled: (action.account) ? action.account.is_sound_enabled : false,
        board_style: (action.account) ? action.account.board_style : IAccountGameBoardStyle.STANDARD
      }
    });
  }

  @Action(SetAccountRating)
  setAccountRating(ctx: StateContext<GameStateInterface>, action: SetAccountRating) {
    ctx.patchState({
      accountRating: action.accountRating
    });
  }

  @Action(SetPgnUrl)
  setPgnUrl(ctx: StateContext<GameStateInterface>, action: SetPgnUrl) {
    const state = ctx.getState();

    if (state.board && state.board.id === action.board_id) {
      ctx.patchState({
        pgnUrl: action.pgnUrl,
        pgnName: action.pgn_download_name
      });
    }
  }

  @Action(SendBugReport)
  sendBugReport(ctx: StateContext<GameStateInterface>, action: SendBugReport) {
    const state = ctx.getState();

    const user_uid = state.player && state.player.uid;
    const boardId = state.board && state.board.id;
    const log = JSON.stringify({
      socketMessages: state.socketMessages
    });

    this.resource.sendBugReport(
      user_uid, action.report, action.email,
      action.type, boardId, log).subscribe();
  }

  @Action(GetTimeControls)
  getTimeControls(ctx: StateContext<GameStateInterface>, action: GetTimeControls) {
    if (ctx.getState() && (
      ctx.getState().timeControlsRequest
      || (ctx.getState().timeControls && ctx.getState().timeControls.length)
    )) {
      return;
    }

    this.resource.getTimerControls();
  }

  @Action(SetTimeControls)
  setTimeControls(ctx: StateContext<GameStateInterface>, action: SetTimeControls) {
    const state = ctx.getState();
    ctx.patchState({
      timeControls: action.timeControls,
      isCancel: state.isCancel,
    });
  }

  @Action(SetSelectedTimeControl)
  setSelectedTimeControl(ctx: StateContext<GameStateInterface>, action: SetSelectedTimeControl) {
    if (!action.timeControl) {
      return;
    }

    const timerInSeconds = moment(action.timeControl.start_time, 'HH:mm:ss').minutes() * 60;
    const state = ctx.getState();
    if (state.inviteCode !== '') {
      ctx.patchState({
        selectedTimeControl: action.timeControl,
        playerTimer: timerInSeconds,
        opponentTimer: timerInSeconds,
      });
    }
  }

  @Action(SetSelectedRatingMode)
  setSelectedRatingMode(ctx: StateContext<GameStateInterface>, action: SetSelectedRatingMode) {
    ctx.patchState({
      gameRatingMode: action.gameRatingMode,
    });
    ctx.dispatch(new GetOnlineRatings());
  }

  @Action(SetSelectedTimeControlRatingMode)
  setSelectedTimeControlRatingMode(ctx: StateContext<GameStateInterface>, action: SetSelectedTimeControlRatingMode) {
    if (!action.timeControl || !action.gameRatingMode) {
      return;
    }

    const timerInSeconds = moment(action.timeControl.start_time, 'HH:mm:ss').minutes() * 60;

    ctx.patchState({
      selectedTimeControl: action.timeControl,
      gameRatingMode: action.gameRatingMode,
      playerTimer: timerInSeconds,
      opponentTimer: timerInSeconds,
    });
  }

  @Action(SetOpponentMode)
  setOpponentMode(ctx: StateContext<GameStateInterface>, action: SetOpponentMode) {
    ctx.patchState({
      opponentMode: action.opponentMode,
      lastOpponentMode: action.opponentMode
    });
  }

  @Action(SetInviteCode)
  setInviteCode(ctx: StateContext<GameStateInterface>, action: SetInviteCode) {
    ctx.patchState({
      opponentMode: action.opponentMode,
      lastOpponentMode: action.opponentMode,
      inviteCode: action.inviteCode,
      waitingOpponent: true,
      requestOpponentUID: action.requestOpponentUID,
    });
  }

  @Action(CallAnArbiter)
  callAnArbiter(ctx: StateContext<GameStateInterface>, action: CallAnArbiter) {
    const state = ctx.getState();
    if (state && state.board) {
      this.resource.callAnArbiter(state.board.id, state.player.uid).subscribe();

      ctx.patchState({
        canCallAnArbiter: false
      });
    }
  }

  @Action(AbortGame)
  abortGame(ctx: StateContext<GameStateInterface>, action: AbortGame) {
    const state = ctx.getState();

    ctx.dispatch(new SetPlayerAbortedGame(true));

    this.resource.abortGame(state.board.id, state.player.uid);
  }

  @Action(SetCancelInvite)
  setCancelInvite(ctx: StateContext<GameStateInterface>, action: SetCancelInvite) {
    ctx.patchState({
      isCancel: action.isCancel
    });
  }

  @Action(SetCapturedByBlack)
  setCapturedByBlack(ctx: StateContext<GameStateInterface>, action: SetCapturedByBlack) {
    ctx.patchState({
      capturedByBlack: action.figures,
    });
  }

  @Action(SetCapturedByWhite)
  setCapturedByWhite(ctx: StateContext<GameStateInterface>, action: SetCapturedByWhite) {
    ctx.patchState({
      capturedByWhite: action.figures,
    });
  }

  @Action(SetCheck)
  setCheck(ctx: StateContext<GameStateInterface>, action: SetCheck) {
    ctx.patchState({
      isCheck: action.isCheck,
    });
  }

  @Action(SetReplayNotification)
  setReplayNotification(ctx: StateContext<GameStateInterface>, action: SetReplayNotification) {
    if (action.notification !== '') {
      ctx.patchState({
        isReplay: true
      });
    }
    ctx.patchState({
      replayNotification: action.notification
    });
  }

  @Action(SetFlagReplay)
  setFlagReplay(ctx: StateContext<GameStateInterface>, action: SetFlagReplay) {
    ctx.patchState({
      isReplay: action.isReplay
    });
  }

  @Action(SetFlagRematch)
  setFlagRematch(ctx: StateContext<GameStateInterface>, action: SetFlagRematch) {
    ctx.patchState({
      isRematch: action.isRematch
    });
  }

  @Action(SetRematchInvite)
  setRematchInvite(ctx: StateContext<GameStateInterface>, action: SetRematchInvite) {
    const state = ctx.getState();
    ctx.patchState({
      rematchInvite: action.rematchInvite,
      rematchNotification: action.rematchNotification, //`${state.opponent.full_name} offers to play again`,
      isRematch: false,
    });
  }

  @Action(SetCheckmate)
  setCheckmate(ctx: StateContext<GameStateInterface>, action: SetCheckmate) {
    ctx.patchState({
      checkmateState: action.checkmateState,
    });
  }

  @Action(SetCheckmateReview)
  setCheckmateReview(ctx: StateContext<GameStateInterface>, action: SetCheckmateReview) {
    ctx.patchState({
      checkmateStateReview: action.checkmateState,
    });
  }

  @Action(SetForce)
  setForce(ctx: StateContext<GameStateInterface>, action: SetForce) {
    ctx.patchState({
      force: {
        whiteForce: action.whiteForce,
        blackForce: action.blackForce,
      },
    });
  }

  @Action(SetPromotionPopupVisible)
  setPromotionPopupVisible(ctx: StateContext<GameStateInterface>, action: SetPromotionPopupVisible) {
    ctx.patchState({
      promotionPopupVisible: action.promotionPopupVisibile
    });
  }

  @Action(SetGameMenuVisible)
  setGameMenuVisible(ctx: StateContext<GameStateInterface>, action: SetGameMenuVisible) {
    ctx.patchState({
      gameMenuVisible: action.gameMenuVisibile
    });
  }

  @Action(SetGameSettings)
  setGameSettings(ctx: StateContext<GameStateInterface>, action: SetGameSettings) {
    const state = ctx.getState();
    if (state.account) {
      this.accountResourceService.updateProfile({
        board_last_move_style: action.board_last_move_style || IAccountGameLastMove.HIGHLIGHT,
        board_legal_move_style: action.board_legal_move_style || IAccountLegalMove.SHOWDOTS,
        is_sound_enabled: action.is_sound_enabled || false,
        board_style: action.board_style || IAccountGameBoardStyle.STANDARD,
      }).subscribe(data => {
        ctx.patchState({
          account: {
            ...state.account,
            board_last_move_style: data['board_last_move_style'],
            board_legal_move_style: data['board_legal_move_style'],
            is_sound_enabled: data['is_sound_enabled'] || false,
            board_style: data['board_style'] || IAccountGameBoardStyle.STANDARD,
          },
          gameSettings: {
            board_last_move_style: data['board_last_move_style'],
            board_legal_move_style: data['board_legal_move_style'],
            is_sound_enabled: data['is_sound_enabled'] || false,
            board_style: data['board_style'] || IAccountGameBoardStyle.STANDARD,
          }
        });
      });
    }
    ctx.patchState({
      gameSettings: {
        board_last_move_style: action.board_last_move_style || IAccountGameLastMove.HIGHLIGHT,
        board_legal_move_style: action.board_legal_move_style || IAccountLegalMove.SHOWDOTS,
        is_sound_enabled: action.is_sound_enabled || false,
        board_style: action.board_style || IAccountGameBoardStyle.STANDARD,
      }
    });
  }

  @Action(FlipBoard)
  flipBoard(ctx: StateContext<GameStateInterface>, action: FlipBoard) {
    ctx.patchState({
      boardIsFlipped: action.boardIsFlipped
    });
  }

  @Action(SetBugReportModalOpened)
  setBugReportModalOpened(ctx: StateContext<GameStateInterface>, action: SetBugReportModalOpened) {
    ctx.patchState({
      bugReportModalOpened: action.bugReportModalOpened
    });
  }

  @Action(UpdateFinalTimer)
  updateFinalTimer(ctx: StateContext<GameStateInterface>, action: UpdateFinalTimer) {
    ctx.patchState({
      finalTimerUpdated: true
    });
  }

  @Action(SetStartOnlineRatingRange)
  setStartOnlineRatingRange(ctx: StateContext<GameStateInterface>, action: SetStartOnlineRatingRange) {
    console.log('action ====>', action);
    ctx.patchState({
      startIndexOnlineRatingRange: action.index
    });
  }

  @Action(SetWidthOnlineRatingRange)
  setWidthOnlineRatingRange(ctx: StateContext<GameStateInterface>, action: SetWidthOnlineRatingRange) {
    ctx.patchState({
      widthOnlineRatingRange: action.width
    });
  }

  @Action(SetLeftExpandingRatingRange)
  setLeftExpandingRatingRange(ctx: StateContext<GameStateInterface>, action: SetLeftExpandingRatingRange) {
    const state = ctx.getState();
    const diff = state.startIndexOnlineRatingRange - action.index;
    ctx.patchState({
      startIndexOnlineRatingRange: action.index,
      widthOnlineRatingRange: state.widthOnlineRatingRange + diff
    });
  }

  @Action(SetOnlineRatings)
  setOnlineRatings(ctx: StateContext<GameStateInterface>, action: SetOnlineRatings) {
    const onlineRatings = [];
    let currentRatingsValue = action.onlineRatings ? action.onlineRatings[0].rating : null;
    let currentRatingsIndex = 0;
    for (let i = 0; i <= 3000; i += 10) {
      let count = 0;
      if (currentRatingsValue === i) {
        count = action.onlineRatings[currentRatingsIndex].count;
        currentRatingsIndex++;
        currentRatingsValue = currentRatingsIndex < action.onlineRatings.length
          ? action.onlineRatings[currentRatingsIndex].rating
          : null;
      }

      onlineRatings.push({
        rating: i,
        count
      });
    }

    ctx.patchState({ onlineRatings });
  }

  @Action(GetOnlineRatings)
  getOnlineRatings(ctx: StateContext<GameStateInterface>, action: GetOnlineRatings) {
    const state = ctx.getState();
    let ratingMode: RatingModeEnum;

    if (state.selectedTimeControl) {
      switch (state.gameRatingMode) {
        case GameRatingMode.FIDERATED:
          switch (state.selectedTimeControl.board_type) {
            case BoardType.BLITZ:
              ratingMode = RatingModeEnum.FIDE_blitz;
              break;
            case BoardType.BULLET:
              ratingMode = RatingModeEnum.FIDE_bullet;
              break;
            case BoardType.RAPID:
              ratingMode = RatingModeEnum.FIDE_rapid;
              break;
          }
          break;
        case GameRatingMode.RATED:
        default:
          switch (state.selectedTimeControl.board_type) {
            case BoardType.BLITZ:
              ratingMode = RatingModeEnum.WC_blitz;
              break;
            case BoardType.BULLET:
              ratingMode = RatingModeEnum.WC_bullet;
              break;
            case BoardType.RAPID:
              ratingMode = RatingModeEnum.WC_rapid;
              break;
          }
          break;
      }
      if (ratingMode) {
        this.resource.getOnlineRatings(ratingMode);
      }
    }
  }

  @Action(SetNewMessage)
  setNewMessage(ctx: StateContext<GameStateInterface>, action: SetNewMessage) {
    ctx.patchState({
      newMessage: {
          id: action.id,
          userId: action.userId,
          isNew: action.isNew,
          isChat: action.isChat,
          isFirst: action.isFirst || false
      }
    });
  }

  @Action(SetDefaultNewMessage)
  setDefaultNewMessage(ctx: StateContext<GameStateInterface>, action: SetDefaultNewMessage) {
    ctx.patchState({
      newMessage: {
        id: 0,
        userId: 0,
        isNew: false,
        isChat: false,
        isFirst: true,
      }
    });
  }

  @Action(SetTimerInitializedInMoves)
  setTimerInitializedInMoves(ctx: StateContext<GameStateInterface>, action: SetTimerInitializedInMoves) {
    ctx.patchState({
     timerInitializedInMoves: action.flag
    });
  }

  @Action(SetQuickstartFlag)
  setQuickstartFlag(ctx: StateContext<GameStateInterface>, action: SetQuickstartFlag) {
    ctx.patchState({
      quickstart: action.startType
    });
  }

  @Action(ResetQuickstartFlag)
  resetQuickstartFlag(ctx: StateContext<GameStateInterface>, action: ResetQuickstartFlag) {
    ctx.patchState({
      quickstart: null
    });
  }

  @Action(SetConnectionActive)
  setConnectionActive(ctx: StateContext<GameStateInterface>, action: SetConnectionActive) {
    const _connectionActive = ctx.getState().connectionActive;
    ctx.setState(
      patch({
        lastConnectActive: _connectionActive,
        connectionActive: action.flag
      })
    );
  }

  @Action(SetLastConnectionActive)
  setLastConnectionActive(ctx: StateContext<GameStateInterface>, action: SetConnectionActive) {
    ctx.setState(
      patch({
        lastConnectActive: action.flag,
      })
    );
  }

  @Action(SetDefaultValuesAfterGame)
  setDefaultValuesAfterGame(ctx: StateContext<GameStateInterface>, action: SetDefaultValuesAfterGame) {
    const state = ctx.getState();
    window.localStorage.removeItem('gaming-jwt');
    ctx.setState({
      ... defaultState,
      jwt: null,
      uid: state.uid,
      opponentMode: OpponentModeEnum.HUMAN,
      lastOpponentMode: state.lastOpponentMode,
      lastRequestOpponentUID: state.lastRequestOpponentUID,
      account: state.account,
      timeControls: state.timeControls,
      accountRating: state.accountRating,
      onlineRatings: state.onlineRatings,
      startIndexOnlineRatingRange: state.startIndexOnlineRatingRange,
      widthOnlineRatingRange: state.widthOnlineRatingRange,
      replayNotification: state.replayNotification,
      rematchNotification: state.rematchNotification,
      isRematch: state.isRematch,
      opponentUID: state.opponentUID,
      lastChatId: state.lastChatId
    });
    if (state.account) {
      ctx.setState({
        ...ctx.getState(),
        gameSettings: {
          board_last_move_style: state.account.board_last_move_style,
          board_legal_move_style: state.account.board_legal_move_style,
          board_style: state.account.board_style,
          is_sound_enabled: state.account.is_sound_enabled,
        }
      });
    }
    ctx.dispatch(new SetSelectedTimeControl(state.selectedTimeControl));
    ctx.dispatch(new SetSelectedRatingMode(state.gameRatingMode));
  }

  @Action(SetPlayerAbortedGame)
  setPlayerAbortedGame(ctx: StateContext<GameStateInterface>, action: SetPlayerAbortedGame) {
    ctx.patchState({
      playerAbortedGame: action.flag,
    });
  }

  @Action(SetUidForLoadSavedOpponentRequest)
  setUidForLoadSavedOpponentRequest(ctx: StateContext<GameStateInterface>, action: SetUidForLoadSavedOpponentRequest) {
    ctx.patchState({
      uidForLoadSavedOpponentRequest: action.uid,
    });
  }

  @Action(SetGameSuccessfullyStarted)
  setGameSuccessfullyStarted(ctx: StateContext<GameStateInterface>, action: SetGameSuccessfullyStarted) {
    ctx.patchState({
      gameSuccessfullyStarted: action.flag
    });
  }

  ngxsOnInit(ctx?: StateContext<GameStateInterface>): void | any {
    this.store.dispatch(new InitRatingRange());
    this.store$.select(selectUID)
      .pipe(
        filter(uid => !!uid),
        distinct()
      )
      .subscribe(uid => {
        // TODO Action
        this.store.dispatch({
          uid,
          type: 'Set uid',
        });
      });
    return;
  }
}
