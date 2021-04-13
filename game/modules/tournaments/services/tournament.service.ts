import { of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import {
  OnlineTournamentInterface,
  OnlineTournamentBoardInterface,
  OnlineTournamentStandingsInterface,
} from '@app/modules/game/modules/tournaments/models';
import { Select, Store } from '@ngxs/store';
import {
  SetBoardsTournament,
  SetToursTournament,
  UpdateBoardsTournament,
  UpdateToursTournament,
} from '@app/modules/game/modules/tournaments/states/tournament.actions';
import { SetStandings, UpdateStandings, UpdateTournamentState, UpdateUserSigned } from '../states/tournament.actions';
import { first, take } from 'rxjs/operators';

import { AccountService } from '@app/account/account-module/services/account.service';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { TournamentStatus } from '@app/broadcast/core/tournament/tournament.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OnlineTournamentResourceService } from '@app/modules/game/modules/tournaments/providers/tournament.resource.service';
import { TourResourceService } from '@app/broadcast/core/tour/tour-resource.service';
import { TournamentGameState } from '@app/modules/game/modules/tournaments/states/tournament.game.state';
import { TranslateService } from '@ngx-translate/core';
import { TourInterface } from '@app/broadcast/core/tour/tour.model';

@Injectable()
export class OnlineTournamentService {
  /**
   * Get board ID by tour
   * @type {Observable<string>}
   * @memberof OnlineTournamentService
   */
  @Select(TournamentGameState.tourBoardId) tourBoard$: Observable<string>;

  /**
   *Creates an instance of OnlineTournamentService.
   * @param {Store} store
   * @param {OnlineTournamentResourceService} onlineTournamentResourceSerivce
   * @param {TourResourceService} tourResourceService
   * @param {GameResourceService} gameResource
   * @memberof OnlineTournamentService
   */
  constructor(
    private store: Store,
    private onlineTournamentResourceSerivce: OnlineTournamentResourceService,
    private tourResourceService: TourResourceService,
    private gameResource: GameResourceService,
    private accountService: AccountService,
    private translateService: TranslateService,
  ) {}

  private processStates: Set<number> = new Set();
  private processTours: Set<number> = new Set();
  private processBoards: Set<number> = new Set();

  private getBoards(tournamentID: number): Observable<OnlineTournamentBoardInterface[]> {
    return this.onlineTournamentResourceSerivce.getBoards(tournamentID);
  }

  private createLink(nBlob, nameLink) {
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(nBlob);
      return;
    }
    const data = window.URL.createObjectURL(nBlob);
    const link = document.createElement('a');
    link.href = data;
    link.download = `${nameLink}`;
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    setTimeout(function () {
      window.URL.revokeObjectURL(data);
      link.remove();
    }, 100);
  }

  subscribeViewerByBoardID(boadrID: string): void {
    this.onlineTournamentResourceSerivce.subscribeViewerBoardID(boadrID);
  }

  unsubscribeViewerByBoardID(boardID: string): void {
    this.onlineTournamentResourceSerivce.unsubscribeViewBoardID(boardID);
  }

  setOnlineBoards(tournamentID: number): void {
    if (tournamentID) {
      this.getBoards(tournamentID).subscribe((data) => {
        this.store.dispatch(new SetBoardsTournament(data));
      });
    }
  }

  getStandings(tournamentID: number, limit: number = 50, offset: number = 0): Observable<OnlineTournamentStandingsInterface> {
    return this.onlineTournamentResourceSerivce.getOnlineTournamentStandings(tournamentID, limit, offset).pipe(
      tap((standings) => {
        return of(standings);
      })
    );
  }

  setStandings(tournamentID: number, limit: number = 50, offset: number = 0): Observable<OnlineTournamentStandingsInterface> {
    return this.getStandings(tournamentID, limit, offset).pipe(
      tap((standings) => {
        this.store.dispatch(new SetStandings(standings));
        return of(standings);
      })
    );
  }

  updateStandings(tournamentID: number, limit: number = 50, offset: number = 0): Observable<OnlineTournamentStandingsInterface> {
    return this.getStandings(tournamentID, limit, offset).pipe(
      map((standings) => {
        this.store.dispatch(new UpdateStandings(standings));
        return standings;
      })
    );
  }

  updateState(tournamentID: number): void {
    if (!this.processStates.has(tournamentID)) {
      this.processStates.add(tournamentID);
      this.onlineTournamentResourceSerivce.getOnlineTournamentState(tournamentID).subscribe(
        (data) => {
          this.processStates.delete(tournamentID);
          this.store.dispatch(new UpdateTournamentState(data));
        },
        () => this.processStates.delete(tournamentID)
      );
    }
  }

  updateOnlineBoards(tournamentID: number): void {
    if (!this.processBoards.has(tournamentID)) {
      this.processBoards.add(tournamentID);
      this.getBoards(tournamentID)
        .pipe(take(1))
        .subscribe(
          (data) => {
            this.processBoards.delete(tournamentID);
            this.store.dispatch(new UpdateBoardsTournament(data));
          },
          () => this.processBoards.delete(tournamentID)
        );
    }
  }

  updateTours(tournamentID: number): Observable<TourInterface[]> {
    return this.tourResourceService.getByTournament(tournamentID).pipe(
      tap((tours) => {
        this.processTours.delete(tournamentID);
        this.store.dispatch(new UpdateToursTournament(tours));
      })
    );
  }

  signout(id: number): Observable<OnlineTournamentInterface> {
    return this.onlineTournamentResourceSerivce.signoutInTournament(id);
  }

  downloadPGN(boadID: string) {
    this.onlineTournamentResourceSerivce.getPGN(boadID).subscribe((blob) => {
      const nBlob = new Blob([blob], { type: 'application/text' });
      this.createLink(nBlob, `PGN-${boadID}.pgn`);
    });
  }

  downloadPDF(tournamentID: number, playerID: number): void {
    this.accountService
      .getLanguage()
      .pipe(take(1))
      .subscribe((lang) => {
        this.onlineTournamentResourceSerivce.getPDF(tournamentID, playerID, lang).subscribe((blob) => {
          const nBlob = new Blob([blob], { type: 'application/pdf' });
          this.createLink(nBlob, `${tournamentID}-${playerID}.pdf`);
        });
      });
  }

  setTours(tournamentID: number): void {
    this.tourResourceService.getByTournament(tournamentID).subscribe((data) => {
      this.store.dispatch(new SetToursTournament(data));
    });
  }

  signupTournament(id: number): void {
    this.onlineTournamentResourceSerivce.signupToTournament(id).subscribe((data) => {
      this.store.dispatch(new UpdateUserSigned(true));
    });
  }
  getFullValue(point: number) {
    return Math.trunc(point) > 0 ? Math.trunc(point) : point - Math.trunc(point) > 0 ? '' : 0;
  }

  /**
   * Subscribe to board of tour.
   * @param {string} [jwt=''] jwt token by authorizated user
   * @memberof OnlineTournamentService
   */
  subscribeToTourBoard(jwt: string = '') {
    this.tourBoard$.pipe(first()).subscribe((tourBoardID) => {
      this.gameResource.subscribeToBoard(tourBoardID, jwt);
    });
  }

  haveHalfValue(point: number) {
    return point - Math.trunc(point) > 0;
  }

  rankOrderText(rank: number): Observable<string> {
    let rankLang = 'TH';
    switch (rank) {
      case 1:
        {
          rankLang = 'ST';
        }
        break;
      case 2:
        {
          rankLang = 'ND';
        }
        break;
      case 3:
        {
          rankLang = 'RD';
        }
        break;
      default:
        {
          rankLang = 'TH';
        }
        break;
    }
    return this.translateService.get(`PLACE_GAME.${rankLang}`);
  }

  public getSignedCount({ signed_up_amount, unsigned_amount, players_amount, status }: OnlineTournamentInterface): string {
    if (status === TournamentStatus.EXPECTED) {
      return `${signed_up_amount}/${players_amount}`;
    }
    return `${signed_up_amount + unsigned_amount}`;
  }
}
