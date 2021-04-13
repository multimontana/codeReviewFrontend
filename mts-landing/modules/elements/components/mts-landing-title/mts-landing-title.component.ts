import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'wc-mts-landing-title',
  templateUrl: './mts-landing-title.component.html',
  styleUrls: ['./mts-landing-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MtsLandingTitleComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
}
