import {
  BoardStartedInterface,
  GameAddMoveInterface,
  GameBoardCreatedInterface,
  GameBoardSubscribeInterface,
  GameCancelDrawInterface,
  GameCancelInviteInterface,
  GameDrawInterface,
  GameEndCancelWarningInterface,
  GameEndedInterface,
  GameEndWarningInterface,
  GameErrorInterface,
  GameGameAbortInterface,
  GameGameEndInterface,
  GameMovesInterface,
  GameNotificationInterface,
  GameOpponentDisconnectInterface,
  GameOpponentFoundInterface,
  GamePgnCreatedInterface,
  GamePingInterface,
  GamePongInterface,
  GameRatingChangeInterface,
  GameResignInterface,
  GameStartedInterface,
  GameTimeControlEndInterface,
  GameTimeoutEndInterface,
  GameWaitingForOpponentInterface,
  GameWarningInterface,
  IGameRematchOffered,
  PlayerBoardCreatedInterface,
  PlayerReadyInterface,
  TourBoardCreatedInterface
} from '@app/modules/game/models';

export type GameMessageType =
  GameOpponentFoundInterface |
  GameBoardSubscribeInterface |
  GameStartedInterface |
  GameAddMoveInterface |
  GameNotificationInterface |
  GameBoardCreatedInterface |
  GameTimeControlEndInterface |
  GameGameEndInterface |
  GameResignInterface |
  GameDrawInterface |
  GameCancelDrawInterface |
  GameTimeoutEndInterface |
  GameRatingChangeInterface |
  GameGameAbortInterface |
  GamePgnCreatedInterface |
  GamePingInterface |
  GamePongInterface |
  GameOpponentDisconnectInterface |
  GameMovesInterface |
  GameEndedInterface |
  GameErrorInterface |
  GameWarningInterface |
  GameEndWarningInterface |
  GameEndCancelWarningInterface |
  GameCancelInviteInterface |
  IGameRematchOffered |
  PlayerBoardCreatedInterface |
  PlayerReadyInterface |
  TourBoardCreatedInterface |
  BoardStartedInterface |
  GameWaitingForOpponentInterface;
