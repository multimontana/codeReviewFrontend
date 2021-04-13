import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { untilDestroyed } from '@app/@core';
import { AccountResourceService } from '@app/account/account-store/account-resource.service';
import { AccountLoadSuccess } from '@app/account/account-store/account.actions';
import { selectMyAccount } from '@app/account/account-store/account.reducer';
import { AuthLogout } from '@app/auth/auth.actions';
import { selectIsAuthorized, selectRefreshLoading, selectToken } from '@app/auth/auth.reducer';
import { IsMainApp } from '@app/is-main-app.token';
import { GamingMenu } from '@app/modules/game/models';
import { RejectOpponentRequest } from '@app/modules/game/state/game.actions';
import { AddSubscriptions } from '@app/purchases/subscriptions/subscriptions.actions';
import * as fromRoot from '@app/reducers';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';
import { createSelector, select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Store as NgxsStore } from '@ngxs/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, first, map, mergeMap, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { environment } from '@env';
import { environmentMenu } from '../../../../../../environments/environment.menu';
import * as moment from 'moment';
import { OnlineTournamentInterface } from '@app/modules/game/modules/tournaments/models';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { SideMenuSubjectsService } from '@app/shared/services/side-menu-subjects.service';


@Component({
  selector: 'game-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameMainMenuComponent implements OnInit, OnDestroy {
  public readonly isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized)
  );
  public readonly account$ = this.store$.pipe(
    select(selectMyAccount)
  );
  public readonly token$ = this.store$.pipe(
    select(createSelector(
      selectToken,
      selectRefreshLoading,
      (token, refreshing) => ({ token, refreshing })
    )),
    // wait all request when token refreshed.
    filter(({ token, refreshing }) => !refreshing),
    map(({ token }) => token),
    first(),
    map(t => t ? '?t=' + t : '')
  );

  public menu = this.isMainApp ? environmentMenu['gamingMenu'] : this.getMappedGamingMenu();
  public readonly window = window;
  myUpcomingTournaments$: Observable<OnlineTournamentInterface[]>;
  endTime = moment().add({ hours: 24 });
  private destroy$: Subject<void> = new Subject<void>();

  private isAuthorized = null;

  constructor(
    private store$: Store<fromRoot.State>,
    private store: NgxsStore,
    private accountResourceService: AccountResourceService,
    private router: Router,
    public paygateService: PaygatePopupManagerService,
    private translateService: TranslateService,
    private gameResourceService: GameResourceService,
    private sideMenuSubjectsService: SideMenuSubjectsService,
    @Inject(IsMainApp) private isMainApp: boolean
  ) {
    this.isAuthorized$
    .pipe(
      filter((isAuthorized) => !!isAuthorized),
      takeUntil(this.destroy$)
    )
    .subscribe((isAuthorized) => {
      this.isAuthorized = isAuthorized;
    });

    if (this.isAuthorized) {
      this.getUpcomingTournaments();
    }
  }

  ngOnInit(): void {
    this.subToIsAuthorized();
    this.sideMenuSubjectsService.upcomingTournamentChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isAuthorized) {
          console.log('upcomingTournamentChanged$');
          this.getUpcomingTournaments();
        }
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public logout(): void {
    this.store.dispatch(new RejectOpponentRequest()).pipe(first()).subscribe(() => {
      this.store$.dispatch(new AuthLogout());
    });
  }

  public getItem(item: string): Observable<string> {
    let translateItem = '';
    if (item === 'single game') {
      translateItem = 'GAME.SINGLE_GAME';
    }
    if (item === 'ratings') {
      translateItem = 'MENU.RATINGS';
    }
    if (item === 'tournaments') {
      translateItem = 'TOURNAMENTS.TOURNAMENTS';
    }
    if (item === 'shop') {
      translateItem = 'MENU.SHOP';
    }
    if (item === 'FIDE') {
      translateItem = 'MENU.FIDE';
    }
    if (item === 'Old Interface') {
      translateItem = 'MENU.OLD_INTERFACE';
    }
    if (item === 'World Chess') {
      translateItem = 'PROFILE.WS';
    }
    if (item === 'Masterclass') {
      translateItem = 'MENU.MASTERCLASS';
    }
    return this.translateService.get(translateItem);
  }

  public sendStatistics(gtagParams): void {
    window['dataLayerPush'](`${gtagParams[0]}`, `${gtagParams[1]}`, `${gtagParams[2]}`, `${gtagParams[3]}`, null, null);
  }

  private subToIsAuthorized(): void {
    this.isAuthorized$.pipe(
      withLatestFrom(this.account$),
      filter(([isAuth, acc]) => isAuth && !acc),
      mergeMap(() => this.accountResourceService.getProfile()),
      untilDestroyed(this)
    ).subscribe((account) => {
      this.store$.dispatch(new AddSubscriptions({
        subscriptions: account.subscriptions,
        count: account.subscriptions.length
      }));
      this.store$.dispatch(new AccountLoadSuccess({ account }));
    });
  }

  private getMappedGamingMenu(): GamingMenu[] {
    return environmentMenu['gamingMenu'].map((item: any) => {
      if (item.blank && item.link === environment.gameUrl) {
        item.blank = false;
        item.link = '';
      } else if (!item.blank && item.link.startsWith('/')) {
        item.auth = true;
      }
      return item;
    });
  }

  public getUpcomingTournaments() {
    this.myUpcomingTournaments$ = this.gameResourceService.getOnlineTournaments(
      moment().utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
      this.endTime.utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
      true,
    );
  }
  
  public getNewFrontUrl() {
    return environment.newFrontUrl;
  }
}
