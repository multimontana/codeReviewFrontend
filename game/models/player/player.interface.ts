export interface PlayerInterface {
  full_name?: string;
  nickname?: string;
  rating?: number;
  avatar?: {
    full?: string;
  }
  nationality_id?: number;
  fide_id?: number;
  rank?: string;
  uid?: string;
}

export interface BarItemInterface {
  boardId?: string;
  white_player?:PlayerInterface;
  black_player?:PlayerInterface;
  result?: number;
  player_status?: string;
}
