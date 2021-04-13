import { TournamentLifecycleStepEnum } from '@app/modules/game/modules/tournaments/models';

export const tournamentLifecycleStepExpectation = {
  [TournamentLifecycleStepEnum.TOUR_BOARD_CREATED]: [
    TournamentLifecycleStepEnum.TOUR_GAME_END,
    TournamentLifecycleStepEnum.TOUR_GAME_ABORTED,
    TournamentLifecycleStepEnum.TOUR_OVER,
  ],
  [TournamentLifecycleStepEnum.BOARD_STARTED]: [TournamentLifecycleStepEnum.TOUR_BOARD_CREATED],
  [TournamentLifecycleStepEnum.TOUR_BOARD_SUBSCRIBED]: [TournamentLifecycleStepEnum.BOARD_STARTED],
  [TournamentLifecycleStepEnum.TOUR_GAME_STARTED]: [TournamentLifecycleStepEnum.TOUR_BOARD_SUBSCRIBED],
  [TournamentLifecycleStepEnum.OPPONENT_MOVE_TURN]: [
    TournamentLifecycleStepEnum.PLAYER_MOVE_TURN,
    TournamentLifecycleStepEnum.TOUR_GAME_STARTED,
  ],
  [TournamentLifecycleStepEnum.PLAYER_MOVE_TURN]: [
    TournamentLifecycleStepEnum.OPPONENT_MOVE_TURN,
    TournamentLifecycleStepEnum.TOUR_GAME_STARTED,
  ],
  [TournamentLifecycleStepEnum.TOUR_GAME_END]: [
    TournamentLifecycleStepEnum.OPPONENT_MOVE_TURN,
    TournamentLifecycleStepEnum.PLAYER_MOVE_TURN,
  ],
  [TournamentLifecycleStepEnum.TOUR_GAME_ABORTED]: [
    TournamentLifecycleStepEnum.OPPONENT_MOVE_TURN,
    TournamentLifecycleStepEnum.TOUR_BOARD_SUBSCRIBED,
  ],
  [TournamentLifecycleStepEnum.TOUR_OVER]: [
    TournamentLifecycleStepEnum.TOUR_GAME_END,
    TournamentLifecycleStepEnum.TOUR_GAME_ABORTED,
  ]
};
