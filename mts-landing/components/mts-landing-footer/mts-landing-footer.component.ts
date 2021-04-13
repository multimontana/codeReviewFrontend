import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'wc-mts-landing-footer',
  templateUrl: './mts-landing-footer.component.html',
  styleUrls: ['./mts-landing-footer.component.scss', './../../settings.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MtsLandingFooterComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }
}
