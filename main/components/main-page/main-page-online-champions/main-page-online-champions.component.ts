import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { IPlayerCompetitors } from '@app/modules/app-common/services/player-rating.model';
import { trackByIndex } from '@app/@core';

@Component({
  selector: 'main-page-online-champions',
  templateUrl: './main-page-online-champions.component.html',
  styleUrls: ['./main-page-online-champions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPageOnlineChampionsComponent implements OnInit {
  @Input()
  data: IPlayerCompetitors[] = [];

  public listExpanded = false;
  public trackByIndexFn = trackByIndex;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
  }

  public expandList(): void {
    this.listExpanded = true;
    this.cdr.detectChanges();
  }
}
