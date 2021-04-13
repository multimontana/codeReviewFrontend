import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'game-main-join-tournament',
  templateUrl: './game-main-join-tournament.component.html',
  styleUrls: ['./game-main-join-tournament.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainJoinTournamentComponent {
  @Input() tournamentCount = 0;

  constructor() {}
}
