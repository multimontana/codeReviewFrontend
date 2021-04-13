import { NgModule } from '@angular/core';
import { SinglegamesRoutingModule } from '@app/modules/game/modules/singlegames/singlegames-routing.module';
import { SharedGameModule } from '@app/modules/game/shared/shared-game.module';
import { SharedModule } from '@app/shared/shared.module';
import { ModalWindowsModule } from '@app/modal-windows/modal-windows.module';
import { GamePageComponent } from '@app/modules/game/modules/singlegames/pages/game-page/game-page.component';
import { ChatModule } from '@app/broadcast/chess/chat/chat.module';
import { SinglegamesComponent } from './pages/singlegames/singlegames.component';

@NgModule({
  declarations: [
    GamePageComponent,
    SinglegamesComponent
  ],
  imports: [
    ModalWindowsModule,
    SinglegamesRoutingModule,
    SharedModule,
    SharedGameModule,
    ChatModule
  ],
  exports: []
})
export class SinglegamesModule { }
