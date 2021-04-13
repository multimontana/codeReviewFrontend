import { GameDataService } from './services/game-data.service';
import { GameTranslateService } from './services/game-translate.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameRoutingModule } from './game-routing.module';
import { NgxsModule } from '@ngxs/store';
import { GameState } from './state/game.state';
import { GameResourceService } from './state/game.resouce.service';
import { PlayerPanelComponent } from './components/player-panel/player-panel.component';
import { PipesModule } from '@app/shared/pipes/pipes.module';
import { SearchOpponentComponent } from './components/search-opponent/search-opponent.component';
import { MovesHistoryComponent } from './components/moves-history/moves-history.component';
import { HistoryMoveComponent } from './components/moves-history/history-move/history-move.component';
import { HistoryMoveFigureComponent } from './components/moves-history/history-move-figure/history-move-figure.component';
import { LeaveGameGuard } from './guards/leave-game.guard';
import { SharedModule } from '@app/shared/shared.module';
import { ModalWindowsModule } from '@app/modal-windows/modal-windows.module';
import { SvgModule } from '@app/modules/svg/svg.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import { GameScreenService } from '@app/modules/game/state/game.screen.service';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { MyGamesComponent } from './components/my-games/my-games.component';
import { InfiniteScrollComponent } from './shared/components/infinite-scroll/infinite-scroll.component';
import { ChessgroundAudioService } from '@app/shared/widgets/chessground/chessground.audio.service';
import { ChatModule } from '@app/broadcast/chess/chat/chat.module';
import { ChessBoardModule } from '@app/broadcast/chess/chess-page/chess-board/chess-board.module';
import { TournamentState } from '@app/modules/game/modules/tournaments/states/tournament.state';
import { GameMainHeaderComponent } from './components/game-main/game-main-header/game-main-header.component';
import { GameMainPlayersBarComponent } from './components/game-main/game-main-players-bar/game-main-players-bar.component';
import { GameMainPlayersBarItemComponent } from './components/game-main/game-main-players-bar/game-main-players-bar-item/game-main-players-bar-item.component';
import { GameMainPlayerComponent } from './components/game-main/game-main-players-bar/game-main-players-bar-item/game-main-player/game-main-player.component';
import { GameMainTodayComponent } from './components/game-main/game-main-today/game-main-today.component';
import { GameMainBestPlayerComponent } from './components/game-main/game-main-best-player/game-main-best-player.component';
import { PlayerDataService } from '@app/modules/game/services/player-data-service';
import { GameMainTournamentComponent } from './components/game-main/game-main-tournament/game-main-tournament.component';
import { GameMainAreaComponent } from './components/game-main/game-main-area/game-main-area.component';
import { GameMainUpdatesComponent } from './components/game-main/game-main-updates/game-main-updates.component';
import { GameMainButtonBlockComponent } from './components/game-main/game-main-button-block/game-main-button-block.component';
import { GameMainTournamentPanesComponent } from './components/game-main/game-main-tournament-panes/game-main-tournament-panes.component';
import { GameMainTournamentPaneComponent } from './components/game-main/game-main-tournament-panes/game-main-tournament-pane/game-main-tournament-pane.component';
import { GameMainNewTournamentComponent } from './components/game-main/game-main-tournament-panes/game-main-new-tournament/game-main-new-tournament.component';
import { OnlineTournamentService } from '@app/modules/game/modules/tournaments/services/tournament.service';
import { GamePlayerRatingService } from '@app/modules/game/services/game-player-rating-service';
import { GameMainJoinTournamentComponent } from './components/game-main/game-main-join-tournament/game-main-join-tournament.component';
import { GameMainTimelineComponent } from './components/game-main/game-main-timeline/game-main-timeline.component';
import { GameMainSvgTournamentComponent } from './components/game-main/game-main-svg-tournament/game-main-svg-tournament.component';
import { GameMainFindOpponentComponent } from './components/game-main/game-main-find-opponent/game-main-find-opponent.component';
import { GameChampionsTableComponent } from './components/game-main/game-champions-table/game-champions-table.component';
import { GameMainAllTimeChempionComponent } from './components/game-main/game-main-all-time-chempion/game-main-all-time-chempion.component';
import { GameMainAdvertisementComponent } from './components/game-main/game-main-advertisement/game-main-advertisement.component';
import {
  GameMainAdvertisementRedComponent
} from './components/game-main/game-main-advertisement-red/game-main-advertisement-red.component';
import { GameMainPromoMtsComponent } from './components/game-main/game-main-promo-mts/game-main-promo-mts.component';
import { GameMainFideTextComponent } from './components/game-main/game-main-fide-text/game-main-fide-text.component';
import { GameMainRatingPointsComponent } from './components/game-main/game-main-rating-points/game-main-rating-points.component';
import { GameMainLegalizeSkilsComponent } from './components/game-main/game-main-legalize-skils/game-main-legalize-skils.component';
import { GameMainBeautifulOnlineChessComponent } from './components/game-main/game-main-beautiful-online-chess/game-main-beautiful-online-chess.component';
import { GameMainBoardMainComponent } from './components/game-main/game-main-beautiful-online-chess/game-main-board-main/game-main-board-main.component';
import { GameMainPhonesComponent } from './components/game-main/game-main-beautiful-online-chess/game-main-phones/game-main-phones.component';
import { GameMainBoardSmallComponent } from './components/game-main/game-main-beautiful-online-chess/game-main-board-small/game-main-board-small.component';
import { GameMainChatComponent } from './components/game-main/game-main-beautiful-online-chess/game-main-chat/game-main-chat.component';
import { GameMainLobbyComponent } from './components/game-main/game-main-beautiful-online-chess/game-main-lobby/game-main-lobby.component';
import { GameMainBoardDashedComponent } from './components/game-main/game-main-beautiful-online-chess/game-main-board-dashed/game-main-board-dashed.component';
import { GameMainBoardStylesComponent } from './components/game-main/game-main-beautiful-online-chess/game-main-board-styles/game-main-board-styles.component';
import { GameMainBoardCardsComponent } from './components/game-main/game-main-beautiful-online-chess/game-main-cards/game-main-cards.component';
import { GameMainButtonBlockMobileComponent } from './components/game-main/game-main-button-block-mobile/game-main-button-block-mobile.component';
import { TournamentGameState } from '@app/modules/game/modules/tournaments/states/tournament.game.state';
import { AppCommonModule } from '@app/modules/app-common/app-common.module';
import { AccountModule } from '@app/account/account-module/account.module';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TournamentDataService } from '@app/modules/game/modules/tournaments/services/tournament.data.service';
import { NguCarouselModule } from '@ngu/carousel';
import { SharedGameModule } from '@app/modules/game/shared/shared-game.module';
import { GamePageComponent } from './pages/game-page/game-page.component';
import { GameHomePageComponent } from './pages/game-home-page/game-home-page.component';
import { GameMainComponent } from '@app/modules/game/components/game-main/game-main.component';
import { TournamentLogService } from '@app/modules/game/modules/tournaments/services/tournament.log.service';
import { GameService } from '@app/modules/game/state/game.service';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json?cb='
    + new Date().getTime()
  );
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GameRoutingModule,
    NgxsModule.forFeature([GameState, TournamentState, TournamentGameState]),
    PipesModule,
    SharedModule,
    SvgModule,
    ChatModule,
    ChessBoardModule,
    AppCommonModule,
    AccountModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
      defaultLanguage: 'en',
    }),
    NguCarouselModule,
    SharedGameModule,
  ],
  providers: [
    ModalWindowsService,
    CountryResourceService,
    GameResourceService,
    OnlineTournamentService,
    LeaveGameGuard,
    GameScreenService,
    GameSharedService,
    GameService,
    GameDataService,
    GameTranslateService,
    PlayerDataService,
    GamePlayerRatingService,
    TournamentDataService,
    TournamentLogService,
    ChessgroundAudioService,
  ],
  declarations: [
    PlayerPanelComponent,
    MovesHistoryComponent,
    SearchOpponentComponent,
    HistoryMoveComponent,
    HistoryMoveFigureComponent,
    MyGamesComponent,
    InfiniteScrollComponent,
    GameMainComponent,
    GameMainHeaderComponent,
    GameMainPlayersBarComponent,
    GameMainPlayersBarItemComponent,
    GameMainPlayerComponent,
    GameMainTodayComponent,
    GameMainBestPlayerComponent,
    GameMainTournamentComponent,
    GameMainAreaComponent,
    GameMainUpdatesComponent,
    GameMainButtonBlockComponent,
    GameMainTournamentPanesComponent,
    GameMainTournamentPaneComponent,
    GameMainNewTournamentComponent,
    GameMainJoinTournamentComponent,
    GameMainTimelineComponent,
    GameMainSvgTournamentComponent,
    GameMainFindOpponentComponent,
    GameChampionsTableComponent,
    GameMainAllTimeChempionComponent,
    GameMainAdvertisementComponent,
    GameMainAdvertisementRedComponent,
    GameMainFideTextComponent,
    GameMainRatingPointsComponent,
    GameMainLegalizeSkilsComponent,
    GameMainBeautifulOnlineChessComponent,
    GameMainBoardMainComponent,
    GameMainPhonesComponent,
    GameMainBoardSmallComponent,
    GameMainChatComponent,
    GameMainLobbyComponent,
    GameMainBoardDashedComponent,
    GameMainBoardStylesComponent,
    GameMainBoardCardsComponent,

    GameMainButtonBlockMobileComponent,
    GameMainPromoMtsComponent,
    GamePageComponent,
    GameHomePageComponent,
  ],
})
export class GameModule {}
