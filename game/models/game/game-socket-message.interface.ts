import { GameMoveIterface } from '@app/modules/game/models';
import { SocketType } from '@app/auth/auth.model';
import { GameSocketActions } from '../../state/game-socket-actions.enum';
import { SocketBaseMessageInterface } from '@app/shared/socket/socket-base-message.model';
import { IGameBoard } from '../../state/game-board.model';
import { PlayerInterface } from '@app/broadcast/core/player/player.model';
import { Result } from '@app/broadcast/core/result/result.model';
import { EndReason } from '../../state/game-result-enum';
import { IMove } from '@app/broadcast/move/move.model';

export interface BaseGameMessageInterface extends SocketBaseMessageInterface {
  message_type: SocketType.GAMING;
  action: GameSocketActions;
  seq: number;
}

export interface GameOpponentFoundInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_OPPONENT_FOUND;
  board_id: IGameBoard['id'];
  seq: number;
}

export interface GameBoardSubscribeInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_SUBSCRIBE_TO_BOARD;
  board_id: IGameBoard['id'];
  token?: string;
  text?: string;
  seq: number;
}


export interface GameStartedInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_GAME_STARTED;
  board_id: IGameBoard['id'];
  text: string;
  user_uid: string;
  seq: number;
}

export interface GameAddMoveInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_ADD_MOVE;
  move: GameMoveIterface;
  board_id: IGameBoard['id'];
  seq: number;
}

export interface GameNotificationInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_NOTIFICATION;
  message: string;
  seq: number;
}

export interface GameBoardCreatedInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_BOARD_CREATED;
  board_id: string;
  jwt: string;
  chat_id: number;
  user_uid: string;
  black_player: PlayerInterface;
  white_player: PlayerInterface;
  seq: number;
}

export interface TourBoardCreatedInterface extends BaseGameMessageInterface {
  action: GameSocketActions.TOUR_BOARD_CREATED;
  board_id: string;
  jwt: string;
  chat_id: string;
  user_uid: string;
  black_player?: PlayerInterface;
  white_player?: PlayerInterface;
  tour_id: number;
  tournament_id: number;
  is_first_tour: boolean;
  is_last_tour: boolean;
  can_play: boolean;
  seq: number;
}

export interface GameTimeControlEndInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_GAME_TIME_CONTROL_END;
  board_id: string;
  user_uid: string;
  result: Result;
  seq: number;
}

export interface GameTimeoutEndInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_GAME_TIMEOUT_END;
  board_id: string;
  user_uid: string;
  result: Result;
  seq: number;
}

export interface GameGameEndInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_GAME_END;
  board_id: string;
  user_uid: string;
  result: Result;
  reason: EndReason;
  seq: number;
}


export interface GameGameAbortInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_GAME_ABORT;
  board_id: string;
  user_uid: string;
  result?: Result;
  seq: number;
}

export interface GameCancelInviteInterface extends  BaseGameMessageInterface {
  action: GameSocketActions.CANCEL_INVITE;
  invite_code: string;
  user_uid: string;
  seq: number;
}

export interface IGameRematchOffered extends BaseGameMessageInterface {
  action: GameSocketActions.REMATCH_OFFERED;
  invite_code: string;
  seq: number;
}

export interface GameResignInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_GAMING_RESIGN;
  board_id: string;
  user_uid?: string;
  result?: Result;
  seq: number;
}

export interface GameDrawInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_DRAW_OFFER;
  board_id: string;
  threefold_repetition?: boolean;
  user_uid?: string;
  result?: Result;
  seq: number;
}

export interface GameCancelDrawInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_CANCEL_DRAW_OFFER;
  board_id: string;
  user_uid?: string;
  result?: Result;
  seq: number;
}

export interface GameRatingChangeInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_RATING_CHANGE;
  board_id: string;
  user_uid: string;
  rating_change: number;
  seq: number;
}

export interface GamePgnCreatedInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_PGN_CREATED;
  board_id: string;
  url: string;
  user_uid: string;
  pgn_download_name: string;
  seq: number;
}
export interface GamePingInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_PING;
  seq: number;
}

export interface GamePongInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_PONG;
  seq: number;
}

export interface GameOpponentDisconnectInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAME_DISCONNECT;
  seq: number;
}

export interface GameErrorInterface {
  action: GameSocketActions.GAMING_ERROR;
  text: string;
  seq: number;
  //msg: string;
}

export interface GameMovesInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_MOVES;
  moves: GameMoveIterface[];
  white_seconds_left: number;
  black_seconds_left: number;
  seq: number;
}

export interface GameEndedInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAMING_ERROR_GAME_ENDED;
  board_id: string;
  seq: number;
}

export interface GameWarningInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAME_WARNING;
  thinking_user: string;
  second_left: number;
  user_uid: string;
  seq: number;
}

export interface GameEndWarningInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAME_END_WARNING;
  recipient: string;
  seq: number;
}

export interface GameEndCancelWarningInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAME_END_CANCEL_WARNING;
  recipient: string;
  seq: number;
}

export interface PlayerBoardCreatedInterface extends BaseGameMessageInterface {
  action: GameSocketActions.PLAYER_BOARD_CREATED;
  board_id: string;
  tournament_id: string;
  tour_start: string;
  user_uid: string;
  notification_id: number;
  seq: number;
}

export interface BoardStartedInterface extends BaseGameMessageInterface {
  action: GameSocketActions.BOARD_STARTED;
  board_id: string;
  user_uid: string;
  notification_id?: number;
  jwt: string;
  seq: number;
}

export interface PlayerReadyInterface extends BaseGameMessageInterface {
  action: GameSocketActions.PLAYER_READY;
  board_id?: string;
  tournament_id?: string;
  tour_start?: string;
  user_uid?: string;
  seq: number;
}

export interface NewMoveInterface extends BaseGameMessageInterface {
  action: GameSocketActions.NEW_MOVE;
  board_id: number;
  move: IMove;
  seq: number;
}

export interface GameWaitingForOpponentInterface extends BaseGameMessageInterface {
  action: GameSocketActions.GAME_WAITING_FOR_OPPONENT;
  board_id: string;
  text: string;
  seconds_left_to_wait: number;
  seq: number;
}

