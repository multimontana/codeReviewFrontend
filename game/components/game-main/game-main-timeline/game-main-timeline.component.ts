import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import * as moment from 'moment';
import { OnlineTournamentInterface } from '@app/modules/game/modules/tournaments/models';

@Component({
  selector: 'game-main-timeline',
  templateUrl: './game-main-timeline.component.html',
  styleUrls: ['./game-main-timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainTimelineComponent {

  startTime = moment().subtract({ hours: 12 });
  endTime = moment().add({ hours: 24 });

  onlineTournaments$: Observable<OnlineTournamentInterface[]> = this.gameResourceService.getOnlineTournaments(
    this.startTime.utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
    this.endTime.utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
    false,
  );

  constructor(
    private gameResourceService: GameResourceService,
  ) {

  }

}
