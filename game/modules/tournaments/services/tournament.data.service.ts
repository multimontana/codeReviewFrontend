import { ICountry } from '@app/broadcast/core/country/country.model';
import { filter, map } from 'rxjs/operators';
import { OnlineTournamentStandingsInterface } from '@app/modules/game/modules/tournaments/models';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()

export class TournamentDataService {

  constructor() { }

  getPlayerCount(standings$: Observable<OnlineTournamentStandingsInterface>): Observable<number> {
    return standings$.pipe(
      filter(standings => !!standings),
      map((standings) => {
        return (standings.count - standings.data.length);
      }),
    );
  }

  getFederationTitle(id: number | null, countries: ICountry[]): string {
    if (id) {
      const result: ICountry = (countries || []).find((country: ICountry) => country.id === id);
      return result && result.long_code;
    } else {
      return 'Worldwide';
    }
  }
}
