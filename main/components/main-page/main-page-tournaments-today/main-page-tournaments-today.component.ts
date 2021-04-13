import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { GameScreenService } from '@app/modules/game/state/game.screen.service';
import { map } from 'rxjs/operators';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';
import * as moment from 'moment';

import { OnlineTournamentInterface } from '@app/modules/game/modules/tournaments/models';

@Component({
  selector: 'main-page-tournaments-today',
  templateUrl: './main-page-tournaments-today.component.html',
  styleUrls: ['./main-page-tournaments-today.component.scss']
})
export class MainPageTournamentsTodayComponent implements OnInit, OnChanges {

  @Input()
  data: OnlineTournamentInterface[] = [];

  data$ = new BehaviorSubject<OnlineTournamentInterface[]>([]);

  isSingleLine$: Observable<boolean> = combineLatest([
    this.screenService.isMobile$,
    this.data$,
  ]).pipe(
    map(([isMobile, tournaments]) => isMobile || !tournaments || tournaments && tournaments.length < 8)
  );

  tournamentsRowOne$: Observable<OnlineTournamentInterface[]> = combineLatest([
    this.isSingleLine$,
    this.data$,
  ])
    .pipe(
      map(([isSingleLine, tournaments]) => {
        if (isSingleLine) {
          return this.extendArray(tournaments);
        } else {
          return this.extendArray(tournaments.slice(0, Math.round(tournaments.length / 2)));
        }
      })
    );

  tournamentsRowTwo$: Observable<OnlineTournamentInterface[]> = combineLatest([
    this.isSingleLine$,
    this.data$,
  ])
    .pipe(
      map(([isSingleLine, tournaments]) => {
        if (isSingleLine) {
          return [];
        } else {
          return this.extendArray(tournaments.slice(Math.round(tournaments.length / 2)));
        }
      })
    );

  constructor(
    private screenService: GameScreenService,
    public paygateService: PaygatePopupManagerService
  ) {
  }

  ngOnInit(): void {
    this.data$.next(this.data);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.data$.next(changes['data'].currentValue);
    }
  }

  private extendArray(array: OnlineTournamentInterface[], minSize: number = 10): OnlineTournamentInterface[] {
    if (!array.length) {
      return array;
    }
    const res = [...array] as OnlineTournamentInterface[];
    while (res.length < minSize) {
      res.push(...array);
    }
    return res;
  }
}
