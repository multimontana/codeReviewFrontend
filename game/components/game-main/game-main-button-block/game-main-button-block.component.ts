import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { SetQuickstartFlag } from '@app/modules/game/state/game.actions';
import { StartEnum } from '@app/modules/game/models';
import { Store } from '@ngxs/store';
import { take } from 'rxjs/operators';

@Component({
  selector: 'wc-game-main-button-block',
  templateUrl: './game-main-button-block.component.html',
  styleUrls: ['./game-main-button-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainButtonBlockComponent {
  window = window;

  constructor(
    private store: Store,
    private router: Router,
  ) {
  }

  quickStart(e: MouseEvent) {
    this.store.dispatch(new SetQuickstartFlag(StartEnum.Quickstart)).pipe(take(1)).subscribe(_ => {
      this.router.navigate(['/singlegames']);
    });
    window['dataLayerPush']('wchEvent', 'Main', 'Button', 'Quick game', '', '');
  }

  lobby(e: MouseEvent) {
    this.router.navigate(['/singlegames']);
    window['dataLayerPush']('wchEvent', 'Main', 'Button', 'Lobby', '', '');
  }

  playComputer(e: MouseEvent) {
    this.store.dispatch(new SetQuickstartFlag(StartEnum.Computer)).pipe(take(1)).subscribe(_ => {
      this.router.navigate(['/singlegames']);
    });
    window['dataLayerPush']('wchEvent', 'Main', 'Button', 'Computer', '', '');
  }
}
