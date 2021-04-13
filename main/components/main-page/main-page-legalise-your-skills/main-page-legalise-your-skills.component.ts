import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { selectIsAuthorized } from '@app/auth/auth.reducer';
import * as fromRoot from '@app/reducers';
import { Router } from '@angular/router';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { Observable } from 'rxjs';
import { untilDestroyed } from '@app/@core';
import { selectFideIdPlan } from '@app/purchases/subscriptions/subscriptions.reducer';
import { first, map, withLatestFrom } from 'rxjs/operators';


@Component({
  selector: 'main-page-legalise-your-skills',
  templateUrl: './main-page-legalise-your-skills.component.html',
  styleUrls: ['./main-page-legalise-your-skills.component.scss']
})
export class MainPageLegaliseYourSkillsComponent implements OnInit, OnDestroy {

  private isAuthorized$: Observable<boolean> = this.store$.pipe(select(selectIsAuthorized));

  private fidePurchased$: Observable<boolean> = this.store$.pipe(
    select(selectFideIdPlan),
    map(p => p && p.is_active),
  );

  constructor(
    private paygatePopupService: PaygatePopupService,
    private store$: Store<fromRoot.State>,
    private router: Router) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  public register(e: MouseEvent) {
    e.preventDefault();
    this.isAuthorized$
      .pipe(
        withLatestFrom(this.fidePurchased$),
        first(),
        untilDestroyed(this))
      .subscribe(([authorized, fidePurchased]) => {
        if (authorized) {
          if (!fidePurchased) {
            this.paygatePopupService.setState({ fideSelected: true });
            this.router.navigate(['/account/membership']);
          }
        } else {
          this.paygatePopupService.setState({ fideSelected: true });
          this.router.navigate(['', {outlets: {p: ['paygate', 'register']}}]);
        }
      });
  }
}
