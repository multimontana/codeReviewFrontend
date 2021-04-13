import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'wc-game-main-updates',
  templateUrl: './game-main-updates.component.html',
  styleUrls: ['./game-main-updates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainUpdatesComponent {
  window = window;
}
