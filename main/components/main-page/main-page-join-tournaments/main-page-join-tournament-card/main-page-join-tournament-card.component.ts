import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { OnlineTournamentInterface } from '@app/modules/game/modules/tournaments/models';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import { filter } from 'rxjs/operators';
import { GameRatingMode } from '@app/broadcast/core/tour/tour.model';
import { Router } from '@angular/router';
import { TournamentService } from '@app/modules/app-common/services/tournament.service';
import * as moment from 'moment';
import { untilDestroyed } from '@app/@core';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'main-page-join-tournament-card',
  templateUrl: './main-page-join-tournament-card.component.html',
  styleUrls: ['./main-page-join-tournament-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPageJoinTournamentCardComponent implements OnInit, OnChanges, OnDestroy {

  @Input() isDragging: boolean;

  @Input() tournament: OnlineTournamentInterface;

  public tournament$ = new BehaviorSubject<OnlineTournamentInterface>(this.tournament);
  public isDragging$ = new BehaviorSubject<boolean>(this.isDragging);

  public tournamentPlayers$ = new BehaviorSubject([]);

  public memberCounter = 0;
  public tournamentStart = '';
  public moment = moment;
  public GameRatingMode = GameRatingMode;
  public durationFormat: moment.DurationFormatSettings = {
    trim: 'both',
    trunc: true,
    usePlural: false,
    useSignificantDigits: true,
  };

  constructor(
    private countryService: CountryResourceService,
    private route: Router,
    private tournamentService: TournamentService,
    private paygateService: PaygatePopupManagerService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.tournamentService.getOnlineTournament(this.tournament.id)
      .pipe(untilDestroyed(this))
      .subscribe(t => {
        this.tournamentPlayers$.next((t.tournament_online_players || []).slice(0, 7));
      });
    this.tournament$.pipe(
      filter(tournament => !!tournament),
      untilDestroyed(this)
    )
      .subscribe(({signed_up_amount, players_amount, datetime_of_tournament}) => {
        this.memberCounter = (((signed_up_amount * 100) / players_amount) * 360) / 100;
        this.tournamentStart = moment(datetime_of_tournament).local().format('YYYY-MM-DD HH:mm:ss');
        this.cdr.detectChanges();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isDragging']) {
      this.isDragging$.next(changes['isDragging'].currentValue);
    }
    if (changes['tournament']) {
      this.tournament$.next(changes['tournament'].currentValue);
    }
  }

  ngOnDestroy(): void {
  }

  public getCountryName(code: number) {
    return this.countryService.getCountryName(code);
  }

  public gotToTournament() {
    if (!this.isDragging$.value) {
      this.paygateService.crossAppNavigate(true, `/tournament/${this.tournament.id}`, false);
    }
  }

  public getTournamentTitle(): string {
    return `${this.tournament.title} ${this.tournament.additional_title ? this.tournament.additional_title : ''}`;
  }
}
