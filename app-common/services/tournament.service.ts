import { HttpClient, HttpParams } from '@angular/common/http';
import { OnlineTournamentInterface, OnlineTournamentResponseInterface } from '@app/modules/game/modules/tournaments/models';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

import { IPaginationResponse } from '@app/modules/main/model/common';
import { ITournament } from '@app/modules/main/model/tournament';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  constructor(private httpClient: HttpClient) {}

  public getOnlineTournament(id: number) {
    return this.httpClient.get<OnlineTournamentInterface>(`${environment.endpoint}/online/tournaments/${id}`).pipe(take(1));
  }

  public getOnlineTournaments(
    startTimeLeftBound?: string,
    startTimeRightBound?: string,
    onlyMyTournaments?: boolean,
    promoted?: boolean,
    limit?: number,
    dateSortDirection?: 'asc' | 'desc',
    sortBy?: string,
    hidden?: boolean
  ): Observable<OnlineTournamentInterface[]> {
    let params = new HttpParams();

    if (promoted) {
      params = params.set('promoted', promoted.toString());
    }

    if (startTimeLeftBound) {
      params = params.set('start_time_after', startTimeLeftBound);
    }

    if (startTimeRightBound) {
      params = params.set('start_time_before', startTimeRightBound);
    }
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    params = params.set('ordering', [`${sortBy}`, `${dateSortDirection === 'desc' ? '-' : ''}datetime_of_tournament`].join(','));
    if (!onlyMyTournaments) {
      params = params.set('hidden', 'false');
    }

    if (onlyMyTournaments) {
      return this.httpClient
        .get<OnlineTournamentInterface[]>(`${environment.endpoint}/online/tournaments/my/`, { params })
        .pipe(catchError((val) => of([])))
        .pipe(take(1))
        .pipe(catchError((error) => of([])));
    }

    return this.httpClient
      .get<OnlineTournamentResponseInterface>(`${environment.endpoint}/online/tournaments/`, { params })
      .pipe(
        catchError((error) => {
          return of({ count: 0, results: [] } as IPaginationResponse<ITournament>);
        })
      )
      .pipe(
        take(1),
        map((response) => response.results)
      );
  }
}
