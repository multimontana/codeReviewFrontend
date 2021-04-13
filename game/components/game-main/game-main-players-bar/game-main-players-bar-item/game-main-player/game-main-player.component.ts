import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PlayerInterface } from '@app/modules/game/models';


@Component({
  selector: 'wc-game-main-player',
  templateUrl: './game-main-player.component.html',
  styleUrls: ['./game-main-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainPlayerComponent {
  @Input() value: PlayerInterface;
}
