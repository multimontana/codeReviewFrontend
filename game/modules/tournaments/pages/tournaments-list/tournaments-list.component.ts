// core
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

// store
import { selectIsAuthorized } from '@app/auth/auth.reducer';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '@app/reducers';

// rxjs
import { Observable, Subject } from 'rxjs';

// 3th party
import * as moment from 'moment';

// components
import { OnlineTournamentInterface } from '@app/modules/game/modules/tournaments/models';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { GamingSelectorMode } from '@app/modules/game/models';


@Component({
  selector: 'wc-tournaments-list-page',
  templateUrl: './tournaments-list.component.html',
  styleUrls: ['./tournaments-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentsListComponent implements OnInit {
  GamingSelectorMode = GamingSelectorMode;

  destroy$ = new Subject();
  onlineTournaments$: Observable<OnlineTournamentInterface[]>;
  myUpcomingTournaments$: Observable<OnlineTournamentInterface[]>;

  startTime = moment().subtract({ hours: 12 });
  endTime = moment().add({ hours: 24 });
  isAuthorized$ = this.store.pipe(
    select(selectIsAuthorized),
  );

  constructor(
    private gameResourceService: GameResourceService,
    private store: Store<fromRoot.State>
  ) {
    this.onlineTournaments$ = this.gameResourceService.getOnlineTournaments(
      this.startTime.utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
      this.endTime.utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
      false,
    );
    this.myUpcomingTournaments$ = this.gameResourceService.getOnlineTournaments(
      moment().utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
      this.endTime.utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
      true,
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
