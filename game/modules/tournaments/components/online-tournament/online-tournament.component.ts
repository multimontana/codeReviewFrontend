import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { trackByIndex, untilDestroyed } from '@app/@core';
import { AccountVerification, IAccount } from '@app/account/account-store/account.model';
import { selectAccount, selectMyAccount } from '@app/account/account-store/account.reducer';
import { selectIsAuthorized, selectToken } from '@app/auth/auth.reducer';
import { ChatSocketService } from '@app/broadcast/chess/chat/services/chat-socket.service';
import { GetBoardsByTour } from '@app/broadcast/core/board/board.actions';
import { BoardResult, BoardStatus } from '@app/broadcast/core/board/board.model';
import { ICountry } from '@app/broadcast/core/country/country.model';
import { GetMatchesByTour } from '@app/broadcast/core/match/match.actions';
import * as TourActions from '@app/broadcast/core/tour/tour.actions';
import { BoardType, GameRatingMode, ITimeControl, TourInterface } from '@app/broadcast/core/tour/tour.model';
import { GetTournament } from '@app/broadcast/core/tournament/tournament.actions';
import { TournamentStatus, TournamentType } from '@app/broadcast/core/tournament/tournament.model';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { SetLastConnectionActive } from '@app/modules/game/state/game.actions';
import { GameService } from '@app/modules/game/state/game.service';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { GameState } from '@app/modules/game/state/game.state';
import {
  ActionButtonMode, IRoundInterval,
  OnlineTournamentBoardInterface,
  OnlineTournamentInterface,
  OnlineTournamentStandingsInterface,
  OnlineTournamentUnavailabilityReasonEnum,
  RoundIntervalType
} from '@app/modules/game/modules/tournaments/models';
import { OnlineTournamentResourceService } from '@app/modules/game/modules/tournaments/providers/tournament.resource.service';
import { OnlineTournamentService } from '@app/modules/game/modules/tournaments/services/tournament.service';
import {
  SetHasNoTourNotification,
  SetOnlineTournament,
  SetOpponentHasLeft, SetPlayerDisqualified,
  SetPlayerHasLeft,
  UpdateFlagResult,
  UpdateOnlineTournament
} from '@app/modules/game/modules/tournaments/states/tournament.actions';
import { TournamentState } from '@app/modules/game/modules/tournaments/states/tournament.state';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { selectFideIdPlan } from '@app/purchases/subscriptions/subscriptions.reducer';
import * as fromRoot from '@app/reducers';
import { truthy } from '@app/shared/helpers/rxjs-operators.helper';
import {
  select,
  Store as NGRXStore
} from '@ngrx/store';
import {
  Select,
  Store
} from '@ngxs/store';
import * as moment from 'moment';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  interval,
  Observable,
  of,
  ReplaySubject,
  timer
} from 'rxjs';
import {
  debounceTime,
  defaultIfEmpty,
  delay,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  mergeMap,
  pluck,
  shareReplay,
  skip,
  switchMap,
  take,
  takeWhile,
  tap,
  withLatestFrom,
  skipWhile
} from 'rxjs/operators';
import { UpdateUserSigned } from '../../states/tournament.actions';
import { GameTranslateService } from '../../../../services/game-translate.service';
import { TournamentGameState } from '../../states/tournament.game.state';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';

@Component({
  selector: 'wc-online-tournament',
  templateUrl: './online-tournament.component.html',
  styleUrls: ['./online-tournament.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnlineTournamentComponent implements OnInit, OnDestroy {
  @Select(TournamentState.getTournament) getTournament$: Observable<OnlineTournamentInterface>;
  @Select(TournamentState.getTours) getTours$: Observable<TourInterface[]>;
  @Select(TournamentGameState.opponentHasLeft) opponentHasLeft$: Observable<boolean>;
  @Select(TournamentGameState.getCurrentTourId) getCurrentTourId$: Observable<number>;
  @Select(TournamentGameState.playerHasLeft) playerHasLeft$: Observable<boolean>;
  @Select(TournamentGameState.hasNoTourNotification) hasNoTourNotification$: Observable<boolean>;
  @Select(TournamentGameState.getCurrentActiveBoardId) currentActiveBoardId: Observable<string>;
  @Select(GameState.connectionActive) connectionActive$: Observable<boolean>;
  @Select(GameState.getLastConnectionActive) lastConnectionActive$: Observable<boolean>;
  @Select(GameState.getUID) getUID$: Observable<string>;
  @Select(TournamentState.getStandings) getStandings$: Observable<OnlineTournamentStandingsInterface>;
  @Select(TournamentGameState.playerDisqualified) playerDisqualified$: Observable<boolean>;
  @Select(TournamentState.updateStandings) updateStandings$: Observable<boolean>;
  @Select(TournamentState.getCurrentTourNumber) getCurrentTourNumber$: Observable<number>;
  //#region class props
  moment = moment;

  public trackByIndexFn = trackByIndex;

  // Chat
  toggleChat = true;
  toggleChatMobile = false;

  durationFormat: moment.DurationFormatSettings = {
    trim: 'both',
    trunc: true,
    usePlural: false,
    useSignificantDigits: true
  };

  currentTour: number | null;
  selectedTour: number | null;

  GameRatingMode = GameRatingMode;
  OnlineTournamentUnavailabilityReasonEnum = OnlineTournamentUnavailabilityReasonEnum;

  // Interval
  intervalBoards$ = interval(4000);


  public tournamentSubject$ = new BehaviorSubject<OnlineTournamentInterface>(null);
  public enableChat$ = new BehaviorSubject<string>(null);

  routeID$: Observable<number> = this.route.params.pipe(map((p) => p['tournament']));

  public tours$ = this.getTours$.pipe(
    filter((i) => !!i)
  );
  public readonly selectedTourIdSubject$: ReplaySubject<number> = new ReplaySubject<number>(1);
  public selectedTour$: Observable<TourInterface> = combineLatest([
    this.tours$,
    this.selectedTourIdSubject$])
    .pipe(
      map(
        ([tours, selectedTourId]) => tours.find((t) => t.id === selectedTourId)
      ),
    // @todo use only store.
      tap(
        (tour: TourInterface) => (tour ? this.store$.dispatch(new TourActions.AddTour({ tour })) : '')
      )
    );

  public canPrevTourSelect$ = combineLatest([this.tours$, this.selectedTourIdSubject$]).pipe(
    map(([tours, selectedTourId]) => tours.length && tours.findIndex((t) => t.id === selectedTourId) > 0)
  );

  public canNextTourSelect$ = combineLatest([this.tours$, this.selectedTourIdSubject$]).pipe(
    map(([tours, selectedTourId]) => tours.length && tours.findIndex((t) => t.id === selectedTourId) < tours.length - 1)
  );


  public account$: Observable<IAccount> = this.store$.pipe(
    select(selectMyAccount),
    shareReplay(1)
  );
  public account?: IAccount = null;
  public getFavoriteBoard = [];
  public readonly token$ = this.store$.pipe(
    select(selectToken),
    defaultIfEmpty('')
  );

  public countCountries$: Observable<string | null> = this.getTournament$.pipe(
    pluck('signed_up_amount'),
    switchMap((countPlayers) => {
      if (countPlayers != null && ![0, 1].includes(countPlayers)) {
        return this.getStandings$.pipe(
          filter((standings) => !!standings && standings.data.length !== 0),
          pluck('data'),
          map((standigns) => new Set(standigns.map((p) => p.nationality_id)).size),
          switchMap   ((countCountries) => {
            if (countCountries != null && ![0, 1].includes(countCountries)) {
              return this.gameTranslate.getTranslateObject(`TEXT.COUNTRIES`, { country: countCountries });
            }
            return of(null);
          }),
        );
      } else {
        return of(null);
      }
    })
  );

  public getTitlePlayers$: Observable<string | null> = this.getTournament$.pipe(
    pluck('signed_up_amount'),
    switchMap((countPlayers) => {
      if (countPlayers === 1) {
        return this.gameTranslate.getTranslateObject(`TEXT.PLAYER`, { player: countPlayers });
      } else {
        return this.gameTranslate.getTranslateObject(`TEXT.PLAYERS`, { player: countPlayers });
      }
    })
  );

  public countries$ = this.paygatePopupService.countries$;
  public countries: any[] = [];

  public actionButtonMode: ActionButtonMode = ActionButtonMode.HIDE;
  public ActionButtonMode = ActionButtonMode;

  public TournamentStatus = TournamentStatus;

  public BoardResult = BoardResult;
  public BoardStatus = BoardStatus;

  // @todo fix.
  public openContent = false;

  public timeLineIntervalsReal$: Observable<IRoundInterval[]> =
    this.tours$.pipe(
    withLatestFrom(this.getTournament$.pipe(filter((tournament) => !!tournament))),
    mergeMap(this.getTimeLineIntervals())
    );


  public getChatID$ = combineLatest([this.getUID$.pipe(filter((uid) => !!uid)), this.routeID$]).pipe(
    distinctUntilChanged(),
    switchMap(([uid, tournamentID]) => {
      if (tournamentID) {
        return this.gameService.getChatIDByTournament(tournamentID);
      } else {
        return of(null);
      }
    }),
    shareReplay(1)
  );

  public readonly signout$ = new BehaviorSubject(false);

  public signoutProgress$ = this.signout$.pipe(
    mergeMap((signout) => {
      if (signout) {
        return interval(25).pipe(
          take(101),
          takeWhile(() => this.signout$.value),
          tap((t) => {
            if (t === 100) {
              this.signoutHoldInTournament();
            }
          })
        );
      } else {
        return of(0);
      }
    })
  );

  public needResubscribe$ = this.connectionActive$.pipe(
    skipWhile(connect => connect),
    truthy()
  );

  public getPlayers$ = combineLatest([
    this.getTournament$.pipe(
      filter((tournamnet) => !!tournamnet)
    ),
    this.getStandings$.pipe(
      filter((standings) => !!standings),
      pluck('data'),
    ),
  ]).pipe(
    map(([tournament, standings]) => {
      const { status } = tournament;
      if ([TournamentStatus.GOES, TournamentStatus.COMPLETED, TournamentStatus.EXPECTED].includes(status)) {
        return standings.slice().reverse();
      }
      return standings;
    })
  );

  public getPlayersLimited$ = this.getPlayers$.pipe(
    map((players) => players
      .slice(Math.max(players.length - 20, 0))
      .sort((a, b) => b.rank - a.rank))
  );

  private playerId$ = this.account$.pipe(
    pluck('player', 'player_id')
  );

  public getCurrentTourNumberId$: Observable<number> = combineLatest([
    this.getCurrentTourNumber$,
    this.tours$,
      this.getTournament$.pipe(
        filter(tournament => !!tournament),
        pluck('id')
      ),
      this.routeID$.pipe(
        filter(routeID => !!routeID),
      ),
  ]).pipe(
    map(([currentNumber, tours, tournamentId, routeId]) => {
      if (currentNumber && (tournamentId === routeId)) {
        const findTours = tours.find(tour => tour.tour_number === currentNumber);
        return (findTours) ? findTours.id : null;
      } else {
        if (tours.length) {
          return tours[tours.length - 1].id;
        } else {
          return 0;
        }
      }
    })
  );

  /**
   * @desc Get current board for which there is no result for a player
   */
  private currentBoard$: Observable<OnlineTournamentBoardInterface> = this.getCurrentTourNumberId$.pipe(
    withLatestFrom(this.getTournament$
      .pipe(
        truthy(),
        pluck('status')
      )
    ),
    switchMap(([currentTourID, statusTournament]) => {
      if (this.checkTournamentStatus(statusTournament)) {
        return this.onlineTournamentResourceService.getFavoriteBoards(currentTourID);
      } else {
        return [];
      }
    }),
    withLatestFrom(
      this.playerId$
    ),
    mergeMap(([boards, playerID]) =>
      of(
        boards.find(
          (board) =>
            board.result === null && (board.white_id === playerID || board.black_id === playerID)
        )
      )
    ),
  );

  public isShowReturnGame$: Observable<boolean> = this.currentBoard$.pipe(
    filter((currentBoard) => !!currentBoard),
    withLatestFrom(this.getTournament$),
    switchMap(([currentBoard, tournament]) => {
      if (currentBoard) {
        return of(
          tournament.user_signed && this.checkTournamentStatus(tournament.status)
        );
      } else {
        return of(false);
      }
    })
  );


  public favoriteBoards$: Observable<OnlineTournamentBoardInterface[]> = this.selectedTour$.pipe(
    filter(selectedTour => !!selectedTour),
    withLatestFrom(this.getTournament$),
    filter(([selectedTour, tournament]) => tournament.id === selectedTour.tournament),
    switchMap(([selectedTour, tournament]) => {
      return this.onlineTournamentResourceService.getFavoriteBoards(selectedTour.id);
    }),
    map((favoriteBoards) =>
      favoriteBoards.filter(boards => !!boards.black_id && !!boards.white_id)
    ),
  );

  public getSignedCount$: Observable<string> = this.getStandings$.pipe(
    filter(standings => !!standings),
    pluck('count'),
    withLatestFrom(this.getTournament$.pipe(
      filter(tournament => !!tournament),
    )),
    map(([count, tournament]) => {
      const { players_amount, status } = tournament;
      if (status === TournamentStatus.EXPECTED) {
        return `${count}/${players_amount}`;
      }
      return `${count}`;
    })
  );

  private fidePurchased$: Observable<boolean> = this.store$.pipe(
    select(selectFideIdPlan),
    map((fidePlan) => {
      return fidePlan && fidePlan.is_active;
    })
  );

  private fideIdStatus$: Observable<AccountVerification> = this.store$.pipe(
    select(selectAccount),
    map((account) => {
      if (account && account.account) {
        return account.account.fide_verified_status;
      }

      return AccountVerification.NOT_VERIFIED;
    })
  );


  private isAuthorized$ = this.store$.pipe(select(selectIsAuthorized));

  private defaultLimit = 50;
  private standingsLimit = 50;
  private standingsOffset = 0;
  //#endregion

  constructor(
    public onlineTournamentService: OnlineTournamentService,
    private router: Router,
    private route: ActivatedRoute,
    private store$: NGRXStore<fromRoot.State>,
    private store: Store,
    private paygatePopupService: PaygatePopupService,
    private gameSharedService: GameSharedService,
    private onlineTournamentResourceService: OnlineTournamentResourceService,
    private gameService: GameService,
    private chatService: ChatSocketService,
    private modalService: ModalWindowsService,
    private gameTranslate: GameTranslateService,
    private cdr: ChangeDetectorRef,
    private gameResourceService: GameResourceService
  ) {
    this.subToRouterId();
    this.setFVBoardsTours();
  }


  ngOnInit() {
    this.modalService.closeAll();

    this.subToInterval();
    this.updateResults();
    this.checkConnectionActive();
    this.subToGetTournament();
    this.subToAccount();
    this.subToCountries();
    this.subToCombinedTourTimeline();
    this.subToPlayerFideData();
    this.subToNoTourNotification();
    this.subToOpponentHasLeft();
    this.subToPlayerHasLeft();
    this.subToPlayerDisqualified();
    this.subscribeChat();
    this.subToAuthorized();
  }

  ngOnDestroy(): void {
  }

  getTournamentType(tournament: OnlineTournamentInterface): Observable<string> {
    let tournamnetType = null;
    switch (tournament.tournament_type) {
      case TournamentType.CIRCULAR:
        tournamnetType = 'CIRCULAR';
      case TournamentType.MATCH:
        tournamnetType = 'MATCH';
      case TournamentType.PLAYOFF:
        tournamnetType = 'PLAYOFF';
      case TournamentType.SWISS:
        tournamnetType = 'SWISS';
    }
    return this.gameTranslate.getTranslate(`TYPE_TOURNAMENT.${tournamnetType}`);
  }

  clickSignout(flag) {
    this.signout$.next(flag);
  }

  /**
   * This is a temporary solution for a bug when scroll
   * goes up when displaying a message.
   * @see https://github.com/angular/components/issues/7390 this isn`t working!
   * @memberof OnlineTournamentComponent
   */
  patchRemoveCl() {
    /**
     * head element HTML document
     * @type {HTMLElement}
     */
    const documentHead = document.getElementsByTagName('html')[0];

    documentHead.classList.remove('cdk-global-scrollblock');
    documentHead.removeAttribute('class');
    documentHead.removeAttribute('style');
    this.cdr.detectChanges();
  }

  getFederationTitle(id: number | null): string {
    if (id) {
      const result: ICountry = (this.countries || []).find((country: ICountry) => country.id === id);
      return result && result.long_code;
    } else {
      return 'Worldwide';
    }
  }

  convertGameMode(gameRatingMode: GameRatingMode): Observable<string> {
    return this.gameTranslate.getTranslate(
      `OTHER.${this.gameSharedService.convertGameMode(gameRatingMode).toUpperCase()}`
    );
  }

  getBoardType(boardType: BoardType): Observable<string> {
    return this.gameTranslate.getTranslate(`GAME.${this.gameSharedService.boardTypeTitle(boardType).toUpperCase()}`);
  }

  convertTime(timeControl: ITimeControl) {
    return this.gameSharedService.convertTime(timeControl);
  }

  public prevTour(event: Event, tournament: OnlineTournamentInterface) {
    event.preventDefault();
    event.stopPropagation();

    combineLatest([this.tours$, this.selectedTourIdSubject$])
      .pipe(take(1))
      .subscribe(([tours, selectedTourId]) => {
        const index = tours.findIndex((t) => t.id === selectedTourId);

        if (tours.length && index > 0) {
          this.selectedTourIdSubject$.next(tours[index - 1].id);
          window['dataLayerPush'](
            'whcTournament',
            'Tournament',
            'Round',
            'Previous',
            `${tournament.title}`,
            '',
            `${tournament.id}`
          );
        }
        this.modalService.closeAll();
      });
  }

  public nextTour(event: Event, tournament: OnlineTournamentInterface) {
    event.preventDefault();
    event.stopPropagation();

    combineLatest([this.tours$, this.selectedTourIdSubject$])
      .pipe(take(1))
      .subscribe(([tours, selectedTourId]) => {
        const index = tours.findIndex((t) => t.id === selectedTourId);

        if (tours.length && index < tours.length - 1) {
          this.selectedTourIdSubject$.next(tours[index + 1].id);
          window['dataLayerPush'](
            'whcTournament',
            'Tournament',
            'Round',
            'Next',
            `${tournament.title}`,
            '',
            `${tournament.id}`
          );
        }
        this.modalService.closeAll();
      });
  }

  createAccount(event: Event, { id, time_control, rating_type }: OnlineTournamentInterface) {
    event.preventDefault();
    event.stopPropagation();

    window['dataLayerPush'](
      'wchOnlineTournament',
      'Play',
      'Create account',
      id,
      this.gameSharedService.convertTime(time_control),
      this.gameSharedService.convertGameMode(rating_type)
    );
    this.router.navigate(['', { outlets: { p: ['paygate', 'register'] } }]);
  }

  updateAccount(event: Event, { id, time_control, rating_type }: OnlineTournamentInterface) {
    event.preventDefault();
    event.stopPropagation();

    window['dataLayerPush'](
      'wchOnlineTournament',
      'Play',
      'Upgrade now',
      id,
      this.gameSharedService.convertTime(time_control),
      this.gameSharedService.convertGameMode(rating_type)
    );

    this.paygatePopupService.setState({ fideSelected: true });
    this.paygatePopupService.stepLoaded$.next('payment');
    this.router.navigate(['', { outlets: { p: ['paygate', 'payment'] } }]);
  }

  join(event: Event, { id, title }: OnlineTournamentInterface) {
    event.preventDefault();
    event.stopPropagation();
    window['dataLayerPush']('whcTournament', 'Tournament', 'Button', 'Join', title, '', id);

    this.onlineTournamentService.signupTournament(id);
    this.actionButtonMode = ActionButtonMode.LEAVE;
    this.cdr.detectChanges();
  }

  signoutHoldInTournament() {
    this.getTournament$.pipe(take(1), debounceTime(100)).subscribe((t) => {
      this.signoutInTournament(null, t);
    });
  }

  signoutInTournament(event: Event | null, tournament: OnlineTournamentInterface) {
    const { id, title } = tournament;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      window['dataLayerPush']('whcTournament', 'Tournament', 'Button', 'Leave', title, '', id);
    }
    this.onlineTournamentService.signout(id).subscribe((data) => {
      this.store.dispatch(new UpdateOnlineTournament(data));
      this.store.dispatch(new UpdateUserSigned(false));
      this.tournamentSubject$.next(data);
    });
  }

  leave(event: Event, tournament: OnlineTournamentInterface) {
    this.signoutInTournament(event, tournament);
    this.actionButtonMode = ActionButtonMode.REGISTER;
    this.cdr.detectChanges();
  }

  expandContent($event) {
    $event.preventDefault();
    this.openContent = !this.openContent;
    this.cdr.detectChanges();
  }

  showChatMobile() {
    this.toggleChatMobile = !this.toggleChatMobile;
    if (this.toggleChatMobile) {
      const body = document.getElementsByTagName('body')[0];
      body.classList.add('fix-mobile');
    }

    this.getTournament$
      .pipe(
        filter((tournament) => !!tournament),
        take(1)
      )
      .subscribe((data) => {
        window['dataLayerPush'](
          'whcTournament',
          'Tournament',
          'Chat',
          `${this.toggleChatMobile ? 'Open' : 'Close'}`,
          `${data.title}`,
          '',
          `${data.id}`
        );
      });
  }

  public onOverWidget(e, b) {
    b.expand = true;
  }

  public onOutWidget(e, b) {
    b.expand = false;
  }

  public showChat(tournament: OnlineTournamentInterface): void {
    this.toggleChat = !this.toggleChat;
    window['dataLayerPush'](
      'whcTournament',
      'Tournament',
      'Chat',
      `${this.toggleChat ? 'Open' : 'Close'}`,
      `${tournament.title}`,
      '',
      `${tournament.id}`
    );
    this.cdr.detectChanges();
  }

  public disableTournament(tournament: OnlineTournamentInterface): boolean {
    return (
      tournament.status === TournamentStatus.EXPECTED &&
      tournament.user_signed === false &&
      tournament.tournament_online_players && tournament.tournament_online_players.length === tournament.players_amount
    );
  }


  public disableDuplication(tournament: OnlineTournamentInterface): boolean {
    return tournament.status === TournamentStatus.EXPECTED && tournament.in_overlapped_tournament === true;
  }

  public getFormat(tournament: OnlineTournamentInterface): string {
    const day = moment().diff(
      tournament.signup_end_datetime ? tournament.signup_end_datetime : tournament.datetime_of_tournament,
      'day'
    );
    if (day < 0) {
      return 'd';
    } else {
      return 'HH:mm:ss';
    }
  }

  public displayCounter(count): void {
    if (count === 0) {
      this.actionButtonMode = ActionButtonMode.DISABLE;
      this.cdr.detectChanges();
    }
  }


  /**
   * @desc Show a certificate a user
   * @param {IOnlineTournament} tournament
   * @returns {boolean}
   */
  public isShowCertificate(tournament: OnlineTournamentInterface): boolean {
    return (
      tournament.status === TournamentStatus.COMPLETED &&
      tournament.user_signed === true &&
      tournament.signed_up_amount > 1
    );
  }

  public registerFideId(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.paygatePopupService.setState({ fideSelected: true });
    this.router.navigate(['', { outlets: { p: ['paygate', 'fide'] } }]);
  }

  /**
   * @desc Checking that the board is active
   * @param {IOnlineTournamentBoard} board
   * @returns {Observable<boolean>}
   */
  public isActiveBoard(board: OnlineTournamentBoardInterface): Observable<boolean> {
    return this.account$.pipe(
      filter((account) => !!account),
      map((account) => {
        if (account['player']) {
          return account.player['player_id'] === board.black_id || account.player['player_id'] === board.white_id;
        } else {
          return false;
        }
      })
    );
  }

  public getPagination(offset: number): void {
    this.standingsLimit = this.defaultLimit * (offset + 1);
    this.routeID$.pipe(
      filter(routeID => !!routeID),
      switchMap((routeID) => {
        return this.onlineTournamentService.updateStandings(routeID, this.standingsLimit, this.standingsOffset);
      }),
      take(1),
    ).subscribe((standings) => {
      this.cdr.detectChanges();
    });
  }

  /**
   * @desc Check is there a socket connection
   */
  private checkConnectionActive(): void {
    combineLatest([this.connectionActive$, this.lastConnectionActive$])
      .pipe(
        distinctUntilChanged(),
        withLatestFrom(this.getTournament$),
        untilDestroyed(this)
      )
      .subscribe(([connections, tournament]) => {
        const [connect, lastConnection] = connections;
        if (
          !connect &&
          tournament &&
          (tournament.status === TournamentStatus.GOES || tournament.status === TournamentStatus.EXPECTED)
        ) {
          // this.modalService.alertConnect();
        } else if (connect && !lastConnection) {
          this.onlineTournamentResourceService.updateTournamentStatus();
          this.onlineTournamentService.updateState(tournament.id);
          this.store.dispatch(new SetLastConnectionActive(true));
          this.modalService.closeAll();
        }
      });
  }

  private updateTours(): void {
    combineLatest([
      this.getCurrentTourNumber$,
      this.routeID$
    ]).pipe(
      switchMap(([getCurrentTourNumber, routeID]) => {
        return this.onlineTournamentService.updateTours(routeID);
      }),
      untilDestroyed(this)
    ).subscribe();
  }

  private updateResults(): void {
    this.updateStandings$
      .pipe(
        filter((isUpdateResults) => isUpdateResults !== false),
        withLatestFrom(
          this.routeID$,
          this.getTournament$
            .pipe(
              filter((tournament) => !!tournament)
          )
        ),
        switchMap(([isUpdateResults, routeID, tournament]) => {
          return this.onlineTournamentService.updateStandings(routeID, this.standingsLimit, this.standingsOffset);
        }),
        filter((results) => !!results),
        untilDestroyed(this)
    ).subscribe((data) => {
      this.store.dispatch(new UpdateFlagResult(false));
    });
  }

  /**
   * @desc Setting the initial values when initializing the component for boards, tours, standings
   */
  private setFVBoardsTours() {
    this.routeID$
      .pipe(
        distinctUntilChanged(),
        tap((id) => {
          this.onlineTournamentService.setOnlineBoards(id);
          this.onlineTournamentService.setTours(id);
        }),
        switchMap((id) => this.onlineTournamentService.setStandings(id)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private subscribeChat(): void {
    combineLatest([this.getUID$.pipe(truthy()), this.getChatID$, this.token$])
      .pipe(
        distinctUntilChanged(),
        untilDestroyed(this)
      )
      .subscribe(([uid, chatID, jwt]) => {
        if (uid) {
          this.chatService.subscribeChat(chatID, jwt);
        }
      });
  }

  private subToRouterId(): void {
    this.routeID$
      .pipe(
        truthy(),
        distinctUntilChanged(),
        mergeMap((id) => {
          return this.onlineTournamentResourceService.getOnlineTournament(id);
        }),
        untilDestroyed(this)
      )
      .subscribe((data: OnlineTournamentInterface) => {
        window['dataLayerPush'](
          'whcTournament',
          'Tournament',
          'Open',
          `${data.title}`,
          `${this.getBoardType(data.time_control.board_type)}
         ${this.convertTime(data.time_control)}`,
          'banner | calendar',
          '',
          `${data.id}`
        );
        this.tournamentSubject$.next(data);
        this.store.dispatch(new SetOnlineTournament(data));
      });
  }


  private subToInterval(): void {
    this.intervalBoards$
      .pipe(
        withLatestFrom(
          combineLatest([
            this.timeLineIntervalsReal$.pipe(
              mergeMap((source) => {
                return of(
                  source.find(
                    (l) =>
                      l.type === 0 &&
                      moment().isAfter(moment(l.datetime.lower)) &&
                      moment().isBefore(moment(l.datetime.upper))
                  )
                );
              })
            ),
            this.selectedTourIdSubject$,
            this.tours$,
          ])
        ),
        untilDestroyed(this),
    )
      .subscribe(([_, timeLines]) => {
        const tours = timeLines[2];
        const _tour = timeLines[0];
        if (_tour) {
          this.currentTour = tours.find((l) => l.tour_number === <number>_tour['tour_number']).id || 0;
        } else {
          this.currentTour = null;
        }
        this.selectedTour = timeLines[1];
        this.cdr.detectChanges();
      });

  }

  private subToGetTournament(): void {
    this.getTournament$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((data) => {
        this.tournamentSubject$.next(data);
      });

    this.getTournament$
      .pipe(
        filter((i) => !!i),
        switchMap((tournament) => {
          const lower = tournament.signup_start_datetime;
          const upper = tournament.signup_end_datetime;

          let duration = moment(lower).diff(moment());

          if (duration <= 0) {
            duration = moment(upper).diff(moment());
          }

          return duration > 0 ? timer(duration).pipe(mapTo(tournament)) : EMPTY;
        }),
        untilDestroyed(this)
      )
      .subscribe(({ id }) => this.store$.dispatch(new GetTournament({ id })));

  }

  private subToAccount(): void {
    this.account$
      .pipe(
        filter((account) => !!account),
        untilDestroyed(this)
      )
      .subscribe((account) => {
        this.account = account;
        this.cdr.detectChanges();
      });
  }

  private subToCountries(): void {
    this.countries$
      .pipe(untilDestroyed(this))
      .subscribe((countries) => {
        this.countries = countries;
        this.cdr.detectChanges();
      });
  }

  private subToCombinedTourTimeline(): void {
    this.getCurrentTourNumberId$.pipe(
      untilDestroyed(this),
    ).subscribe((currentTourID) => {
      this.selectedTourIdSubject$.next(currentTourID);
      this.currentTour = currentTourID;
    });
  }


  private subToPlayerFideData(): void {
    combineLatest([
      this.getTournament$.pipe(truthy()),
      this.isAuthorized$,
      this.fidePurchased$,
      this.getCurrentTourId$,
      this.fideIdStatus$,
      this.getPlayers$,
    ])
      .pipe(untilDestroyed(this))
      .subscribe(
        ([
           {
             status,
             available,
             user_signed,
             rating_type,
             in_overlapped_tournament,
             signup_start_datetime,
             players_amount,
             tournament_online_players,
             signup_end_datetime,
             datetime_of_tournament,
             datetime_of_finish,
             signup_opened,
             signed_up_amount,
             unavailability_reason
           },
           isAuthorized,
           fidePurchased,
           getCurrentTourID,
           fideIdStatus,
         ]) => {
          const lowerDuration = moment(signup_start_datetime).diff(moment());
          const upperDuration = moment(signup_end_datetime ? signup_end_datetime : datetime_of_tournament).diff(
            moment()
          );
          if (lowerDuration < 0) {
            // After open registration.
            if (upperDuration > 0) {
              // Before close registration.
              this.enableChat$.next(null);
              if (user_signed && isAuthorized) {
                this.actionButtonMode = ActionButtonMode.LEAVE;
              } else if (signup_opened) {
                if (unavailability_reason) {
                  this.actionButtonMode = ActionButtonMode.DISABLE;
                } else {
                  if (rating_type === GameRatingMode.RATED) {
                    if (!isAuthorized) {
                      this.actionButtonMode = ActionButtonMode.CREATE_ACCOUNT;
                    } else {
                      if (signed_up_amount !== players_amount) {
                        this.actionButtonMode = ActionButtonMode.REGISTER;
                      } else {
                        this.actionButtonMode = ActionButtonMode.DISABLE;
                      }

                      if (in_overlapped_tournament) {
                        this.actionButtonMode = ActionButtonMode.DISABLE;
                      }
                    }
                  } else if (rating_type === GameRatingMode.FIDERATED) {
                    if (!isAuthorized) {
                      this.actionButtonMode = ActionButtonMode.CREATE_ACCOUNT;
                    } else if (!fidePurchased) {
                      this.actionButtonMode = ActionButtonMode.UPGRADE_NOW;
                    } else {
                      if (signed_up_amount !== players_amount) {
                        this.actionButtonMode = ActionButtonMode.REGISTER;
                        if (!fideIdStatus) {
                          this.actionButtonMode = ActionButtonMode.NEED_FIDE_ID_REGISTER;
                        } else if (fideIdStatus === AccountVerification.ON_CHECK) {
                          this.actionButtonMode = ActionButtonMode.NEED_FIDE_ID_APPROVE;
                        }

                        if (in_overlapped_tournament) {
                          this.actionButtonMode = ActionButtonMode.DISABLE;
                        }
                      } else {
                        this.actionButtonMode = ActionButtonMode.DISABLE;
                      }
                    }
                  } else {
                    this.actionButtonMode = ActionButtonMode.HIDE;
                    this.gameTranslate
                      .getTranslate('CHAT.TOURNAMENT_HASNT_YET')
                      .subscribe((msg) => this.enableChat$.next(msg));
                  }
                }
              } else {
                this.actionButtonMode = ActionButtonMode.HIDE;
                this.gameTranslate
                  .getTranslate('CHAT.TOURNAMENT_HASNT_YET')
                  .subscribe((msg) => this.enableChat$.next(msg));
              }
            } else {
              // After close registration.
              if (status === TournamentStatus.GOES) {
                if (!isAuthorized) {
                  this.actionButtonMode = ActionButtonMode.CREATE_ACCOUNT;
                } else {
                  this.actionButtonMode = ActionButtonMode.DISABLE;
                }
              } else if (status === TournamentStatus.COMPLETED) {
                this.actionButtonMode = ActionButtonMode.END;
              }
            }
          } else {
            if (user_signed && isAuthorized) {
              this.enableChat$.next(null);
            } else {
              this.gameTranslate
                .getTranslate('CHAT.TOURNAMENT_HASNT_YET')
                .subscribe((msg) => this.enableChat$.next(msg));
            }
            this.actionButtonMode = ActionButtonMode.HIDE;
          }
          switch (status) {
            case TournamentStatus.EXPECTED: {
              if (this.actionButtonMode === ActionButtonMode.REGISTER) {
                if (!isAuthorized && user_signed) {
                  this.enableChat$.next(null);
                  this.subscribeChat();
                } else {
                  this.gameTranslate
                    .getTranslate('CHAT.TOURNAMENT_OPEN_REGISTATION')
                    .subscribe((msg) => this.enableChat$.next(msg));
                }
              } else {
                if (this.actionButtonMode === ActionButtonMode.DISABLE) {
                  if (isAuthorized && user_signed) {
                    this.enableChat$.next(null);
                  } else {
                    this.gameTranslate
                      .getTranslate('CHAT.YOU_NOT_REGISTERED')
                      .subscribe((msg) => this.enableChat$.next(msg));
                  }
                }
              }
            }
              break;
            case TournamentStatus.GOES:
              if (user_signed === true) {
                this.enableChat$.next(null);
              } else {
                this.gameTranslate
                  .getTranslate('CHAT.YOU_NOT_REGISTERED')
                  .subscribe((msg) => this.enableChat$.next(msg));
              }
              break;
            case TournamentStatus.COMPLETED:
              this.actionButtonMode = ActionButtonMode.END;
              this.gameTranslate.getTranslate('CHAT.TOURNAMENT_END').subscribe((msg) => this.enableChat$.next(msg));
              break;
          }
          this.cdr.detectChanges();
        }
      );
  }

  private subToNoTourNotification(): void {
    this.hasNoTourNotification$
      .pipe(
        distinctUntilChanged(),
        filter((hasNoTour) => !!hasNoTour),
        delay(100),
        switchMap(() => this.gameTranslate.getTranslate('TEXT.OOPS_HAVE_OPPONENT')),
        untilDestroyed(this)
      )
      .subscribe((msg) => {
        this.modalService.alert('', msg);
        this.store.dispatch(new SetHasNoTourNotification(false));
        this.patchRemoveCl();
      });
  }

  private subToOpponentHasLeft(): void {
    this.opponentHasLeft$
      .pipe(
        distinctUntilChanged(),
        delay(100),
        filter(opponentHasLeft => !!opponentHasLeft),
        switchMap(() => {
          if (this.gameResourceService.result) {
            return this.gameTranslate.getTranslate('TEXT.OOPS_LEFT');
          } else {
            return this.gameTranslate.getTranslate('TEXT.OOPS_UNFORTUNATELY');
          }
        }),
        untilDestroyed(this)
      )
      .subscribe((msg) => {
        this.modalService.alert('', msg);
        this.patchRemoveCl();
        this.store.dispatch(new SetOpponentHasLeft(false));
      });
  }

  private subToPlayerHasLeft(): void {
    this.playerHasLeft$
      .pipe(
        distinctUntilChanged(),
        delay(100),
        filter(playerHasLeft => !!playerHasLeft),
        switchMap(() => this.gameTranslate.getTranslate('TEXT.OOPS_YOU_LOST')),
        untilDestroyed(this)
      )
      .subscribe((msg) => {
        this.modalService.alert('', msg);
        this.patchRemoveCl();
        this.store.dispatch(new SetPlayerHasLeft(false));
      });
  }

  private subToAuthorized(): void {
    this.isAuthorized$
      .pipe(
        distinctUntilChanged(),
        skip(1),
        withLatestFrom(this.routeID$),
        truthy(),
        mergeMap(([isAuthorized, tournamentId]) => {
          return this.onlineTournamentResourceService.getOnlineTournament(tournamentId);
        }),
        untilDestroyed(this))
      .subscribe((data: OnlineTournamentInterface) => {
          this.tournamentSubject$.next(data);
          this.store.dispatch(new SetOnlineTournament(data));
        });
  }

  private subToPlayerDisqualified(): void {
    this.playerDisqualified$
      .pipe(
        distinctUntilChanged(),
        filter((playerDisqualified) => !!playerDisqualified),
        delay(100),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.gameTranslate
          .getTranslate('TEXT.PLAYER_DISQUALIFIED')
          .pipe(untilDestroyed(this))
          .subscribe((msg) => {
            this.modalService.alert('', msg);
            this.patchRemoveCl();
            this.store.dispatch(new SetPlayerDisqualified(false))
          });

        this.patchRemoveCl();
      });
  }

  private getTimeLineIntervals(): (value: [TourInterface[], OnlineTournamentInterface], index: number) => Observable<any[]> {
    return ([toursBase, { number_of_tours, status, datetime_of_tournament }]) => {
      const intervals = [];

      if (toursBase && toursBase.length) {
        const tours = toursBase
          .slice()
          .sort((a, b) => moment(a.datetime_of_round).unix() - moment(b.datetime_of_round).unix());

        for (const [index, tour] of tours.entries()) {
          if (index < tours.length - 1) {
            intervals.push({
              type: RoundIntervalType.ROUND,
              tour_number: tour.tour_number,
              hide_time: false,
              datetime: {
                lower: tour.datetime_of_round,
                upper: tour.datetime_of_round_finish
                  ? tour.datetime_of_round_finish
                  : moment(tour.datetime_of_round)
                    .add(moment.duration(tour.time_control.start_time).asSeconds() * 2, 's')
                    .toISOString()
              }
            });

            intervals.push({
              type: RoundIntervalType.BREAK,
              hide_time: false,
              datetime: {
                lower: tour.datetime_of_round_finish,
                upper: tours[index + 1].datetime_of_round
              }
            });
          } else {
            // last
            intervals.push({
              type: RoundIntervalType.ROUND,
              hide_time: false,
              tour_number: tour.tour_number,
              datetime: {
                lower: tour.datetime_of_round,
                upper: tour.datetime_of_round_finish
                  ? tour.datetime_of_round_finish
                  : moment(tour.datetime_of_round)
                    .add(moment.duration(tour.time_control.start_time).asSeconds() * 2, 's')
                    .toISOString()
              }
            });
          }
        }

        intervals.push({
          type: RoundIntervalType.BREAK,
          hide_time: false,
          datetime: {
            lower: tours[tours.length - 1].datetime_of_round_finish,
            upper: moment(tours[tours.length - 1].datetime_of_round_finish)
              .add(15, 'minute')
              .toISOString()
          }
        });

        intervals.unshift({
          type: RoundIntervalType.BREAK,
          hide_time: false,
          datetime: {
            lower: moment().toISOString(),
            upper: tours[0].datetime_of_round
          }
        });
      }
      if (toursBase && [TournamentStatus.EXPECTED, TournamentStatus.GOES].includes(status)) {
        if (toursBase.length < number_of_tours && toursBase.length !== 0) {
          const lackCountTour = number_of_tours - toursBase.length;
          const lastTour = toursBase[toursBase.length - 1];
          const lastTourDate = lastTour.datetime_of_round_finish
            ? lastTour.datetime_of_round_finish
            : moment(lastTour.datetime_of_round)
              .add(moment.duration(lastTour.time_control.start_time).asSeconds() * 2, 's')
              .toISOString();

          for (let i = 1; i <= lackCountTour; i++) {
            intervals.push({
              type: RoundIntervalType.BREAK,
              hide_time: true,
              datetime: {
                lower: lastTourDate
              }
            });

            intervals.push({
              type: RoundIntervalType.ROUND,
              hide_time: true,
              tour_number: lastTour.tour_number + i,
              datetime: {}
            });
          }
        } else {
          if (toursBase.length === 0 && [TournamentStatus.EXPECTED, TournamentStatus.GOES].includes(status)) {
            for (let i = 1; i <= number_of_tours; i++) {
              intervals.push({
                type: RoundIntervalType.BREAK,
                hide_time: true,
                datetime: {}
              });

              intervals.push({
                type: RoundIntervalType.ROUND,
                hide_time: true,
                tour_number: i,
                datetime: {
                  lower: datetime_of_tournament
                }
              });
            }
          }
        }
      }
      return of(intervals);
    };
  }

  private checkTournamentStatus(status: TournamentStatus): boolean {
    return [TournamentStatus.GOES, TournamentStatus.EXPECTED].includes(status);
  }

}
