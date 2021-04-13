// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// 3th party
import { TranslateModule } from '@ngx-translate/core';

// Shared
import { GameMainMenuComponent } from '@app/modules/game/shared/components/main-menu/main-menu.component';
import { PipesModule } from '@app/shared/pipes/pipes.module';
import { GameUserBadgeComponent } from '@app/modules/game/shared/components/user-badge/user-badge.component';
import { SharedModule } from '@app/shared/shared.module';
import { TimeControlFormComponent } from '@app/modules/game/shared/components/time-control-form/time-control-form.component';
import { GameChessBoardComponent } from '@app/modules/game/shared/components/chess-board/chess-board.component';
import { GameRatingSelectFormComponent } from '@app/modules/game/shared/components/game-rating-select-form/game-rating-select-form.component';
import { GameRatingModeSelectFormComponent } from '@app/modules/game/shared/components/game-rating-mode-select-form/game-rating-mode-select-form.component';
import { ReturnGameComponent } from '@app/modules/game/shared/components/return-game/return-game.component';
import { GameMenuComponent } from '@app/modules/game/shared/components/game-menu/game-menu.component';
import { GameChatComponent } from '@app/modules/game/shared/components/game-chat/game-chat.component';
import { GameChatMessageComponent } from '@app/modules/game/shared/components/game-chat/game-chat-message/game-chat-message.component';
import { GameChatPlayerComponent } from '@app/modules/game/shared/components/game-chat/game-chat-player/game-chat-player.component';
import { GameNotificationsComponent } from '@app/modules/game/shared/components/notifications/notifications.component';
import { GameResultComponent } from '@app/modules/game/shared/components/game-result/game-result.component';
import { SvgModule } from '@app/modules/svg/svg.module';
import { ReviewSliderComponent } from '@app/modules/game/shared/components/review-slider/review-slider.component';

// Components
import { CapturedFiguresComponent } from '@app/modules/game/components/new-generation/captured-figures/captured-figures.component';
import { GameLaunchSettingsComponent } from '@app/modules/game/modules/singlegames/components/launch-settings/launch-settings.component';
import { GamingSelectorComponent } from '@app/modules/game/components/gaming-selector/gaming-selector.component';
import { GameFooterMainComponent } from '@app/modules/app-common/components/game-footer-main/game-footer-main.component';
import { PlayerQueueComponent } from '@app/modules/game/components/new-generation/player-queue/player-queue.component';
import { GameFooterTurnamentsComponent } from '@app/modules/game/components/game-footer-turnaments/game-footer-turnaments.component';
import { GameLanguagesComponent } from '@app/modules/game/components/game-languages/game-languages.component';
import { TournamentCountdownComponent } from '@app/modules/game/modules/tournaments/components/tournament-countdown/tournament-countdown.component';
import { GameNotificationComponent } from '@app/modules/game/components/game-notification/game-notification.component';
import { AntiCheatingComponent } from '@app/modules/game/components/new-generation/anti-cheating/anti-cheating.component';
import { GameMenuTournamentInfoComponent } from '@app/modules/game/components/new-generation/game-menu-tournament-info/game-menu-tournament-info.component';
import { GameMenuLogoComponent } from '@app/modules/game/components/new-generation/game-menu-logo/game-menu-logo.component';
import { TournamentTimelineComponent } from '@app/modules/game/modules/tournaments/components/tournament-timeline/tournament-timeline.component';
import { TournamentCardComponent } from '@app/modules/game/modules/tournaments/components/tournament-card/tournament-card.component';
// Pipes
import { CountryTranslatePipe } from './pipes/country-translate.pipe';
import { AlgorandBlockComponent } from '@app/modules/game/shared/components/algorand-block/algorand-block.component';

const COMPONENTS = [
  TournamentTimelineComponent,
  // GameMainMenuComponent,
  // GameLanguagesComponent,
  GameUserBadgeComponent,
  GameMenuLogoComponent,
  GameMenuTournamentInfoComponent,
  ReviewSliderComponent,
  AntiCheatingComponent,
  GameResultComponent,

  GameNotificationComponent,
  GameNotificationsComponent,

  CapturedFiguresComponent,
  GameLaunchSettingsComponent,
  GameFooterTurnamentsComponent,
  // GamingSelectorComponent,
  // TimeControlFormComponent,
  // GameRatingSelectFormComponent,
  // GameRatingModeSelectFormComponent,
  // GamingSelectorComponent,
  // GameChessBoardComponent,
  PlayerQueueComponent,
  // GameFooterMainComponent,
  // TournamentCountdownComponent,
  ReturnGameComponent,
  GameMenuComponent,
  GameMainMenuComponent,
  GameChatComponent,
  GameChatMessageComponent,
  GameChatPlayerComponent,
  // TournamentTimelineComponent,
  TournamentCardComponent,
  AlgorandBlockComponent
];
const PIPES = [
  CountryTranslatePipe,
];
const MODULES = [
  ReactiveFormsModule,
  CommonModule,
  SvgModule,
  RouterModule,
  PipesModule,
  SharedModule,
  TranslateModule,
];

@NgModule({
  declarations: [...COMPONENTS, ...PIPES],
  imports: [
    ...MODULES
  ],
  exports: [
    ...COMPONENTS,
    ...PIPES,
    ...MODULES,
  ]
})
export class SharedGameModule { }
