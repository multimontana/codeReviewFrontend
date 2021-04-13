import { RoundIntervalType } from '@app/modules/game/modules/tournaments/models/round-time/round-time.enum';

export interface RoundIntervalBaseInterface {
  datetime: {
    lower: string;
    upper: string;
  };
}

export interface RoundIntervalRoundInterface extends RoundIntervalBaseInterface {
  type: RoundIntervalType.ROUND;
  tour_number: number;
  hide_time?: boolean;
}

export interface RoundIntervalBreakInterface extends RoundIntervalBaseInterface {
  type: RoundIntervalType.BREAK;
}
