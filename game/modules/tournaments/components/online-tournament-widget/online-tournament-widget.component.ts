import * as fromRoot from '@app/reducers';

import { BehaviorSubject, combineLatest, Observable, of, zip } from 'rxjs';
import { BoardNotificationSocketAction, SocketMessageInterface, SocketSendMessageInterface, SocketType } from '@app/auth/auth.model';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { IMove, IMovePosition, MoveReaction } from '@app/broadcast/move/move.model';
import { OnlineTournamentBoardInterface, OnlineTournmanetWidgetTimeBoardInterface } from '@app/modules/game/modules/tournaments/models';
import { select, Store as NGRXStore } from '@ngrx/store';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { defaultIfEmpty, distinctUntilChanged, filter, first, map, shareReplay, switchMap, withLatestFrom } from 'rxjs/operators';

import { BoardResult, BoardStatus } from '@app/broadcast/core/board/board.model';
import { ChessBoardViewMode } from '@app/broadcast/chess/chess-page/chess-board/chess-board.component';
import { Color } from 'chessground/types';
import { IAccount } from '@app/account/account-store/account.model';
import { PlayerInterface } from '@app/broadcast/core/player/player.model';
import { ITourMoves } from '@app/broadcast/core/tour/tour.model';
import { OnlineTournamentService } from '@app/modules/game/modules/tournaments/services/tournament.service';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { Router } from '@angular/router';
import { SocketConnectionService } from '@app/auth/socket-connection.service';
import { TourResourceService } from '@app/broadcast/core/tour/tour-resource.service';
import { selectMyAccount } from '@app/account/account-store/account.reducer';
import { selectToken } from '@app/auth/auth.reducer';
import { untilDestroyed } from '@app/@core';
import * as moment from 'moment';
import { SocketService } from '@app/shared/socket/socket.service';

@Component({
  selector: 'wc-online-tournament-widget',
  templateUrl: './online-tournament-widget.component.html',
  styleUrls: ['./online-tournament-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnlineTournamentWidgetComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  viewMode = ChessBoardViewMode.GamingNormal;

  @Input()
  board: OnlineTournamentBoardInterface;
  @OnChangesInputObservable('board')
  boardInput$ = new BehaviorSubject<OnlineTournamentBoardInterface>(this.board);

  @Input()
  showCountdown: boolean;
  @OnChangesInputObservable('showCountdown')
  showCountdown$ = new BehaviorSubject<boolean>(this.showCountdown);

  @Input()
  needResubscribe: boolean;
  @OnChangesInputObservable('needResubscribe')
  needResubscribe$ = new BehaviorSubject<boolean>(this.needResubscribe);

  @Input()
  bottomPlayerColor: Color = 'white';

  public position$ = new BehaviorSubject<IMovePosition>(null);
  public widgetTimeBoard: OnlineTournmanetWidgetTimeBoardInterface = {
    blackTime: '00:00',
    whiteTime: '00:00',
  };

  public moveScore$: Observable<number>;
  public moveReaction$: Observable<number>;
  public board$: Observable<OnlineTournamentBoardInterface> = this.boardInput$.pipe(
    filter(board => Boolean(board)),
    shareReplay(1)
  );

  public isShowCountdown$: Observable<boolean>;
  public countdownTimer$ = this.board$.pipe(
    map(i => i.tour_id),
    switchMap(id => {
      return this.tourService.getWithDefaults(id).pipe(
        map(m => moment(m.tour.datetime_of_round).diff(moment(), 'seconds')),
      );
    })
  );

  public blackPlayer: PlayerInterface;
  public blackCountry: string;

  public whitePlayer: PlayerInterface;
  public whiteCountry: string;

  public account$: Observable<IAccount> = this.store$.pipe(
    select(selectMyAccount),
    shareReplay(1)
  );

  public BoardResult = BoardResult;
  public BoardStatus = BoardStatus;

  // @todo How to detect when board or moves is loading? Create props into store (board, moves).
  private isLoading$: Observable<boolean> = this.board$.pipe(
    map(board => !board),
    shareReplay(1)
  );

  private isNotExpected$: Observable<boolean> = this.board$.pipe(
    map(board => board.status !== BoardStatus.EXPECTED),
    shareReplay(1)
  );

  private move$: Observable<ITourMoves[]> = this.board$.pipe(
    map(board => board.moves),
    filter(moves => moves.length > 0),
    defaultIfEmpty(null),
    shareReplay(1)
  );

  private hideCounter = true;
  private countries$ = this.paygatePopupService.countries$;

  private currentPosition$: Observable<IMovePosition | null> = zip(this.isLoading$, this.isNotExpected$).pipe(
    // When all moves is loaded.
    switchMap(([isLoading, isNotExpected]) => !isLoading && isNotExpected
      ? this.position$
      : of(null)
    ));

  private token$ = this.store$.pipe(
    select(selectToken)
  );

  private localBoard = {
    boardId: '',
    moves: []
  };

  private static getHHss(seconds: number): string {
    return moment().startOf('day').seconds(seconds).format('mm:ss');
  }

  constructor(
    private store$: NGRXStore<fromRoot.State>,
    private paygatePopupService: PaygatePopupService,
    private tourService: TourResourceService,
    private socketService: SocketConnectionService<SocketMessageInterface, SocketSendMessageInterface>,
    private router: Router,
    private tournamentService: OnlineTournamentService,
    private cdr: ChangeDetectorRef
  ) {
    this.initMoveScore();
    this.initMoveReaction();
    this.initShowCountdown();
  }

  ngOnInit() {
    this.subToNeedResubscribe();
    this.subToBoard();
    this.listenSocketByMoves();
    this.setCountryByPlayers();
  }

  @OnChangesObservable()
  ngOnChanges() {}

  ngOnDestroy(): void {}

  public goToBoard(): void {
    this.board$.pipe(
      untilDestroyed(this)
    ).subscribe(board => {
      this.router.navigate([`/tournament/pairing/${board.board_id}/`]).then(() => {});
    });
  }

  private setCountryByPlayers(): void {
    combineLatest([
      this.token$,
      this.board$,
      this.countries$,
    ]).pipe(
      untilDestroyed(this)
    ).subscribe(([ token, {black_player, white_player}, countries,
      ]) => {
      this.blackPlayer = black_player;
      this.whitePlayer = white_player;
      if ( black_player.nationality_id) {
        this.blackCountry = countries.find(c => c.id === black_player.nationality_id).long_code;
      }
      if (white_player.nationality_id) {
        this.whiteCountry = countries.find(c => c.id === white_player.nationality_id).long_code;
      }
      this.cdr.detectChanges();
    });
  }

  private listenSocketByMoves(): void {
    const isGameMessage = message => [
      BoardNotificationSocketAction.GAMING_SUBSCRIBE_VIEWER_TO_BOARD,
      BoardNotificationSocketAction.GAMING_ADD_MOVE,
      BoardNotificationSocketAction.GAMING_GAME_END,
      BoardNotificationSocketAction.GAMING_GAME_ABORT,
    ].includes(message.action);

    combineLatest([
      this.socketService.messages$
        .pipe(
          filter(isGameMessage),
        ),
      this.board$,
    ]).pipe(
      untilDestroyed(this)
    ).subscribe(([message, board]) => {
        switch (message.action) {
          case BoardNotificationSocketAction.GAMING_SUBSCRIBE_VIEWER_TO_BOARD: {
            this.localBoard.boardId = board.board_id;
            if (message.moves.length > 0  && board.board_id === message.board_id && message.moves.length !== board.moves.length) {
              this.hideCounter = false;
              message.moves.forEach(move => {
                if (move.is_white_move) {
                  this.widgetTimeBoard.whiteTime = move.time_left.substr(3, move.time_left.length - 3);
                } else {
                  this.widgetTimeBoard.blackTime = move.time_left.substr(3, move.time_left.length - 3);
                }
                this.position$.next(move);
                this.localBoard.moves.push(move);
              });
            }
            break;
          }
          case BoardNotificationSocketAction.GAMING_ADD_MOVE: {
            if ( board.board_id === message.board_id && message['message_type'] === SocketType.BOARD_NOTIFICATION ) {
              if (message.move.is_white_move) {
                this.widgetTimeBoard.whiteTime = message.move.time_left.substr(3, message.move.time_left.length - 3);
              } else {
                this.widgetTimeBoard.blackTime = message.move.time_left.substr(3, message.move.time_left.length - 3);
              }
              this.position$.next(message.move);
              this.localBoard.moves.push(message.move);
            }
            break;
          }
          case BoardNotificationSocketAction.GAMING_GAME_END: {
            if (board.board_id === message.board_id) {
              this.widgetTimeBoard.blackTime = OnlineTournamentWidgetComponent.getHHss(message['black_seconds_left']);
              this.widgetTimeBoard.whiteTime = OnlineTournamentWidgetComponent.getHHss(message['white_seconds_left']);
            }
            break;
          }
          case BoardNotificationSocketAction.GAMING_GAME_ABORT: {
            if (board.board_id === message.board_id) {
              this.widgetTimeBoard.blackTime = OnlineTournamentWidgetComponent.getHHss(message['black_seconds_left']);
              this.widgetTimeBoard.whiteTime = OnlineTournamentWidgetComponent.getHHss(message['white_seconds_left']);
            }
            break;
          }
        }
        this.cdr.detectChanges();
      });
  }

  private initMoveScore(): void {
    this.moveScore$ = this.currentPosition$.pipe(
      map((move: IMove) => move ? move.stockfish_score : 0),
      shareReplay(1)
    );
  }

  private initMoveReaction(): void {
    this.moveReaction$ = this.currentPosition$.pipe(
      map((move: IMove) => move ? move.reaction : null),
      filter(reaction => [
        MoveReaction.MATE_IN_LS_10,
        MoveReaction.MAJOR_CHANGE_OF_SITUATION,
        MoveReaction.BLUNDER].includes(reaction)
      ),
      shareReplay(1)
    );
  }

  private initShowCountdown(): void {
    this.isShowCountdown$ = combineLatest([
      this.board$,
      this.showCountdown$,
      this.account$.pipe(
        filter(account => !!account)
      ),
    ]).pipe(
      map(([ board, showCoutdown, account ]) => {
        return !board.result && showCoutdown && (
          (board.black_id === account.player.player_id) ||
          (board.white_id === account.player.player_id)
        ) && this.hideCounter;
      })
    );
  }

  private subToNeedResubscribe(): void {
    this.needResubscribe$.pipe(
      distinctUntilChanged(),
      withLatestFrom(this.board$),
      untilDestroyed(this)
    ).subscribe(([needResubscribe, board]) => {
      if (needResubscribe && board && board.board_id && !board.result) {
        this.tournamentService.subscribeViewerByBoardID(board.board_id);
      }
    });
  }

  private subToBoard(): void {
    let subscribeBoards = true;

    this.board$.pipe(
      filter(board => !!board),
      first(),
    ).subscribe( (board) => {
      if (!board.result) {
        if (subscribeBoards) {
          this.tournamentService.subscribeViewerByBoardID(board.board_id);
          subscribeBoards = false;
        }
      } else {
        this.localBoard.boardId = board.board_id;
        this.move$.subscribe(moves => {
          if (moves) {
            if (this.localBoard.boardId === board.board_id && this.localBoard.moves.length !== moves.length) {
              this.addMoves(moves);
            }
            if (this.localBoard.moves.length !== moves.length) {
              this.addMoves(moves);
            }
          }
        });
        if (board.black_seconds_left) {
          this.widgetTimeBoard.blackTime = OnlineTournamentWidgetComponent.getHHss(board.black_seconds_left);
        }
        if (board.white_seconds_left) {
          this.widgetTimeBoard.whiteTime = OnlineTournamentWidgetComponent.getHHss(board.white_seconds_left);
        }
      }
      this.cdr.detectChanges();
    });
  }

  private addMoves(moves: ITourMoves[]) {
    moves.forEach(m => {
      this.position$.next(m);
      if (m.is_white_move) {
        this.widgetTimeBoard.whiteTime = m.time_left.substr(3, m.time_left.length - 3);
      } else {
        this.widgetTimeBoard.blackTime = m.time_left.substr(3, m.time_left.length - 3);
      }
    });
    this.cdr.detectChanges();
  }
}
