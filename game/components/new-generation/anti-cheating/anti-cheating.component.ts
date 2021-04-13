import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { BehaviorSubject } from 'rxjs';
import { OnlineTournamentInterface } from '@app/modules/game/modules/tournaments/models';
import { Select } from '@ngxs/store';
import { TournamentState } from '@app/modules/game/modules/tournaments/states/tournament.state';
import { TournamentStatus } from '@app/broadcast/core/tournament/tournament.model';
import { first } from 'rxjs/operators';
@Component({
  selector: 'anti-cheating',
  templateUrl: './anti-cheating.component.html',
  styleUrls: ['./anti-cheating.component.scss']
})
export class AntiCheatingComponent implements OnInit, OnChanges {

  @Select(TournamentState.getTournament) tournament$: Observable<OnlineTournamentInterface>;

  @Input()
  isReportSubmitted = false;
  @Output()
  closePopup = new EventEmitter();
  @Output()
  reportRequest = new EventEmitter();

  isReportSubmitted$ = new BehaviorSubject(false);

  constructor() { }

  ngOnInit() {
  }

  closeAntiCheatPopup() {
    this.closePopup.emit();

    this.tournament$.pipe(first()).subscribe((tournament) => {
      window['dataLayerPush'](
        'whcTournament',
        'Tournament',
        'Camera',
        'Tournaments icon',
        tournament.title,
        '',
        tournament.id,
        tournament.status === TournamentStatus.EXPECTED ? 'future' : tournament.status === TournamentStatus.GOES ? 'actual' : 'ended'
      );
    })
  }

  sendReport() {
    this.reportRequest.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isReportSubmitted']) {
      this.isReportSubmitted$.next(changes['isReportSubmitted'].currentValue);
    }
  }
}
