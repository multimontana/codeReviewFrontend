import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { IAccount } from '@app/account/account-store/account.model';
import { ITimeControl, BoardType } from '@app/broadcast/core/tour/tour.model';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, pluck, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Select } from '@ngxs/store';
import {
  OnChangesInputObservable,
  OnChangesObservable,
} from '@app/shared/decorators/observable-input';
import { untilDestroyed } from '@app/@core';
import {
  OnlineTournamentInterface,
  OnlineTournamentStandingsInterface
} from '@app/modules/game/modules/tournaments/models';
import { OnlineTournamentService } from '@app/modules/game/modules/tournaments/services';
import { GameTranslateService } from '@app/modules/game/services/game-translate.service';
import { OnlineTournamentResourceService } from '@app/modules/game/modules/tournaments/providers/tournament.resource.service';
import { TournamentState } from '@app/modules/game/modules/tournaments/states/tournament.state';

@Component({
  selector: 'wc-tournament-certificate',
  templateUrl: './tournament-certificate.component.html',
  styleUrls: ['./tournament-certificate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentCertificateComponent implements OnInit, OnChanges, OnDestroy {

  @Select(TournamentState.getTournament) getTournament$: Observable<OnlineTournamentInterface>;

  @Input()
  account: IAccount;
  @OnChangesInputObservable('account')
  account$ = new BehaviorSubject<IAccount>(this.account);

  private getPlayerID$ = this.account$.pipe(
    filter(account => !!account),
    pluck('player', 'player_id'),
  );


  private getStandings$: Observable<OnlineTournamentStandingsInterface> =
    this.getTournament$.pipe(
      filter((tournament) => !!tournament),
      pluck('id'),
      switchMap((tournamentID) => {
        return this.onlineTournamentResourceSerivce
          .getOnlineTournamentStandings(tournamentID);
      }),
      filter(standings => !!standings)
    );

  public readonly getMyRank$: Observable<number> = this.getStandings$
    .pipe(
      pluck('data'),
      withLatestFrom(
        this.account$.pipe(
          filter((account) => !!account),
          pluck('player', 'player_id')
        )
      ),
      map(([standings, playerId]) => {
        return standings.find((standing) => standing.player_id === playerId).rank || 0;
      })
    );

  public readonly getPlayerCount$: Observable<number> = this.getStandings$
    .pipe(
      pluck('count')
    );

  constructor(
    private onlineTournamentService: OnlineTournamentService,
    private gameSharedService: GameSharedService,
    private gameTranslate: GameTranslateService,
    private cdr: ChangeDetectorRef,
    private onlineTournamentResourceSerivce: OnlineTournamentResourceService,
  ) { }

  ngOnInit(
  ) { }

  @OnChangesObservable()
  ngOnChanges() { }

  ngOnDestroy(): void {
  }

  public convertTime(timeControl: ITimeControl) {
    return this.gameSharedService.convertTime(timeControl);
  }

  public getBoardType(boardType: BoardType): Observable<string> {
    const boardTypeTitle: string = this.gameSharedService.boardTypeTitle(boardType);
    return this.gameTranslate.getTranslate(`GAME.${boardTypeTitle.toUpperCase()}`);
  }

  public downloadPDF(id: number): void {
    this.getPlayerID$.pipe(
      untilDestroyed(this)
    ).subscribe((playerID) => {
      this.onlineTournamentService.downloadPDF(id, playerID);
    })
  }
}
