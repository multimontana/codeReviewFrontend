import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'wc-mts-landing-button',
  templateUrl: './mts-landing-button.component.html',
  styleUrls: [ './mts-landing-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MtsLandingButtonComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }
}
