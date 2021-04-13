export enum MtsRequestEnum {
  MTS_OPEN = 'mts_open',
  MTS_CHALLENGE = 'mts_challenge'
}

export interface MtsRequestBody {
  user_email: string;
  nickname: string;
  message_type: MtsRequestEnum;
}

export interface MtsTournamentData {
  date: string;
  rating: string;
  timecontrol: string;
  name: string;
  tournamentLink: string;
}

export interface MtsMarathonTournament {
  time: string;
  rating: string;
  timecontrol: string;
  name: string;
  tournamentLink: string;
}
