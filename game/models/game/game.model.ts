import { CheckStateEnum, GameMoveIterface } from '@app/modules/game/models';
import { EndReason, GameResult } from '@app/modules/game/state/game-result-enum';

import { GameBadgeNotificationEnum } from '@app/modules/game/models';

export interface TranslateBadgeNotificationInterface {
  key: string;
  translate: string;
}

export type GetTopBadgeNotifyType = (
  value: [Array<boolean | GameMoveIterface | CheckStateEnum>, EndReason, GameResult, string, Array<TranslateBadgeNotificationInterface>],
  index: number
) => {
  notificationType: GameBadgeNotificationEnum;
  notification: string;
};

export type GetBottomBadgeNotifyType = (
  value: [[boolean, CheckStateEnum, boolean], EndReason, GameResult, boolean, Array<TranslateBadgeNotificationInterface>],
  index: number
) => {
  notificationType: GameBadgeNotificationEnum;
  notification: string;
};
