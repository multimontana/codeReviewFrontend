import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BoardType, GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import { GameSavedOpponentRequestInterface } from '@app/modules/game/models';
import { environment } from '@env';
import { Store } from '@ngxs/store';
import * as moment from 'moment';
import { Observable } from 'rxjs';


@Injectable()
export class GameSharedService {
  constructor(
    private store: Store,
    private http: HttpClient
  ) {}

  convertBoardType(boardType: BoardType): string {
    switch (boardType) {
      case BoardType.BULLET:
        return 'bullet';
      case BoardType.BLITZ:
        return 'blitz';
      case BoardType.RAPID:
        return 'rapid';
    }
    return '';
  }

  convertTime(timeControl: ITimeControl): string {
    let result = moment.duration(timeControl.start_time).asMinutes().toString();
    if (moment.duration(timeControl.increment).asSeconds()) {
      result += '+' + moment.duration(timeControl.increment).asSeconds().toString();
    } else {
      result += ' min';
    }
    return result;
  }

  convertGameMode(gameRatingMode: GameRatingMode): string {
    switch (gameRatingMode) {
      case GameRatingMode.UNRATED:
        return 'NON_RATED';
      case GameRatingMode.FIDERATED:
        return 'FIDE_RATED';
      case GameRatingMode.RATED:
        return 'RATED';
    }
  }

  boardTypeTitle(boardType: BoardType) {
    switch (boardType) {
      case BoardType.RAPID:
        return 'Rapid';
      case BoardType.BLITZ:
        return 'Blitz';
      case BoardType.BULLET:
        return 'Bullet';
      case BoardType.ARMAGEDDON:
        return 'Armageddon';
      case BoardType.CLASSIC:
        return 'Bullet';
    }
  }

  saveSearchOpponentRequest(param: GameSavedOpponentRequestInterface): Observable<GameSavedOpponentRequestInterface> {
    return this.http.post<GameSavedOpponentRequestInterface>(
      `${environment.endpoint}/online/saved-request/${param.player_uid}/`, param);
  }

  getSavedSearchOpponentRequest(uid: string): Observable<GameSavedOpponentRequestInterface> {
    return this.http.get<GameSavedOpponentRequestInterface>(
      `${environment.endpoint}/online/saved-request/${uid}/`);
  }
}
