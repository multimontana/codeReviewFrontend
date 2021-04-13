import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'wc-game-main-chat',
  templateUrl: './game-main-chat.component.html',
  styleUrls: ['./game-main-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainChatComponent {
}
