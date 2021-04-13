import { GameTranslateService } from '../../../../services/game-translate.service';
import { filter, map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChangeDetectionStrategy, Component, Inject, Input, LOCALE_ID, OnChanges } from '@angular/core';
import { GameRatingMode } from '@app/broadcast/core/tour/tour.model';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { DatePipe } from '@angular/common';
import moment = require('moment');
import { OnlineTournamentInterface } from '@app/modules/game/modules/tournaments/models';
import { TournamentStatus } from '@app/broadcast/core/tournament/tournament.model';
import { OnlineTournamentService } from '@app/modules/game/modules/tournaments/services';

@Component({
  selector: 'wc-game-main-tournament-pane',
  templateUrl: './game-main-tournament-pane.component.html',
  styleUrls: ['./game-main-tournament-pane.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainTournamentPaneComponent implements OnChanges {

  @Input() tournament: OnlineTournamentInterface;

  @OnChangesInputObservable('tournament')
  tournament$ = new BehaviorSubject<OnlineTournamentInterface>(this.tournament);

  public readonly memberCounter$: Observable<number | null> = this.tournament$.pipe(
    filter(tournament => !!tournament),
    map(({ signed_up_amount, players_amount, status }) => {
      if (status === TournamentStatus.EXPECTED) {
        return (((signed_up_amount * 100) / players_amount) * 360) / 100;
      }
      return null;
    })
  );
  public readonly tournamentDate$ = this.tournament$.pipe(
    filter(t => !!t),
    map(({datetime_of_tournament}) => {
      return moment(datetime_of_tournament).local().format('YYYY-MM-DD HH:mm:ss');
    })
  );
  public readonly tournamentStartTime$ = this.tournamentDate$.pipe(
    filter((t) => !!t),
    map((tournamentDate) => {
      return moment(tournamentDate).format('HH:mm');
    })
  );
  public readonly countryName$ = this.tournament$.pipe(
    filter(t => !!t && !!t.country),
    switchMap(t => this.countryService.getCountryName(t.country)),
  );
  public readonly boardTypeTitle$ = this.tournament$.pipe(
    map(tournament => this.gameSharedService.boardTypeTitle(tournament.time_control.board_type)),
    switchMap(boardType => this.gameTranslateService.getTranslate(`GAME.${boardType.toUpperCase()}`)),
  );
  public readonly day$ = this.tournamentDate$.pipe(
    map((time) => moment(time).locale('en').format('dddd')),
    switchMap((day) => this.gameTranslateService.getTranslate(`TIME.${day.toUpperCase()}`))
  );
  moment = moment;
  GameRatingMode = GameRatingMode;

  public durationFormat: moment.DurationFormatSettings = {
    trim: 'both',
    trunc: true,
    usePlural: false,
    useSignificantDigits: true,
  };

  constructor(
    public onlineTournamentService: OnlineTournamentService,
    private gameSharedService: GameSharedService,
    private countryService: CountryResourceService,
    private gameTranslateService: GameTranslateService,
    @Inject(LOCALE_ID) private locale: string,
  ) {}


  @OnChangesObservable()
  ngOnChanges() { }

  public getTournamentTitle(): string {
    return `${this.tournament.title} ${this.tournament.additional_title ? this.tournament.additional_title : ''}`;
  }
}
