import { Component, Input } from '@angular/core';
import { PlayerPanelPosition } from '@app/modules/game/models';

@Component({
  selector: 'player-panel',
  templateUrl: 'player-panel.component.html',
  styleUrls: ['player-panel.component.scss']
})
export class PlayerPanelComponent {
  @Input()
  position: PlayerPanelPosition = PlayerPanelPosition.Top;

  @Input()
  name: string;

  @Input()
  rank: string;

  @Input()
  rating: number;

  @Input()
  fideId: string;

  @Input()
  avatarUrl: string;

  positions = PlayerPanelPosition;

  public get defaultAvatarUrl(): string {
    if (this.name && !this.avatarUrl) {
      return '../../../assets/images/avatar_rabbit.svg';
    }

    return '../../../assets/images/avatar_dots.svg';
  }

}
