import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import { filter, pluck, take } from 'rxjs/operators';
import { TournamentDataService } from '@app/modules/game/modules/tournaments/services/tournament.data.service';
import { TournamentState } from '@app/modules/game/modules/tournaments/states/tournament.state';
import { Select } from '@ngxs/store';
import { OnlineTournamentStandingsInterface, OnlineTournamentStandingInterface } from '@app/modules/game/modules/tournaments/models';
import { Observable, BehaviorSubject } from 'rxjs';
import { ICountry } from '@app/broadcast/core/country/country.model';
import { trackByIndex } from '@app/@core';
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, Output, EventEmitter, ChangeDetectorRef, AfterViewChecked, OnDestroy } from '@angular/core';

@Component({
  selector: 'wc-tournament-standings-expected',
  templateUrl: './tournament-standings-expected.component.html',
  styleUrls: ['./tournament-standings-expected.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentStandingsExpectedComponent implements OnInit, OnDestroy {

  @Output() pagination = new EventEmitter<number>();
  @ViewChild('tableContent', { static: true }) tableContent;
  @ViewChild('tableWrapper', { static: true }) tableWrapper;

  @Select(TournamentState.getStandings) getStandings$: Observable<OnlineTournamentStandingsInterface>;

  public trackByIndexFn = trackByIndex;

  public yetPlayerCount$: Observable<number> = this.tournamentDataService.getPlayerCount(this.getStandings$);

  public getPlayers$: Observable<OnlineTournamentStandingInterface[]> = this.getStandings$.pipe(
    filter((standings) => !!standings),
    pluck('data')
  );

  private offset = 0;

  constructor(
    private tournamentDataService: TournamentDataService,
    private countryService: CountryResourceService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  ngOnDestroy(): void {
  }

  public getCountryCode(id: number): Observable<string> {
    return this.countryService.getCountryCode(id);
  }

  public clickPagination(): void {
    this.getStandings$
      .pipe(
        filter(standings => !!standings),
        take(1),
      )
      .subscribe((standings) => {
        if (Math.round((standings.count / standings.data.length) - (this.offset - 1))) {
          this.offset++;
          this.pagination.emit(this.offset);
          this.cdr.detectChanges();
        }
      });
  }

  public getPlayerName(player: OnlineTournamentStandingInterface): string {
    if (player && player.full_name) {
      return player.full_name.slice(0,25) + (player.full_name.length > 25 ? '...' : '');
    } else {
      return 'Anonymous'
    }
  }
}
