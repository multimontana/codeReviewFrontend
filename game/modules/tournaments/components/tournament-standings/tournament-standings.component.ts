import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { IAccount } from '@app/account/account-store/account.model';
import { selectMyAccount } from '@app/account/account-store/account.reducer';

import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import { OnlineTournamentInterface, OnlineTournamentStandingsInterface } from '@app/modules/game/modules/tournaments/models';
import { TournamentDataService } from '@app/modules/game/modules/tournaments/services/tournament.data.service';
import { OnlineTournamentService } from '@app/modules/game/modules/tournaments/services/tournament.service';
import { TournamentState } from '@app/modules/game/modules/tournaments/states/tournament.state';
import * as fromRoot from '@app/reducers';
import { select, Store as NGRXStore } from '@ngrx/store';
import { Select } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, shareReplay, take } from 'rxjs/operators';

@Component({
  selector: 'wc-tournament-standings',
  templateUrl: './tournament-standings.component.html',
  styleUrls: ['./tournament-standings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentStandingsComponent implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  @Input() tournamentId: string;
  @Output() pagination = new EventEmitter<number>();

  @ViewChild('tableContent', { static: true }) tableContent;
  @ViewChild('tableWrapper', { static: true }) tableWrapper;

  @Select(TournamentState.getTournament) tournament$: Observable<OnlineTournamentInterface>;
  @Select(TournamentState.getStandings) getStandings$: Observable<OnlineTournamentStandingsInterface>;

  public Math = Math;
  public tableShadow$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public openTable$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public account$: Observable<IAccount> = this.store$.pipe(
    select(selectMyAccount),
    shareReplay(1)
  );
  public yetPlayerCount$: Observable<number> = this.tournamentDataService.getPlayerCount(this.getStandings$);

  private offset = 0;

  constructor(
    public tournamentService: OnlineTournamentService,
    private countryService: CountryResourceService,
    private store$: NGRXStore<fromRoot.State>,
    private tournamentDataService: TournamentDataService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngAfterViewChecked(): void {
    this.addShadow();
  }

  ngOnDestroy(): void {
  }


  public getCountryCode(id: number): Observable<string> {
    return this.countryService.getCountryCode(id);
  }

  private addShadow(): void {
    this.tableShadow$.next(this.tableContent.nativeElement.clientHeight > this.tableWrapper.nativeElement.clientHeight);
  }

  public clickPagination(): void {
    this.getStandings$
      .pipe(
        filter(standings => !!standings),
        take(1)
      )
      .subscribe((standings) => {
        if (Math.round((standings.count / standings.data.length) - (this.offset - 1))) {
          this.offset++;
          this.pagination.emit(this.offset);
          this.cdr.detectChanges();
        }
      });
  }

  public clickOpenTable(): void {
    this.openTable$.next(!this.openTable$.value);
  }
}
