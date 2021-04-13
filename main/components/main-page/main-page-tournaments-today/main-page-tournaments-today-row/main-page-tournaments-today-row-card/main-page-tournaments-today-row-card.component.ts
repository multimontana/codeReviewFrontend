import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Router } from '@angular/router';
import { untilDestroyed } from '@app/@core';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import { GameRatingMode } from '@app/broadcast/core/tour/tour.model';
import { OnlineTournamentInterface } from '@app/modules/game/modules/tournaments/models/tournament';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
// @todo use date-fns instead
import moment = require('moment');

@Component({
  selector: 'main-page-tournaments-today-row-card',
  templateUrl: './main-page-tournaments-today-row-card.component.html',
  styleUrls: ['./main-page-tournaments-today-row-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPageTournamentsTodayRowCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isDragging: boolean;
  @Input() tournament: OnlineTournamentInterface;
  @OnChangesInputObservable('tournament') tournament$ = new BehaviorSubject<OnlineTournamentInterface>(this.tournament);

  public memberCounter$: BehaviorSubject<number> = new BehaviorSubject(0);
  public tournamentStart$: BehaviorSubject<string> = new BehaviorSubject('');
  public readonly GameRatingMode = GameRatingMode;
  public readonly moment = moment;
  public readonly durationFormat: moment.DurationFormatSettings = {
    trim: 'both',
    trunc: true,
    usePlural: false,
    useSignificantDigits: true
  };

  constructor(
    private countryService: CountryResourceService,
    private route: Router,
    private paygateService: PaygatePopupManagerService,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.subToTournament();
  }

  @OnChangesObservable()
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isDragging']) {
      this.isDragging = changes['isDragging'].currentValue;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
  }

  public getCountryName(code: number): Observable<string> {
    return this.countryService.getCountryName(code);
  }

  public gotToTournament(): void {
    if (!this.isDragging) {
      this.paygateService.crossAppNavigate(true, `/tournament/${this.tournament.id}`, false);
    }
  }

  public getTournamentTitle(): string {
    return `${this.tournament.title} ${this.tournament.additional_title ? this.tournament.additional_title : ''}`;
  }

  private subToTournament(): void {
    this.tournament$
      .pipe(
        filter(tournament => !!tournament),
        untilDestroyed(this)
      )
      .subscribe(({ signed_up_amount, players_amount, datetime_of_tournament }) => {
        this.memberCounter$.next((((signed_up_amount * 100) / players_amount) * 360) / 100);
        // @todo use date-fns instead
        this.tournamentStart$.next(moment(datetime_of_tournament).local().format('YYYY-MM-DD HH:mm:ss'));
      });
  }
}
