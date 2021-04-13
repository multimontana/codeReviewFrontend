import { Observable, of } from 'rxjs';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IPlayerCompetitors, IPlayerRatingProfile, IPlayerStats } from '@app/modules/app-common/services/player-rating.model';

import { AccountService } from '@app/account/account-module/services/account.service';
import { GamePlayerRatingService } from '@app/modules/game/services/game-player-rating-service';
import moment = require('moment');
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { PluralService } from '@app/shared/services/plural.service';
import { Select, Store as NgxsStore } from '@ngxs/store';
import { SetBestPlayers } from '@app/modules/app-common/state/player-rating.actions';
import { PlayerRatingState } from '@app/modules/app-common/state/player-rating.state';
import { untilDestroyed } from '@app/@core';

@Component({
  selector: 'game-main-all-time-chempion',
  templateUrl: './game-main-all-time-chempion.component.html',
  styleUrls: ['./game-main-all-time-chempion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainAllTimeChempionComponent {
  @Select(PlayerRatingState.bestPlayers) topPlayers$: Observable<IPlayerCompetitors[]>;

  public player$: Observable<IPlayerCompetitors> = this.topPlayers$.pipe(
    map(players => players && players.length ? players[0] : null),
    filter(p => !!p),
    shareReplay(),
  );

  ngOnInit(): void {
    // this.playerRatingResourceService.getBest10Players('worldchess')
    // .pipe(
    //   untilDestroyed(this))
    // .subscribe(val => {
    //   this.NgxsStore.dispatch(new SetBestPlayers(val))
    // });
  }

  ngOnDestroy(): void {
  }

  public profile$: Observable<IPlayerRatingProfile> = this.player$.pipe(
    map(player => (player && player.profile) ? player.profile : {}),
  );
  public avatar$: Observable<string> = this.profile$.pipe(
    map(profile => profile && (profile.avatar.full || '')),
  );

  public stat$: Observable<IPlayerStats> = this.player$.pipe(
    switchMap(player => (player && player.player_id) ? this.playerRatingResourceService.getPlayerGeneralStat(player.player_id) : of({stats: {}})),
    map(stats => (stats && stats.stats) || {}),
    shareReplay(),
  );
  public showBirthDate$: Observable<any> = this.profile$.pipe(
    map(profile => profile && profile.birth_date &&  moment(profile.birth_date).year() >= 1900),
  );
  public currentLanguage: string;

  constructor(
    private playerRatingResourceService: GamePlayerRatingService,
    private translateService: TranslateService,
    private pluralService: PluralService,
    private NgxsStore: NgxsStore,
  ) {
    this.translateService.onLangChange.subscribe((lang) => {
      this.currentLanguage = lang.lang
    });
  }

  public getTranslation(age) {
    return this.pluralService.getPlural(age, this.currentLanguage);
  }
}
