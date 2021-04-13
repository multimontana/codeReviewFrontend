import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentsComponent } from './pages/tournaments/tournaments.component';
import { TournamentsRoutingModule } from '@app/modules/game/modules/tournaments/tournaments-routing.module';
import { TournamentsListComponent } from './pages/tournaments-list/tournaments-list.component';
import { SharedGameModule } from '@app/modules/game/shared/shared-game.module';
import { TournamentListComponent } from '@app/modules/game/modules/tournaments/components/tournament-list/tournament-list.component';
import { SharedModule } from '@app/shared/shared.module';
import { OnlineTournamentComponent } from '@app/modules/game/modules/tournaments/components/online-tournament/online-tournament.component';
import { TournamentGamePageComponent } from '@app/modules/game/modules/tournaments/pages/tournament-game-page/tournament-game-page.component';
import { RoundsTimeLineComponent } from '@app/modules/game/modules/tournaments/components/rounds-time-line/rounds-time-line.component';
import { OnlineTournamentWidgetComponent } from '@app/modules/game/modules/tournaments/components/online-tournament-widget/online-tournament-widget.component';
import { OnlineTournamentPgnWidgetComponent } from '@app/modules/game/modules/tournaments/components/online-tournament-pgn-widget/online-tournament-pgn-widget.component';
import { TournamentStandingsExpectedComponent } from '@app/modules/game/modules/tournaments/components/tournament-standings-expected/tournament-standings-expected.component';
import { TournamentStandingsComponent } from '@app/modules/game/modules/tournaments/components/tournament-standings/tournament-standings.component';
import { TournamentGameResultComponent } from '@app/modules/game/modules/tournaments/pages/tournament-game-page/tournament-game-result/tournament-game-result.component';
import { TournamentNextOpponentComponent } from '@app/modules/game/modules/tournaments/components/tournament-next-opponent/tournament-next-opponent.component';
import { ChessBoardModule } from '@app/broadcast/chess/chess-page/chess-board/chess-board.module';
import { ChatModule } from '@app/broadcast/chess/chat/chat.module';
import { OnlineTournamentService } from '@app/modules/game/modules/tournaments/services';
import { OnlineTournamentBoardComponent } from '@app/modules/game/modules/tournaments/components/components/online-tournament-board/online-tournament-board.component';
import { TournamentCertificateComponent } from '@app/modules/game/modules/tournaments/components/components/tournament-certificate/tournament-certificate.component';
import { TournamentCertificateMtsComponent } from '@app/modules/game/modules/tournaments/components/components/tournament-certificate-mts/tournament-certificate-mts.component';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  declarations: [
    TournamentsComponent,
    TournamentsListComponent,
    TournamentListComponent,
    OnlineTournamentComponent,
    TournamentGamePageComponent,
    RoundsTimeLineComponent,
    OnlineTournamentWidgetComponent,
    OnlineTournamentPgnWidgetComponent,
    TournamentStandingsExpectedComponent,
    TournamentStandingsComponent,
    TournamentGameResultComponent,
    TournamentNextOpponentComponent,
    OnlineTournamentBoardComponent,
    TournamentCertificateComponent,
    TournamentCertificateMtsComponent,
  ],
  exports: [TournamentListComponent],
  imports: [SharedGameModule, CommonModule, SharedModule, ChatModule, ChessBoardModule, TournamentsRoutingModule, NgxMaskModule.forRoot()],
  providers: [OnlineTournamentService],
})
export class TournamentsModule {}
