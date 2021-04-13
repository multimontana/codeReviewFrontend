import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { HolderItem } from '@app/modules/main/components/main-page/holder-item';
import { Router } from '@angular/router';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';

@Component({
  selector: 'main-page-header',
  templateUrl: './main-page-header.component.html',
  styleUrls: ['./main-page-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPageHeaderComponent implements OnInit {
  @Input()
  item: HolderItem;
  @Input()
  barItem: HolderItem;

  public isOpened = false;
  constructor(
    private paygateService: PaygatePopupManagerService,
    private route: Router,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
  }

  public toggleOpenClose() {
    this.isOpened = !this.isOpened;
    this.cdr.detectChanges();
  }

  public goToMainPage($event) {
    $event.preventDefault();
    this.paygateService.crossAppNavigate(true, '', false);
  }

  public goToWatch($event) {
    $event.preventDefault();
    this.route.navigate(['/watch']).then();
  }
}
