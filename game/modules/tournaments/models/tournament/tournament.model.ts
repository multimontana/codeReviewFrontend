import { BoardResult, BoardStatus } from '@app/broadcast/core/board/board.model';
import { GameRatingMode, ITimeControl, TourInterface, ITourMoves } from '@app/broadcast/core/tour/tour.model';
import {
  IOnlineTournamentTeamPlayer,
  TournamentResourceType,
  TournamentStatus,
  TournamentType
} from '@app/broadcast/core/tournament/tournament.model';

import { IDefaultEntities } from '@app/broadcast/core/models/default-entities';
import { PlayerInterface } from '@app/broadcast/core/player/player.model';
import { Moment } from 'moment';
import { OnlineTournamentUnavailabilityReasonEnum, UpdateMeEnum } from '@app/modules/game/modules/tournaments/models';

export interface PointsPerBoardInterface {
  board_uid: string;
  points: number;
}

export interface OnlineTournamentResponseInterface {
  count: number;
  next: string;
  previous: string;
  results: OnlineTournamentInterface[];
}

export interface OnlineTournamentBoardInterface {
  board_id: string;
  white_id: number;
  white_uid: string;
  white_fide_id: number | null;
  white_rating: number | null;
  white_is_bot: boolean;
  black_id: number;
  black_uid: string;
  black_fide_id: number;
  black_rating: number;
  start_time_in_seconds: number;
  black_is_bot: boolean;
  time_control: ITimeControl;
  tour_id: number;
  tour_desk_number?: number;
  tournament_id: number;
  moves: ITourMoves[];
  result?: BoardResult;
  status: BoardStatus;
  white_player?: PlayerInterface;
  black_player?: PlayerInterface;
  black_seconds_left: number | null;
  white_seconds_left: number | null;
  desk_number?: number;
  created?: string;
  finished_at?: string | null;
  last_move?: ITourMoves;
  expand?: boolean;
}

export interface OnlineTournamentBoardsInterface {
  count: number;
  next: string | null;
  previous: string | null;
  results: OnlineTournamentBoardInterface[];
}

export interface OnlineTournamentInterface {
  id?: number;
  title?: string;
  additional_title?: string;
  slug?: string;
  location?: string;
  datetime_of_tournament?: string;
  datetime_of_finish?: string;
  tournament_type?: TournamentType;
  broadcast_type?: number;
  event?: number;
  prize_fund?: number;
  prize_fund_currency?: string;
  status?: TournamentStatus;
  image?: string;
  sharing_fb?: LinkInterface;
  sharing_tw?: LinkInterface;
  about?: string;
  press?: string;
  contacts?: string;
  product?: string;
  organized_by?: string;
  players_amount?: number;
  signup_datetime?: BoundsInterface;
  user_signed?: boolean;
  available?: boolean;
  players_rating_minimum?: number;
  players_rating_maximum?: number;
  promoted?: boolean;
  time_control?: ITimeControl;
  signed_up_amount?: number;
  country?: number;
  rating_type?: GameRatingMode;
  number_of_tours?: number;
  resourcetype?: TournamentResourceType;
  defaults?: IDefaultEntities;
  signup_start_datetime?: string;
  signup_end_datetime?: string;
  signup_opened?: boolean;
  move_time_limit?: number;
  faq_text?: string;
  similar_tournaments?: any;
  tournament_online_players?: IOnlineTournamentTeamPlayer[];
  in_overlapped_tournament?: boolean;
  sponsor?: string;
  sponsor_title?: string;
  unavailability_reason?: OnlineTournamentUnavailabilityReasonEnum;
  unsigned_amount?: number;
  current_tour_number?: number | null;
}

export interface OnlineTournamentSortedInterface {
  id?: number;
  title?: string;
  additional_title?: string;
  slug?: string;
  location?: string;
  datetime_of_tournament?: string;
  datetime_of_finish?: string;
  comparable_datetime_of_finish?: string;
  tournament_type?: TournamentType;
  broadcast_type?: number;
  event?: number;
  prize_fund?: number;
  prize_fund_currency?: string;
  status?: number;
  image?: string;
  sharing_fb?: LinkInterface;
  sharing_tw?: LinkInterface;
  about?: string;
  press?: string;
  contacts?: string;
  product?: string;
  organized_by?: string;
  players_amount?: number;
  signup_datetime?: BoundsInterface;
  user_signed?: boolean;
  available?: boolean;
  players_rating_minimum?: number;
  players_rating_maximum?: number;
  promoted?: boolean;
  time_control?: ITimeControl;
  signed_up_amount?: number;
  country?: number;
  rating_type?: GameRatingMode;
  momentTime?: Moment;
}

export interface LinkInterface {
  full: string;
}

export interface BoundsInterface {
  lower: string;
  upper: string;
  bounds: string;
}

export interface OnlineTournamentStandingInterface {
  avatar?: string;
  rank?: number;
  full_name?: string;
  rating?: number;
  age?: number;
  nationality_id?: number;
  player_uid?: string;
  player_id: number;
  points?: number;
  points_per_board?: PointsPerBoardInterface[];
  has_left?: boolean;
}

export interface OnlineTournamentStandingsInterface {
  count: number;
  data: OnlineTournamentStandingInterface[];
}

export interface OnlineTournamentStateInterface {
  id?: number;
  datetime_of_tournament?: string;
  status?: TournamentStatus;
  signup_start_datetime?: string;
  signup_end_datetime?: string;
  signup_opened?: boolean;
  signed_up_amount?: number;
  current_tour_number?: number | null;
}

export interface OnlineTournamentWidenStandingsInterface {
  player: IOnlineTournamentTeamPlayer;
  player_uid?: string;
  points?: number;
  points_per_board?: PointsPerBoardInterface[];
  rank?: number;
  rating?: number;
}

export interface ReadyResponseInterface {
  id: number;
  white_player: PlayerInterface;
  black_player: PlayerInterface;
  agreement: null;
  desk_number: number;
  date_of_board: string;
  white_player_name: string;
  black_player_name: string;
  status: number;
  player_status: string;
  result: string;
  end_time: string;
  last_notification: string;
  tour: number;
  match: string;
  pgn_file: string;
}

export interface OnlineTournmanetWidgetTimeBoardInterface {
  blackTime?: string;
  whiteTime?: string;
}

export interface UpdateMeResponseInterface {
  status: UpdateMeEnum;
  tournament_id: number;
  tour_id: number;
  board_uid: string;
  jwt: string;
  uid: string;
  chat_id: string;
  is_last_tour: boolean;
  is_first_tour: boolean;
}

export interface TournamentStateInterface {
  chatBoardId?: string;
  tournamentID: number;
  currentTourID: number;
  tours: TourInterface[];
  tournament: OnlineTournamentInterface;
  boards: OnlineTournamentBoardInterface[];
  standings: OnlineTournamentStandingsInterface;
  updateStandings: boolean;
}
