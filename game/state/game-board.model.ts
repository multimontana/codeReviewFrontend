import { BoardStatus } from '@app/broadcast/core/board/board.model';
import { PlayerInterface } from '@app/broadcast/core/player/player.model';
import { GameMoveIterface } from '@app/modules/game/models';

export interface IGameBoard {
  id: string;
  board_id?: string;
  chat_id?: number;
  jwt: string;
  white_player: PlayerInterface;
  black_player: PlayerInterface;
  moves: GameMoveIterface[];
  status?: BoardStatus;
}
