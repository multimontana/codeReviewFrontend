// TODO: Убрать moment
// @ts-ignore
import * as locale_RU from 'moment/locale/ru';
import * as moment from 'moment';

import { BehaviorSubject, Observable } from 'rxjs';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { map } from 'rxjs/operators';

import { AccountService } from '@app/account/account-module/services/account.service';
import { OnlineTournamentInterface } from '@app/modules/game/modules/tournaments/models';

@Component({
  selector: 'wc-tournament-list',
  templateUrl: './tournament-list.component.html',
  styleUrls: ['./tournament-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentListComponent implements OnInit, OnChanges {
  @Input() public networkTournaments: OnlineTournamentInterface[] = [];
  public networkTournaments$: BehaviorSubject<OnlineTournamentInterface[]> = new BehaviorSubject([]);

  private moment = moment;

  constructor(private accountService: AccountService) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['networkTournaments']) {
      this.networkTournaments$.next(changes['networkTournaments'].currentValue);
    }
  }

  public getMoment(dateTournament: string): Observable<string> {
    const localeLang = this.moment;
    return this.accountService.getLanguage().pipe(
      map((lang) => {
        if (lang === 'ru') {
          localeLang.locale(lang, locale_RU);
        } else {
          localeLang.locale(lang);
        }
        return localeLang(dateTournament).fromNow();
      })
    );
  }

  public titleCaseWord(word: string) {
    if (!word) {
      return word;
    }
    return word[0].toUpperCase() + word.substr(1).toLowerCase();
  }
}
