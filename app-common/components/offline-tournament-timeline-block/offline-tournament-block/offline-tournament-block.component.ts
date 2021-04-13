import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ITournament } from '@app/modules/main/model/tournament';

@Component({
  selector: 'offline-tournament-block',
  templateUrl: './offline-tournament-block.component.html',
  styleUrls: ['./offline-tournament-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfflineTournamentBlockComponent implements OnInit, OnChanges {
  @Input() data: ITournament[];
  @Input() hideButton = false;

  public tournaments$: BehaviorSubject<ITournament[]> = new BehaviorSubject<ITournament[]>([]);

  constructor() { }

  ngOnInit() {
   this.tournaments$.next(this.data || []);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'].currentValue !== this.tournaments$.value) {
      this.tournaments$.next(changes['data'].currentValue || []);
    }
  }
}
