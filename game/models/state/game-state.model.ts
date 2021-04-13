import {
  OpponentModeEnum,
  StartEnum,
  ForceInterface,
  OnlineRatingInterface,
  NewMessageInterface,
  TimeLimitWarningEnum,
  CheckStateEnum,
  GameMoveIterface,
} from '@app/modules/game/models';
import { IGameSocketMessagesHistory } from './../../state/game-socket-messages-history.model';
import { GameResult, EndReason } from './../../state/game-result-enum';
import { IGameBoard } from '@app/modules/game/state/game-board.model';
import { ChessColors } from '@app/modules/game/state/game-chess-colors.model';
import { PlayerInterface } from '@app/broadcast/core/player/player.model';
import {
  IAccount,
  IAccountGameBoardStyle,
  IAccountGameLastMove,
  IAccountLegalMove,
  IAccountRating,
  ISettingsGameAccount,
} from '@app/account/account-store/account.model';
import { BoardType, GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import { CheckmateState, TFigure } from '@app/shared/widgets/chessground/figure.model';

export interface GameStateInterface {
  waitingOpponent: boolean;
  requestOpponentUID: string;
  rating: number;
  boardId: string;
  error: string;
  jwt: string;
  uid: string;
  board: IGameBoard;
  gameReady: boolean;
  gameSuccessfullyStarted: boolean;
  playerColor: ChessColors;
  selectedMove: GameMoveIterface;
  player: PlayerInterface;
  opponent: PlayerInterface;
  isResultShown: boolean;
  gameResult: GameResult;
  endReason: EndReason;
  notification: string;
  letsPlayNotification: boolean;
  playerTimer: number;
  opponentTimer: number;
  ratingChange: number;
  opponentOfferedDraw: boolean;
  threefoldRepetition: boolean;
  playerOfferedDraw: boolean;
  playerReadyToOfferDraw: boolean;
  account: IAccount;
  accountRating: IAccountRating;
  socketMessages: IGameSocketMessagesHistory[];
  pgnUrl: string;
  lastRequestOpponentUID: string;
  pgnName: string;
  timeControls: ITimeControl[];
  timeControlsRequest: boolean;
  selectedTimeControl: ITimeControl;
  canCallAnArbiter: boolean;
  gameRatingMode: GameRatingMode;
  capturedByBlack: TFigure[];
  capturedByWhite: TFigure[];
  isCheck: boolean;
  checkmateState: CheckmateState;
  checkmateStateReview: CheckmateState;
  force: ForceInterface;
  opponentMode: OpponentModeEnum;
  lastOpponentMode: OpponentModeEnum;
  promotionPopupVisible: boolean;
  gameMenuVisible: boolean;
  zeitnotAlreadyPlayed: boolean;
  playerTimeLimitNotification: TimeLimitWarningEnum;
  opponentTimeLimitNotification: TimeLimitWarningEnum;
  boardIsFlipped: boolean;
  bugReportModalOpened: boolean;
  onlineRatings: OnlineRatingInterface[];
  startIndexOnlineRatingRange: number;
  widthOnlineRatingRange: number;
  onlineRequestFailed: boolean;
  finalTimerUpdated: boolean;
  gameSettings?: ISettingsGameAccount;
  inviteCode: string;
  isCancel: boolean;
  replayNotification: string;
  isReplay: boolean;
  isRematch: boolean; // TODO: нужно подумать куда убрать большое количество флагов...
  rematchInvite: string;
  chatId: string;
  rematchNotification: string;
  opponentUID: string;
  lastChatId: string;
  showChat: boolean;
  newMessage: NewMessageInterface;
  timerInitializedInMoves: boolean;
  quickstart: StartEnum;
  boardSubscribed: boolean;
  connectionActive: boolean; // флаг активности сокета
  lastConnectActive: boolean; // last connect active
  playerAbortedGame: boolean; // флаг того что, игрок отменил игру
  uidForLoadSavedOpponentRequest: string; // поле содержит Uid игрока для подгрузки сохранённого поиска оппонента
}
