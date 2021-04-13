import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlayerResourceService } from '@app/broadcast/core/player/player-resource.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'game-main-find-opponent',
  templateUrl: './game-main-find-opponent.component.html',
  styleUrls: ['./game-main-find-opponent.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainFindOpponentComponent {
  window = window;

  public playersCount$: Observable<string> = this.playerResourceService.getAllCount().pipe(startWith('-'), map(v => `${v || 0}`));

  constructor(
    private playerResourceService: PlayerResourceService,
  ) {
  }
}
