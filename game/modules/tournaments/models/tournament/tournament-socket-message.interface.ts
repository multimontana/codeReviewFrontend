import { SocketBaseMessageInterface } from '@app/shared/socket/socket-base-message.model';
import { BoardNotificationSocketAction, SocketType } from '@app/auth/auth.model';
import { GameMoveIterface } from '@app/modules/game/models';
import { Result } from '@app/broadcast/core/result/result.model';
import { EndReason } from '@app/modules/game/state/game-result-enum';
import { OnlineTournamentStateInterface, TournamentSocketActions } from '@app/modules/game/modules/tournaments/models';

export interface BaseTournamentMessageInterface extends SocketBaseMessageInterface {
  message_type: SocketType.BOARD_NOTIFICATION;
  action: BoardNotificationSocketAction;
  seq: number;
}

export interface TournamentBoardByViewerSubInterface extends BaseTournamentMessageInterface {
  action: BoardNotificationSocketAction.GAMING_SUBSCRIBE_VIEWER_TO_BOARD;
  board_id: string;
  seq: number;
}

export interface TournamentBoardByViewerUnsubInterface extends BaseTournamentMessageInterface {
  action: BoardNotificationSocketAction.BOARD_UNSUBSCRIBE;
  board_id: string;
  seq: number;
}

export interface TournamentViewerAddMoveInterface extends BaseTournamentMessageInterface {
  action: BoardNotificationSocketAction.GAMING_ADD_MOVE;
  move: GameMoveIterface;
  board_id: string;
  seq: number;
}

export interface TournamentViewGameStartedInterface extends BaseTournamentMessageInterface {
  action: BoardNotificationSocketAction.GAMING_GAME_STARTED;
  board_id: string;
  text: string;
  user_uid: string;
  seq: number;
}

export interface TournamentViewGameEndInterface extends BaseTournamentMessageInterface {
  action: BoardNotificationSocketAction.GAMING_GAME_END;
  board_id: string;
  user_uid: string;
  result: Result;
  reason: EndReason;
  seq: number;
}

export interface BaseTournamentStatusInterface extends SocketBaseMessageInterface {
  message_type: SocketType.TOURNAMENT_NOTIFICATION;
  action: TournamentSocketActions;
  tournament_id: number;
  seq: number;
}


export interface TournamentOverInterface extends BaseTournamentStatusInterface {
  action: TournamentSocketActions.TOURNAMENT_OVER;
  user_uid: string;
  seq: number;
}

export interface TournamentStateUpdateInterface extends BaseTournamentStatusInterface {
  action: TournamentSocketActions.TOURNAMENT_STATE_UPDATE;
  user_uid: string;
  state: OnlineTournamentStateInterface;
  seq: number;
}
export interface TournamentResultInterface extends BaseTournamentStatusInterface {
  action: TournamentSocketActions.TOURNAMENT_RESULTS_UPDATE;
  user_uid: string;
  seq: number;
}
