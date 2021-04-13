import { Component, Input } from '@angular/core';
import { GameMoveIterface } from '@app/modules/game/models';


@Component({
  selector: 'wc-history-move',
  templateUrl: './history-move.component.html',
  styleUrls: ['./history-move.component.scss'],
})
export class HistoryMoveComponent {

  @Input() move: GameMoveIterface;

  @Input() isSelected: boolean;
  get isWhite(): boolean {
    return this.move.is_white_move;
  }
}

