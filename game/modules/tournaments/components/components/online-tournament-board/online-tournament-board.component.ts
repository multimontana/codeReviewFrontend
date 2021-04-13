import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, Input, OnDestroy, SimpleChanges } from '@angular/core';
import { TourInterface } from '@app/broadcast/core/tour/tour.model';
import { OnChangesObservable, OnChangesInputObservable } from '@app/shared/decorators/observable-input';
import { BehaviorSubject, EMPTY, Observable, interval, merge, of, forkJoin, combineLatest } from 'rxjs';
import { distinctUntilChanged, pluck, filter, switchMap, map, first, withLatestFrom, tap, startWith, debounceTime, distinct } from 'rxjs/operators';
import {
  OnlineTournamentBoardInterface, OnlineTournamentBoardsInterface,
  OnlineTournamentInterface
} from '@app/modules/game/modules/tournaments/models';
import { OnlineTournamentResourceService } from '@app/modules/game/modules/tournaments/providers/tournament.resource.service';
import { IAccount } from '@app/account/account-store/account.model';
import { TournamentStatus } from '@app/broadcast/core/tournament/tournament.model';
import { GameState } from '@app/modules/game/state/game.state';
import { Select } from '@ngxs/store';
import { BoardResult, BoardStatus } from '@app/broadcast/core/board/board.model';
import { untilDestroyed } from '@app/@core';


@Component({
  selector: 'wc-online-tournament-board',
  templateUrl: './online-tournament-board.component.html',
  styleUrls: ['./online-tournament-board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnlineTournamentBoardComponent implements OnInit, OnChanges, OnDestroy {

  @Select(GameState.connectionActive) connectionActive$: Observable<boolean>;

  private offset = 0;
  private limit = 0;
  private defaultLimit = 20;
  private intervalBoards$ = interval(4000);


  @Input() selectedTour: TourInterface;
  @OnChangesInputObservable('selectedTour')
  private selectedTour$ = new BehaviorSubject<TourInterface>(this.selectedTour);
  private tourID$: Observable<number> = this.selectedTour$.pipe(
    filter((selectedTour) => !!selectedTour),
    pluck('id'),
    distinct()
  );

  @Input() tournament: OnlineTournamentInterface;

  @Input() account: IAccount;
  @OnChangesInputObservable('account')
  account$ = new BehaviorSubject<IAccount>(this.account);

  @Input() currentTour: number | null;

  public expandedBoard = null;
  public boardResourceTour$ = new BehaviorSubject<OnlineTournamentBoardsInterface>(null);

  public boardSelectTour$: Observable<OnlineTournamentBoardInterface[]> = this.boardResourceTour$
    .pipe(
      filter(boards => !!boards),
      pluck('results'),
      map((boards) =>
      boards.map((board) => ({
        ...board,
        ratingBoard: board.black_player.rating + board.white_player.rating,
        last_move: board.moves.slice(-1).pop(),
        expand: board.board_id === this.expandedBoard
      }))
    )
  );


  public yetBoardCount$: Observable<number> = this.boardResourceTour$.pipe(
    filter(boards => !!boards),
    map((boards) => {
      return boards.count - boards.results.length;
    })
  );

  public needResubscribe$ = this.connectionActive$
    .pipe(
      distinctUntilChanged()
  );

  public BoardResult = BoardResult;
  public BoardStatus = BoardStatus;

  constructor(
    private onlineTournamentResourceService: OnlineTournamentResourceService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.updateInterval();
  }

  @OnChangesObservable()
  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedTour) {
      this.updateBoards();
    }
  }

  ngOnDestroy(): void { }

  public onOverWidget(e, b) {
    this.expandedBoard = b.board_id;
    b.expand = true;
  }

  public onOutWidget(e, b) {
    this.expandedBoard = null;
    b.expand = false;
  }

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

  public clickPagination() {
    this.offset++;
    this.limit = this.defaultLimit * (this.offset + 1);
    this.updateBoards();
  }

  public disableWidget(board: OnlineTournamentBoardInterface): boolean {
    let isDisableWidget = false;
    if (board.status === BoardStatus.COMPLETED) {
      isDisableWidget = true;
    }

    return isDisableWidget;
  }

  private updateBoards(): void {
    this.tourID$.pipe(
      first(),
      switchMap((tourId) => {
        if (this.tournament) {
          return this.onlineTournamentResourceService.getBoardsByTour(
            this.tournament.id, tourId, this.limit, 0
          );
        }
        return EMPTY;
      })
    ).subscribe((data) => {
      this.boardResourceTour$.next(data);
    });
  }

  private updateInterval(): void {
    if (this.tournament.status !== TournamentStatus.COMPLETED) {
      this.intervalBoards$
        .pipe(untilDestroyed(this))
        .subscribe((data) => this.updateBoards());
    }
  }

  public trackByFn(index, item) {
    return item.board_id;
  }
}
