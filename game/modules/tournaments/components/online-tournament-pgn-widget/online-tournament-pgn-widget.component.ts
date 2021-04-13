import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { distinctUntilChanged, filter, map, shareReplay, takeUntil } from 'rxjs/operators';

import { OnlineTournamentBoardInterface } from '@app/modules/game/modules/tournaments/models';
import { PlayerInterface } from '@app/broadcast/core/player/player.model';
import { OnlineTournamentService } from '@app/modules/game/modules/tournaments/services/tournament.service';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { untilDestroyed } from '@app/@core';

@Component({
  selector: 'wc-online-tournament-pgn-widget',
  templateUrl: './online-tournament-pgn-widget.component.html',
  styleUrls: ['./online-tournament-pgn-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnlineTournamentPgnWidgetComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  board: OnlineTournamentBoardInterface;


  @OnChangesInputObservable('board')
  boardInput$ = new BehaviorSubject<OnlineTournamentBoardInterface>(this.board);
  countries$ = this.paygatePopupService.countries$;
  board$: Observable<OnlineTournamentBoardInterface> = this.boardInput$.pipe(
    filter(board => Boolean(board)),
    shareReplay(1)
  );


  blackPlayer: PlayerInterface;
  whitePlayer: PlayerInterface;
  blackCountry: string;
  whiteCountry: string;
  boardID: string | null;

  constructor(
    private paygatePopupService: PaygatePopupService,
    private onlineTournamentSerivce: OnlineTournamentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    combineLatest([
      this.board$,
      this.countries$,
    ]).pipe(
      distinctUntilChanged(),
      untilDestroyed(this),
    ).subscribe( ([{ board_id, black_player, white_player }, countries]) => {
      this.blackPlayer = black_player;
      this.whitePlayer = white_player;
      this.boardID = board_id;

      if ( black_player.nationality_id) {
        this.blackCountry = countries.find(c => c.id === black_player.nationality_id).long_code;
      }

      if (white_player.nationality_id) {
        this.whiteCountry = countries.find(c => c.id === white_player.nationality_id).long_code;
      }
    });
  }

  @OnChangesObservable()
  ngOnChanges(): void {}

  ngOnDestroy(): void { }

  public downloadPGN() {
    if (this.boardID) {
      this.onlineTournamentSerivce.downloadPGN(this.boardID);
    }
  }
}
