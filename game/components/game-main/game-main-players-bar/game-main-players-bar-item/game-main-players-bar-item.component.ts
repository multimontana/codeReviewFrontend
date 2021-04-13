import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BarItemInterface } from '@app/modules/game/models';

@Component({
  selector: 'wc-game-main-players-bar-item',
  templateUrl: './game-main-players-bar-item.component.html',
  styleUrls: ['./game-main-players-bar-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainPlayersBarItemComponent {

  @Input() value: BarItemInterface;

}
