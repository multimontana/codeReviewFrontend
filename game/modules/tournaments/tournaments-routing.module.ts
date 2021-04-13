import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { TournamentsComponent } from '@app/modules/game/modules/tournaments/pages/tournaments/tournaments.component';
import { TournamentsListComponent } from '@app/modules/game/modules/tournaments/pages/tournaments-list/tournaments-list.component';
import { OnlineTournamentComponent } from '@app/modules/game/modules/tournaments/components/online-tournament/online-tournament.component';
import { TournamentGamePageComponent } from '@app/modules/game/modules/tournaments/pages/tournament-game-page/tournament-game-page.component';

const router: Route[] = [
  {
    path: 'tournaments',
    component: TournamentsComponent,
    children: [
      {
        path: '',
        component: TournamentsListComponent,
      },
    ],
  },
  {
    path: 'tournament',
    component: TournamentsComponent,
    children: [
      {
        path: ':tournament',
        component: OnlineTournamentComponent,
      },
      {
        path: 'pairing/:board_id',
        component: TournamentGamePageComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(router)],
  exports: [RouterModule],
})
export class TournamentsRoutingModule {}
