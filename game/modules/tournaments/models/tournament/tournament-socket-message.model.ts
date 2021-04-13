import {
  TournamentBoardByViewerSubInterface,
  TournamentBoardByViewerUnsubInterface,
  TournamentOverInterface,
  TournamentStateUpdateInterface,
  TournamentResultInterface,
  TournamentViewerAddMoveInterface,
  TournamentViewGameEndInterface,
  TournamentViewGameStartedInterface
} from '@app/modules/game/modules/tournaments/models/tournament/tournament-socket-message.interface';

export type TournamentMessageType = TournamentBoardByViewerSubInterface |
  TournamentBoardByViewerUnsubInterface |
  TournamentViewerAddMoveInterface |
  TournamentViewGameStartedInterface |
  TournamentViewGameEndInterface |
  TournamentOverInterface |
  TournamentStateUpdateInterface |
  TournamentResultInterface;
