import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { SvgModule } from '@app/modules/svg/svg.module';
import { MyGamesComponent } from '@app/modules/game/components/my-games/my-games.component';
import { IsAuthorizedGuard } from '@app/auth/is-authorized.guard';
import { GamePageComponent } from '@app/modules/game/pages/game-page/game-page.component';
import { GameHomePageComponent } from '@app/modules/game/pages/game-home-page/game-home-page.component';

const routes: Routes = [
  {
    path: '',
    component: GamePageComponent,
    canDeactivate: [
      // LeaveGameGuard,
    ],
    children: [
      {
        path: '',
        component: GameHomePageComponent
      },
      {
        path: '',
        loadChildren: () => import('../../modules/game/modules/tournaments/tournaments.module').then(m => m.TournamentsModule),
      },
      {
        path: 'singlegames',
        loadChildren: () => import('../../modules/game/modules/singlegames/singlegames.module').then(m => m.SinglegamesModule)
      },
    ]
  },
  {
    path: 'mygames',
    component: MyGamesComponent,
    canActivate: [
      IsAuthorizedGuard,
    ],
  },
  {
    path: 'not-found',
    loadChildren: '../../modules/not-found-page/not-found-page.module#NotFoundPageModule',
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SvgModule,
  ],
  exports: [RouterModule]
})
export class GameRoutingModule { }
