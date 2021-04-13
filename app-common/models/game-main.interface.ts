import { IPlayerCompetitors } from '@app/modules/app-common/services/player-rating.model';

export interface TimeLabelInterface {
  label: string;
  offset: number;
  today: boolean;
  weekend: boolean;
};

export interface PlayerRatingStateInterface {
  bestPlayers: IPlayerCompetitors[],
  bestPlayersRequest: boolean,
}