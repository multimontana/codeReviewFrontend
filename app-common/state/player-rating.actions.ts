import { IPlayerCompetitors } from '@app/modules/app-common/services/player-rating.model';

export class SetBestPlayers {
  static readonly type = '[PlayerRatingSate] Best Players';
  constructor(
    public bestPlayers: IPlayerCompetitors[],
  ) { }
}

export class SetBestPlayersRequest {
  static readonly type = '[PlayerRatingSate] Best Players Request';
  constructor(
    public bestPlayersRequest: boolean,
  ) { }
}
