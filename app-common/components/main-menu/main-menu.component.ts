import { Component, OnDestroy, OnInit } from '@angular/core';
import { environmentMenu } from '../../../../../environments/environment.menu';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { OnlineTournamentInterface } from '@app/modules/game/modules/tournaments/models';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { SideMenuSubjectsService } from '@app/shared/services/side-menu-subjects.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit, OnDestroy {
  menu = environmentMenu['mainMenu'];
  myUpcomingTournaments$: Observable<OnlineTournamentInterface[]>;
  endTime = moment().add({ hours: 24 });
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    public paygateService: PaygatePopupManagerService,
    private gameResourceService: GameResourceService,
    private translateService: TranslateService,
    private sideMenuSubjectsService: SideMenuSubjectsService,
  ) {
    this.getUpcomingTournaments();
  }

  ngOnInit() {
    this.sideMenuSubjectsService.upcomingTournamentChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('upcomingTournamentChanged$');
        this.getUpcomingTournaments();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getUpcomingTournaments() {
    this.myUpcomingTournaments$ = this.gameResourceService.getOnlineTournaments(
      moment().utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
      this.endTime.utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
      true,
    );
  }

  public getItem(item: string): Observable<string> {
    let translateItem = '';
    if (item === 'News') {
      translateItem = 'MENU.NEWS';
    }
    if (item === 'Play') {
      translateItem = 'MENU.PLAY';
    }
    if (item === 'Shop') {
      translateItem = 'MENU.SHOP';
    }
    if (item === 'Masterclass') {
      translateItem = 'MENU.MASTERCLASS';
    }
    return this.translateService.get(translateItem);
  }
}
