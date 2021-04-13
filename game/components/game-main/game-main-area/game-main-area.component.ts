import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'wc-game-main-area',
  templateUrl: './game-main-area.component.html',
  styleUrls: ['./game-main-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainAreaComponent {
}
