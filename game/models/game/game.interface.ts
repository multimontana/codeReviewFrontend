import { GameBadgeNotificationEnum, OpponentModeEnum, RatingModeEnum } from '@app/modules/game/models';
import { GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import { OnlinePlayerGameArchiveInterface } from '@app/modules/game/state/game-history-response.model';
import { TFigure } from '@app/shared/widgets/chessground/figure.model';

export interface TimeControlItemsInterface {
  model: ITimeControl;
  startTime: number;
  increment: number;
}

export interface CountedFigure {
  figure: TFigure;
  count: number;
}

export interface OnlinePlayerGameArchiveGroupedByMonthInterface {
  month: string;
  year: string;
  results: OnlinePlayerGameArchiveInterface[];
}

export interface LanguageInterface {
  value: string;
  viewValue: string;
}

export interface GameBadgeNotification {
  notificationType?: GameBadgeNotificationEnum;
  notification?: string;
}

export interface ForceInterface {
  whiteForce: number;
  blackForce: number;
}

export interface OnlineRatingInterface {
  rating: number;
  count: number;
}

export interface NewMessageInterface {
  id: number;
  userId: number;
  isNew: boolean;
  isChat: boolean;
  isFirst: boolean;
}

export interface GameMoveIterface {
  fen: string;
  san: string;

  // TODO hide?
  move_number: number;
  is_white_move: boolean;
  created: string;
  time_spent?: string;
  time_left?: string;
  seconds_left?: number;
  seconds_spent?: number;
}

export interface GameSavedOpponentRequestInterface {
  player_uid: string;
  time_control: number[] | ITimeControl;
  rating: GameRatingMode[];
  rating_limits: {
    lower: number;
    upper: number;
  };
  opp_mode: OpponentModeEnum;
}

