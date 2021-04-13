// core
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'wc-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GamePageComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}
