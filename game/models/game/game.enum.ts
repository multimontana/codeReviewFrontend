export enum PlayerPanelPosition {
  Top = 'Top',
  Bottom = 'Bottom',
}

export enum GamingSelectorMode {
  MainPage,
  SingleGames,
  Tournaments
}

export enum GameBadgeNotificationEnum {
  Message,
  Info,
  Action,
  AcceptDraw,
  OfferedDraw,
  ReadyToOfferDraw,
}

export enum OpponentModeEnum {
  HUMAN = 'human',
  BOT = 'bot',
  FRIEND = 'friend'
}

export enum PlayerEnum {
  Anonymous = 'anon',
  WCPlayer = 'player',
  FidePlayer = 'fide',
}

export enum StartEnum {
  Quickstart = 'quickstart',
  Computer = 'computer',
  CreateAccount = 'create_account',
  InviteFriend = 'invite_friend'
}

export enum ChatEnum {
  TOURNAMENT = 'tournament',
  GAME = 'game'
}

export enum TimeLimitWarningEnum {
  NoTimeLimitWarning,
  IdleTimeLimitWarning,
  EndGameTimeLimitWarning
}

export enum RatingModeEnum {
  WC_rapid = 'worldchess_rapid',
  WC_bullet = 'worldchess_bullet',
  WC_blitz = 'worldchess_blitz',
  FIDE_rapid = 'fide_rapid',
  FIDE_bullet = 'fide_bullet',
  FIDE_blitz = 'fide_blitz'
}

export enum CheckStateEnum {
  NoCheck,
  PlayerChecks,
  OpponentChecks
}

export enum SubmitButtonModeEnum {
  FIND_OPPONENT,
  CREATE_ACCOUNT,
  UPGRADE_NOW,
  NEED_FIDE_ID_REGISTER,
  NEED_FIDE_ID_APPROVE,
  SEARCHING,
  INVITE_FRIEND,
  CANCEL_INVITE,
}
