import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'game-main-tournament',
  templateUrl: './game-main-tournament.component.html',
  styleUrls: ['./game-main-tournament.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainTournamentComponent {
  @Input() tournamentCount = 0;
  @Input() tournamentTodayCount = 0;
  @Input() onlinePlayerCount = 0;

  public cachedOnlinePlayerCount = Number(localStorage.getItem("onlineUsers"));

  constructor(private router: Router) {}

  public navigateToTournaments(): void {
    if (window['dataLayerPush']) {
      window['dataLayerPush']('wchEvent', 'Main', 'Link', 'today', '', '');
    }
    this.router.navigate(['/tournaments']);
  }
}
