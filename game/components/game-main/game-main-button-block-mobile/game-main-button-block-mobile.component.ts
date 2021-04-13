import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { SetQuickstartFlag } from '@app/modules/game/state/game.actions';
import { StartEnum } from '@app/modules/game/models';
import { Store } from '@ngxs/store';
import { take } from 'rxjs/operators';

@Component({
  selector: 'wc-game-main-button-block-mobile',
  templateUrl: './game-main-button-block-mobile.component.html',
  styleUrls: ['./game-main-button-block-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainButtonBlockMobileComponent {
  window = window;

  constructor(
    private store: Store,
    private router: Router,
  ) {
  }

  quickStart(e: MouseEvent) {
    this.store.dispatch(new SetQuickstartFlag(StartEnum.Quickstart)).pipe(take(1)).subscribe(v => {
      this.router.navigate(['/singlegames']);
    });
  }

  lobby(e: MouseEvent) {
    e.preventDefault();
    this.router.navigate(['/singlegames']);
  }

  tournaments(e: MouseEvent) {
    e.preventDefault();
    this.router.navigate(['/tournaments']);
  }
}
