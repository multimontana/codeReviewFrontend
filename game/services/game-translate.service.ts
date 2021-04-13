import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, combineLatest, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap, filter } from 'rxjs/operators';

import { AccountService } from '@app/account/account-module/services/account.service';
import { TranslateBadgeNotificationInterface } from '@app/modules/game/models';


@Injectable()
export class GameTranslateService {
  constructor(private translate: TranslateService, private accountService: AccountService) {}

  public getTranslateService(): TranslateService {
    return this.translate;
  }

  public getTranslate(code: string): Observable<string> {
    return this.translate.get(code)
      .pipe(
        distinctUntilChanged((a: string, b: string) => a === b)
      );
  }

  public getTranslateObject(code: string | string[], interpolateParams: Object): Observable<string> {
    return this.translate.get(code, interpolateParams);
  }

  public getMyLang(): Observable<string> {
    return this.accountService.getLanguage()
      .pipe(
        filter((lang) => !!lang)
      );
  }

  public getLanguage(): Observable<string> {
    return this.getMyLang().pipe(
      tap((lang) => this.translate.use(lang)),
    );
  }

  public getMsgBadgeNotify(): Observable<TranslateBadgeNotificationInterface[]> {
    return this.getLanguage().pipe(
      switchMap((lang) => {
        return combineLatest([
          this.getTranslate('MESSAGES.GAME_REVIEW'),
          this.getTranslate('MESSAGES.OFFERED_DRAW'),
          this.getTranslate('MESSAGES.OFFERING_DRAW'),
          this.getTranslate('MESSAGES.LET_PLAY'),
          this.getTranslate('MESSAGES.CHECKMATE'),
          this.getTranslate('MESSAGES.CHECK'),
          this.getTranslate('MESSAGES.A_DRAW'),
          this.getTranslate('MESSAGES.OPPONENT_RESIGNED'),
          this.getTranslate('MESSAGES.DRAW_BECAUSE'),
          this.getTranslate('MESSAGES.YOU_RESIGNED'),
          this.getTranslate('MESSAGES.YOU_WIN_TIME'),
          this.getTranslate('MESSAGES.YOU_LOST_TIME'),
          this.getTranslate('MESSAGES.YOU_LOST'),
          this.getTranslate('MESSAGES.STALEMATE_DRAW'),
          this.getTranslate('GAME.DRAW'),
          this.getTranslate('MESSAGES.ACCEPT_DRAW'),
          this.getTranslate('MESSAGES.CLAIM_A_DRAW'),
        ]).pipe(
          switchMap(
            ([
              gameReview,
              offeredDraw,
              offeringDraw,
              letPlay,
              checkmate,
              check,
              aDraw,
              opponentResigned,
              drawBecause,
              youResigned,
              youWinTime,
              youLostTime,
              youLost,
              stalemateDraw,
              gameDraw,
              acceptDraw,
              claimDraw,
            ]) => {
              const messages = [];
              messages.push(this.returnNotification('GAME_REVIEW', gameReview));
              messages.push(this.returnNotification('OFFERED_DRAW', offeredDraw));
              messages.push(this.returnNotification('OFFERING_DRAW', offeringDraw));
              messages.push(this.returnNotification('LET_PLAY', letPlay));
              messages.push(this.returnNotification('CHECKMATE', checkmate));
              messages.push(this.returnNotification('CHECK', check));
              messages.push(this.returnNotification('A_DRAW', aDraw));
              messages.push(this.returnNotification('OPPONENT_RESIGNED', opponentResigned));
              messages.push(this.returnNotification('DRAW_BECAUSE', drawBecause));
              messages.push(this.returnNotification('YOU_RESIGNED', youResigned));
              messages.push(this.returnNotification('YOU_WIN_TIME', youWinTime));
              messages.push(this.returnNotification('YOU_LOST_TIME', youLostTime));
              messages.push(this.returnNotification('YOU_LOST', youLost));
              messages.push(this.returnNotification('STALEMATE_DRAW', stalemateDraw));
              messages.push(this.returnNotification('DRAW', gameDraw));
              messages.push(this.returnNotification('ACCEPT_DRAW', acceptDraw));
              messages.push(this.returnNotification('CLAIM_A_DRAW', claimDraw));
              return of(messages);
            }
          )
        );
      })
    );
  }

  private returnNotification(key, translate): TranslateBadgeNotificationInterface {
    return { key, translate } as TranslateBadgeNotificationInterface;
  }
}
