import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NguCarouselConfig } from '@ngu/carousel';
import { trackByIndex } from '@app/@core';

@Component({
  selector: 'game-main-beautiful-online-chess',
  templateUrl: './game-main-beautiful-online-chess.component.html',
  styleUrls: ['./game-main-beautiful-online-chess.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainBeautifulOnlineChessComponent {
  public carouselConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 1, lg: 1, all: 0 },
    speed: 150,
    slide: 1,
    point: {
      visible: true
    },
    touch: true,
    loop: true,
    interval: { timing: 15000 },
  };

  public carouselData = [
    { id: 0 },
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
   ];

  public trackByIndexFn = trackByIndex;
}
