import * as forRoot from '../../../../reducers';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Subject, combineLatest, from, of } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { selectIsAuthorized, selectSignInErrors, selectSignInLoading } from '../../../../auth/auth.reducer';

import { AuthSignIn } from '../../../../auth/auth.actions';
import { PaygatePopupService } from '../../../../modules/paygate/services/paygate-popup.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { untilDestroyed } from '@app/@core';

@Component({
  selector: 'wc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  form = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  window = window;

  loginIncorrect$ = this.store$.pipe(
    select(selectSignInErrors),
    filter((errors) => Object.keys(errors).length > 0)
  );

  loading$ = this.store$.pipe(select(selectSignInLoading));

  isAuthorized$ = this.store$.pipe(select(selectIsAuthorized));

  showForm$ = combineLatest(this.loading$, this.isAuthorized$).pipe(map(([loading, isAuthorized]) => !loading && !isAuthorized));

  constructor(
    // TODO remove store
    private store$: Store<forRoot.State>,
    private paygatePopupService: PaygatePopupService,
    private translate: TranslateService
  ) {
    translate.use(window.localStorage.getItem('language'));
  }

  ngOnInit() {
    this.isAuthorized$
      .pipe(
        filter((isAuthorized) => !!isAuthorized),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.paygatePopupService.navigateNextStep('login');
      });
  }

  ngOnDestroy() {}

  submit() {
    if (this.form.valid) {
      const kfp = window['kfp'];
      const kasperskyId = environment.kaspersky_script_id;
      const fraudRequest = kfp ? from(kfp.login_start(kasperskyId, 'login')) : of(null);
      fraudRequest.subscribe((ksid) => {
        this.store$.dispatch(new AuthSignIn({ credential: this.form.value }));
      });
    }
  }

  closePopup() {
    this.paygatePopupService.closePopup();
  }

  // TODO: Will need to create a service for google analytics
  statisticsRecover(): void {
    window['dataLayerPush']('wchLogin', 'Sign in', 'popup buttons', 'recover', null, null);
  }

  statisticsRegister(): void {
    window['dataLayerPush']('wchLogin', 'Sign in', 'popup buttons', 'register', null, null);
  }

  statisticsSignIn(): void {
    window['dataLayerPush']('wchLogin', 'Sign in', 'popup buttons', 'close', null, null);
  }
}
