import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';

@Component({
  selector: 'wc-main-page-footer',
  templateUrl: './main-page-footer.component.html',
  styleUrls: ['./main-page-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPageFooterComponent implements OnInit {

  constructor(
    public paygateService: PaygatePopupManagerService
  ) { }

  ngOnInit() {
  }
}
