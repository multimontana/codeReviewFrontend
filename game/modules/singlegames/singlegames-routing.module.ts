// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GamePageComponent } from '@app/modules/game/modules/singlegames/pages/game-page/game-page.component';
import { LeaveGameGuard } from '@app/modules/game/guards/leave-game.guard';
import { SinglegamesComponent } from '@app/modules/game/modules/singlegames/pages/singlegames/singlegames.component';

const routes: Routes = [
  {
    path: '',
    component: SinglegamesComponent,
    children: [
      {
        path: '',
        component: GamePageComponent
      },
      {
        path: ':board_id',
        component: GamePageComponent,
        canDeactivate: [
          LeaveGameGuard,
        ],
      },
      {
        path: 'invite/:invite_code',
        component: GamePageComponent,
        canDeactivate: [
        ]
      },
      {
        path: 'invite/:invite_code/:opp_mode',
        component: GamePageComponent,
        canDeactivate: [
        ]
      },
    ]
  }
]

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class SinglegamesRoutingModule { }

