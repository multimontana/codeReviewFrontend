import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'wc-mts-landing-text',
  templateUrl: './mts-landing-text.component.html',
  styleUrls: ['./mts-landing-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MtsLandingTextComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
}
