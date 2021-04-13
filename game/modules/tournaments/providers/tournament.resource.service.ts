import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BoardNotificationSocketAction, SocketType } from '@app/auth/auth.model';
import { SocketConnectionService } from '@app/auth/socket-connection.service';
import { BoardStartedInterface, GameMessageType, OpponentModeEnum, TourBoardCreatedInterface } from '@app/modules/game/models';

import { GameSocketActions } from '@app/modules/game/state/game-socket-actions.enum';
import { GameBoardCreated, SetOpponentMode, UpdateTourJWT } from '@app/modules/game/state/game.actions';
import { IChatID } from '@app/modules/game/state/online-request-response.model';
import {
  OnlineTournamentBoardInterface,
  OnlineTournamentBoardsInterface,
  OnlineTournamentInterface,
  OnlineTournamentStandingInterface,
  OnlineTournamentStandingsInterface,
  OnlineTournamentStateInterface,
  ReadyResponseInterface,
  TournamentStateInterface,
  UpdateMeEnum,
  UpdateMeResponseInterface,
} from '@app/modules/game/modules/tournaments/models';
import { TournamentSocketActions, TournamentMessageType } from '@app/modules/game/modules/tournaments/models/tournament';
import {
  InitTournamentIds,
  SetCurrentActiveBoardId,
  SetHasNoTour,
  SetLastTourFlag,
  SetPlayerDisqualified,
  SetTourBoardId,
  SetTourEnd,
  SetTournamentOver,
  SetTourStarted,
  UpdateTournamentState,
  UpdateFlagResult,
  UpdateToursTournament,
} from '@app/modules/game/modules/tournaments/states/tournament.actions';
import { Store } from '@ngxs/store';
import { EMPTY, Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, delay, filter, first, map, mergeMap, pluck, switchMap, take, tap } from 'rxjs/operators';
import { environment } from '@env';
import { TourResourceService } from '@app/broadcast/core/tour/tour-resource.service';
import { ITournamentGameState } from '@app/modules/game/modules/tournaments/states/tournament.game.state';
import { ChessgroundAudioService, SoundType } from '@app/shared/widgets/chessground/chessground.audio.service';

@Injectable({
  providedIn: 'root',
})
export class OnlineTournamentResourceService {
  constructor(
    private http: HttpClient,

    // private socket: SocketService<TTournamentMessage | IGameMessage>,
    private tourResourceService: TourResourceService,
    private socket: SocketConnectionService<TournamentMessageType | GameMessageType, TournamentMessageType | GameMessageType>,
    private store: Store,
    private router: Router,
    private audioService: ChessgroundAudioService,
  ) {
    this.socket.messages$
      .pipe(
        filter(
          (message) =>
            !!message &&
            message.action !== GameSocketActions.GAMING_PONG &&
            ([
              GameSocketActions.TOUR_BOARD_CREATED,
              GameSocketActions.BOARD_STARTED,
              TournamentSocketActions.TOURNAMENT_OVER,
              TournamentSocketActions.TOURNAMENT_RESULTS_UPDATE,
              TournamentSocketActions.TOURNAMENT_STATE_UPDATE,
            ] as any[]).includes(message.action)
        )
      )
      .subscribe((message) => {
        const tournamentGameData: ITournamentGameState = this.store.snapshot()['TournamentGameState'];
        const tournamentData: TournamentStateInterface = this.store.snapshot()['TournamentState'];

        switch (message.action) {
          case GameSocketActions.TOUR_BOARD_CREATED:
            if (message.can_play) {
              if (this.router.url.indexOf(message.board_id) === -1) {
                if (!message.is_first_tour) {
                  of(true)
                    .pipe(
                      delay(10000),
                      switchMap(() => this.initTourData(message)),
                      take(1)
                    )
                    .subscribe(() => this.navigateToTournamentGamePage(message.board_id));
                } else {
                  this.initTourData(message).subscribe(() => {
                    this.navigateToTournamentGamePage(message.board_id);
                  });
                }
              }
            } else {
              this.store
                .dispatch(new SetHasNoTour(true))
                .pipe(take(1))
                .subscribe(() => {
                  if (message.action === GameSocketActions.TOUR_BOARD_CREATED) {
                    this.store.dispatch(new SetLastTourFlag(message.is_last_tour));
                  }
                });
            }
            break;

          case GameSocketActions.BOARD_STARTED:
            this.boardStartedHandle(message);
            break;

          case TournamentSocketActions.TOURNAMENT_OVER:
            if (message.tournament_id === tournamentGameData.tournamentId) {
              this.store
                .dispatch(new SetTournamentOver(true))
                .pipe(take(1))
                .subscribe(() => {
                  this.store.dispatch(new SetLastTourFlag(true));
                });

              setTimeout(() => {
                this.audioService.playSound(SoundType.tourend);
              }, 3000);
            }
            break;

          case TournamentSocketActions.TOURNAMENT_RESULTS_UPDATE:
            if (message.tournament_id === tournamentData.tournament.id) {
              this.store.dispatch(new UpdateFlagResult(true));
            }
            break;

          case TournamentSocketActions.TOURNAMENT_STATE_UPDATE:
            if (message.tournament_id === tournamentData.tournament.id) {
              const { id } = message.state;
              this.tourResourceService
                .getByTournament(id)
                .pipe(
                  take(1),
                  tap((tours) => {
                    this.store.dispatch(new UpdateToursTournament(tours));
                    this.store.dispatch(new UpdateTournamentState(message.state));
                  })
                )
                .subscribe();
            }
            break;
        }
      });
  }

  public updateTournamentStatus(): void {
    this.updateMe()
      .pipe(take(1))
      .subscribe((response) => {
        this.initTournamentAfterUpdateMe(response);
      });
  }

  public getBoards(id: number): Observable<OnlineTournamentBoardInterface[]> {
    const params = new HttpParams().set('exclude_odd_boards', 'true').set('limit', '300').set('tournament_id', id.toString());
    return this.http
      .get<OnlineTournamentBoardsInterface>(`${environment.endpoint}/online/tournament/gaming/`, { params })
      .pipe(
        pluck('results'),
        // mergeMap((results) => {
        //   if (results.next) {
        //     return this.getPaginationBoard(results.next, results.results);
        //   } else {
        //     return of([...results.results]);
        //   }
        // }),
        catchError((err, caught) => {
          if ([404, 502, 500].includes(err.status)) {
            return of([]);
          }
          return EMPTY;
        })
      );
  }

  public getByChatID(id: number): Observable<string> {
    return this.http.get<IChatID>(`${environment.endpoint}/online/tournaments/${id}/chat/`).pipe(
      map((i) => i.chat_id),
      catchError((err, caught) => {
        if ([404, 502, 500].includes(err.status)) {
          return EMPTY;
        }
        return of(true).pipe(
          delay(500),
          mergeMap((_) => this.getByChatID(id))
        );
      })
    );
  }

  getBoardsByTour(tournamentID: number, tourID: number, limit: number = 20, offset: number): Observable<OnlineTournamentBoardsInterface> {
    let params = new HttpParams()
      .set('exclude_odd_boards', 'true')
      .set('ordering', 'tour_desk_number')
      .set('tournament_id', tournamentID.toString())
      .set('tour_id', tourID.toString())
      .set('limit', limit.toString());

    if (offset) {
      params = params.set('offset', offset.toString());
    }

    return this.http
      .get<OnlineTournamentBoardsInterface>(`${environment.endpoint}/online/tournament/gaming/`, { params })
      .pipe(
        catchError((err) => {
          if ([404, 502, 500].includes(err.status)) {
            return EMPTY;
          }
          return EMPTY;
        })
      );
  }

  getPaginationBoard(url: string, boards: OnlineTournamentBoardInterface[]): Observable<OnlineTournamentBoardInterface[]> {
    return this.http.get<OnlineTournamentBoardsInterface>(`${url}`).pipe(
      mergeMap((result) => {
        if (result.next && typeof result.next === 'string') {
          return this.getPaginationBoard(result.next, [...boards, ...result.results]);
        } else {
          return of([...boards, ...result.results]);
        }
      }),
      catchError((err, caught) => {
        if ([404, 502, 500].includes(err.status)) {
          return EMPTY;
        }
        return EMPTY;
      })
    );
  }

  public getOnlineTournament(id: number): Observable<OnlineTournamentInterface> {
    return this.http.get<OnlineTournamentInterface>(`${environment.endpoint}/online/tournaments/${id}/`).pipe(
      filter((i) => !!i),
      catchError((err, caught) => {
        if ([404, 502, 500].includes(err.status)) {
          this.router.navigate([`/tournaments`]).then();
        }
        return null;
      })
    );
  }

  public getOnlineTournamentStandings(id: number, limit: number = 0, offset: number = 0): Observable<OnlineTournamentStandingsInterface> {
    let params = new HttpParams();
    if (limit !== 0) {
      params = params.set('limit', limit.toString());
    }
    if (offset !== 0) {
      params = params.set('offset', offset.toString());
    }
    return this.http
      .get<OnlineTournamentStandingsInterface>(`${environment.endpoint}/online/tournaments/${id}/results/`, { params })
      .pipe(
        catchError((err, caught) => {
          if ([404, 502, 500].includes(err.status)) {
            this.router.navigate([`/tournaments`]).then();
            return EMPTY;
          }
          return of(true).pipe(
            delay(1000),
            mergeMap((_) => this.getOnlineTournamentStandings(id, limit, offset))
          );
        })
      );
  }

  public getOnlineTournamentState(id: number): Observable<OnlineTournamentStateInterface> {
    return this.http.get<OnlineTournamentStateInterface>(`${environment.endpoint}/online/tournaments/${id}/state/`).pipe(
      catchError((err) => {
        if ([404, 502, 500].includes(err.status)) {
          this.router.navigate([`/tournaments`]).then();
          return of(null);
        }
      })
    );
  }

  public getStandignResult(id: number): Observable<OnlineTournamentStandingInterface[]> {
    return this.getOnlineTournamentStandings(id).pipe(
      filter((standings) => !!standings),
      mergeMap((standings) => {
        if (standings.data.length !== 0) {
          return of(standings.data);
        } else {
          return of(true).pipe(
            delay(500),
            mergeMap((_) => this.getStandignResult(id))
          );
        }
      }),
      catchError((err) => {
        if ([404, 502, 500].includes(err.status)) {
          return of([]);
        } else {
          return of(true).pipe(
            delay(1000),
            mergeMap((_) => this.getStandignResult(id))
          );
        }
      })
    );
  }

  public signupToTournament(id: number): Observable<OnlineTournamentInterface> {
    return this.http.post<OnlineTournamentInterface>(`${environment.endpoint}/online/tournaments/${id}/signup/`, null);
  }

  public signoutInTournament(id: number): Observable<OnlineTournamentInterface> {
    return this.http.post<OnlineTournamentInterface>(`${environment.endpoint}/online/tournaments/${id}/signout/`, null).pipe(
      catchError((err) => {
        return EMPTY;
      })
    );
  }

  public getPGN(boardID: string): Observable<Blob> {
    return this.http.get(`${environment.endpoint}/online/gaming/${boardID}/pgn/`, { responseType: 'blob' });
  }

  public getPDF(tournamentID: number, playerID: number, lang: string = 'en'): Observable<Blob> {
    let params = new HttpParams();
    if (lang !== 'en') {
      params = params.set('lang', lang);
    }
    return this.http.get(`${environment.endpoint}/online/tournament-certificate/${tournamentID}/${playerID}/`, {
      params,
      responseType: 'blob',
    });
  }

  public updateMe(): Observable<UpdateMeResponseInterface> {
    return this.http.get<UpdateMeResponseInterface>(`${environment.endpoint}/online/tournaments/update-me`);
  }

  public subscribeViewerBoardID(boardID: string): void {
    this.sendSocketMessage({
      message_type: SocketType.BOARD_NOTIFICATION,
      action: BoardNotificationSocketAction.GAMING_SUBSCRIBE_VIEWER_TO_BOARD,
      board_id: boardID,
      seq: 0,
    });
  }

  public unsubscribeViewBoardID(boardID: string): void {
    this.sendSocketMessage({
      message_type: SocketType.BOARD_NOTIFICATION,
      action: BoardNotificationSocketAction.BOARD_UNSUBSCRIBE,
      board_id: boardID,
      seq: 0,
    });
  }

  public getTourReadyInfo(boardId: string): Observable<ReadyResponseInterface> {
    return this.http.post<ReadyResponseInterface>(`${environment.endpoint}/online/gaming/${boardId}/ready/`, {});
  }

  public getFavoriteBoards(tourId: number): Observable<OnlineTournamentBoardInterface[]> {
    let params = new HttpParams();
    if (tourId !== 0) {
      params = params.set('tour_id', tourId.toString());
    }
    return this.http.get<OnlineTournamentBoardInterface[]>(`${environment.endpoint}/online/tournament/top-boards/`, { params });
  }

  public initTournamentAfterUpdateMe(updateMe: UpdateMeResponseInterface, needNavigate = true): void {
    const tournamentData = this.store.snapshot()['TournamentGameState'];
    switch (updateMe.status) {
      case UpdateMeEnum.WAITING_FOR_NEXT_TOUR:
      case UpdateMeEnum.GAME_IN_PROGRESS:
        if (tournamentData.currentTour !== updateMe.tour_id || tournamentData.tournamentId !== updateMe.tournament_id) {
          this.initTourData({
            action: GameSocketActions.TOUR_BOARD_CREATED,
            message_type: SocketType.GAMING,
            board_id: updateMe.board_uid,
            jwt: updateMe.jwt,
            chat_id: updateMe.chat_id,
            user_uid: updateMe.uid,
            tour_id: updateMe.tour_id,
            tournament_id: updateMe.tournament_id,
            is_first_tour: updateMe.is_first_tour,
            is_last_tour: updateMe.is_last_tour,
            can_play: true,
            seq: 0,
          }).subscribe(() => {
            if (needNavigate) {
              this.navigateToTournamentGamePage(updateMe.board_uid);
            }
          });
        } else if (updateMe.status === UpdateMeEnum.GAME_IN_PROGRESS) {
          this.boardStartedHandle(
            {
              action: GameSocketActions.BOARD_STARTED,
              message_type: SocketType.GAMING,
              board_id: updateMe.board_uid,
              user_uid: updateMe.uid,
              jwt: updateMe.jwt,
              seq: 0,
            },
            needNavigate
          );
        }
        break;

      case UpdateMeEnum.GAMEOVER:
        this.store.dispatch(new SetTourEnd());
        break;

      case UpdateMeEnum.TOURNAMENT_OVER:
        this.store.dispatch(new SetTourEnd());
        this.store.dispatch(new SetTournamentOver(true));
        break;

      case UpdateMeEnum.PLAYER_DISQUALIFIED:
        this.store.dispatch(new SetPlayerDisqualified(true));
        break;
    }
  }

  private initTourData(message: TourBoardCreatedInterface): Observable<any> {
    return this.store.dispatch(new InitTournamentIds(message.tour_id, message.tournament_id)).pipe(
      first(),
      switchMap(() =>
        this.store.dispatch([
          new SetHasNoTour(false),
          new SetLastTourFlag(message.is_last_tour),
          new GameBoardCreated(message.board_id, message.jwt, message.white_player ? message.white_player.uid : ''),
          new SetCurrentActiveBoardId(message.board_id),
          new SetOpponentMode(OpponentModeEnum.HUMAN),
        ])
      ),
      first(),
      delay(50)
    );
  }

  private boardStartedHandle(message: BoardStartedInterface, needNavigate = true) {
    this.store
      .dispatch(new UpdateTourJWT(message.jwt))
      .pipe(take(1))
      .subscribe(() => {
        this.store.dispatch(new SetTourBoardId(message.board_id));
        this.store.dispatch(new SetCurrentActiveBoardId(message.board_id));
        if (this.router.url.indexOf(message.board_id) === -1) {
          if (needNavigate) {
            this.router.navigate([`/tournament/pairing/${message.board_id}/`]).then(() => {});
          }
        } else {
          this.store.dispatch(new SetTourStarted());
        }
      });
  }

  private sendSocketMessage(message: TournamentMessageType) {
    this.socket.sendMessage(message);
  }

  private navigateToTournamentGamePage(boardId: string): void {
    if (this.router.url.indexOf(`tournament/pairing/${boardId}`) === -1) {
      this.router.navigate([`/tournament/pairing/${boardId}/`]).then();
    }
  }
}
