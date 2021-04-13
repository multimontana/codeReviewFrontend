import { PlayerRatingStateInterface } from '../models/game-main.interface';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { SetBestPlayers, SetBestPlayersRequest } from './player-rating.actions';

const defaultState: PlayerRatingStateInterface = {
  bestPlayers: null,
  bestPlayersRequest: false,
};

@State<PlayerRatingStateInterface>({
  name: 'PlayerRatingState',
  defaults: defaultState,
})

export class PlayerRatingState implements NgxsOnInit {
  @Selector()
  static bestPlayers(state: PlayerRatingStateInterface) {
    return state.bestPlayers;
  }

  @Selector()
  static bestPlayersRequest(state: PlayerRatingStateInterface) {
    return state.bestPlayersRequest;
  }

  @Action(SetBestPlayers)
  setBestPlayers(ctx: StateContext<PlayerRatingStateInterface>, action: SetBestPlayers) {
    ctx.patchState({
      bestPlayers: action.bestPlayers,
    });
  }

  @Action(SetBestPlayersRequest)
  SetBestPlayersRequest(ctx: StateContext<PlayerRatingStateInterface>, action: SetBestPlayersRequest) {
    ctx.patchState({
      bestPlayersRequest: action.bestPlayersRequest,
    });
  }

  ngxsOnInit(ctx?: StateContext<PlayerRatingStateInterface>): void | any {
    return;
  }
}
