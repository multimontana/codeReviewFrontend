import * as moment from 'moment';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { BoardType, GameRatingMode } from '@app/broadcast/core/tour/tour.model';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import { GameTranslateService } from '@app/modules/game/services/game-translate.service';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { ICountry } from '@app/broadcast/core/country/country.model';
import { OnlineTournamentInterface } from '@app/modules/game/modules/tournaments/models';
import { Router } from '@angular/router';
import { OnlineTournamentService } from '../../services';
import { TournamentStatus } from '@app/broadcast/core/tournament/tournament.model';

@Component({
  selector: 'wc-tournament-card',
  templateUrl: './tournament-card.component.html',
  styleUrls: ['./tournament-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentCardComponent implements OnInit {
  @Input()
  tournament: OnlineTournamentInterface;
  @Input()
  width = 280;
  @Input()
  fullWidthMobile = false;

  public moment = moment;
  public memberCounter = 0;
  public GameRatingMode = GameRatingMode;
  public durationFormat: moment.DurationFormatSettings = {
    trim: 'both',
    trunc: true,
    usePlural: false,
    useSignificantDigits: true
  };

  private countries$: BehaviorSubject<ICountry[]> = new BehaviorSubject([]);

  constructor(
    public onlineTournamentService: OnlineTournamentService,
    private gameSharedService: GameSharedService,
    private countryService: CountryResourceService,
    private route: Router,
    private gameTranslateService: GameTranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.countryService.getAll().subscribe(this.countries$);
  }

  ngOnInit() {
    this.initMemberCounter();
  }

  public boardTypeTitle(boardType: BoardType): string {
    return this.gameSharedService.boardTypeTitle(boardType);
  }

  public getBoardType(): string {
    if (Object.keys(this.tournament).length) {
      const boardType = this.tournament.time_control.board_type;
      return this.gameSharedService.boardTypeTitle(boardType);
    } else {
      return '';
    }
  }

  public getCountryName(code: number): Observable<string> {
    return this.countryService.getCountryName(code);
  }

  public getBoardTypeTitle(boardType: string = ''): Observable<string> {
    if (boardType) {
      return this.gameTranslateService.getTranslate(`GAME.${boardType.toUpperCase()}`);
    } else {
      return of(null);
    }
  }

  public goToTournament(): void {
    this.route.navigate([`/tournament/${this.tournament.id}`]).then();
  }

  public isFideTournament(): boolean {
    return this.tournament.rating_type === GameRatingMode.FIDERATED;
  }

  public isMtsTournament(): boolean {
    return this.tournament.sponsor === 'mts';
  }

  public getTournamentTitle(): string {
    return `${this.tournament.title} ${this.tournament.additional_title ? this.tournament.additional_title : ''}`;
  }

  private initMemberCounter(): void {
    if (this.tournament.status === TournamentStatus.EXPECTED) {
      this.memberCounter = (this.tournament.signed_up_amount * 100 / this.tournament.players_amount) * 360 / 100;
    } else {
      this.memberCounter = null;
    }
    this.cdr.detectChanges();
  }
}
