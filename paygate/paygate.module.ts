import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AccountService } from '@app/account/account-module/services/account.service';
import { AuthResourceService } from '@app/auth/auth-resource.service';
import { BasePopupComponent } from './components/base-popup/base-popup.component';
import { CommonModule } from '@angular/common';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { FideFormComponent } from './components/fide/fide.component';
import { FideOnlineStatusComponent } from './components/upgrade/fide-online-status/fide-online-status.component';
import { FideSearchProfileComponent } from './components/fide-search-profile/fide-search-profile.component';
import { FideVerificationComponent } from './components/fide-verification/fide-verification.component';
import { FormHelperModule } from '@app/form-helper/form-helper.module';
import { FreeComponent } from './components/left-side/free/free.component';
import { HttpClient } from '@angular/common/http';
import { IndexComponent } from './components/index/index.component';
import { LoginComponent } from './components/login/login.component';
import { LogoComponent } from './components/left-side/logo/logo.component';
import { NgModule } from '@angular/core';
import { NgxMaskModule } from 'ngx-mask';
import { PasswordComponent } from './components/password/password.component';
import { PaygateFormControlDirective } from '@app/modules/paygate/directives/paygate-form-control.directive';
import { PaygateFormInputComponent } from './_shared/paygate-form-input/paygate-form-input.component';
import { PaygateImageUploadComponent } from '@app/modules/paygate/components/image-upload/image-upload.component';
import { PaymentComponent } from './components/payment/payment.component';
import { PremiumComponent } from './components/left-side/premium/premium.component';
import { ProComponent } from './components/left-side/pro/pro.component';
import { PurchaseComponent } from './components/purchase/purchase.component';
import { RecoverComponent } from './components/recover/recover.component';
import { RegisterComponent } from './components/register/register.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { SubscriptionMenuComponent } from './components/left-side/subscription-menu/subscription-menu.component';
import { SuccessComponent } from './components/success/success.component';
import { SvgModule } from '@app/modules/svg/svg.module';
import { TournamentPurchaseComponent } from './components/left-side/tournament/tournament.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { UpgradeComponent } from './components/upgrade/upgrade.component';
import { VideoStreamAccessStatusComponent } from './components/upgrade/video-stream-access-status/video-stream-access-status.component';
import { WidgetsModule } from '@app/shared/widgets/widgets.module';
import { WithFideComponent } from './components/left-side/with-fide/with-fide.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormHelperModule,
    NgxMaskModule.forRoot(),
    RouterModule.forChild([
      {
        path: '',
        component: IndexComponent,
        children: [
          {
            path: 'login',
            component: LoginComponent,
          },
          {
            path: 'register',
            component: RegisterComponent,
          },
          {
            path: 'recover',
            component: RecoverComponent,
          },
          {
            path: 'password',
            component: PasswordComponent,
          },
          {
            path: 'success',
            component: SuccessComponent,
          },
          {
            path: 'payment',
            component: PaymentComponent,
          },
          {
            path: 'fide',
            component: FideFormComponent,
          },
          {
            path: 'fide-verification',
            component: FideVerificationComponent,
          },
          {
            path: 'confirm',
            component: ConfirmComponent,
          },
          {
            path: 'confirm/:emailToChange',
            component: ConfirmComponent,
          },
          {
            path: 'purchase',
            component: PurchaseComponent,
          },
        ],
      },
    ]),
    WidgetsModule,
    SvgModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
      defaultLanguage: 'en',
    }),
  ],
  declarations: [
    IndexComponent,
    LoginComponent,
    LogoComponent,
    FreeComponent,
    RegisterComponent,
    ProComponent,
    PremiumComponent,
    WithFideComponent,
    SubscriptionMenuComponent,
    RecoverComponent,
    PasswordComponent,
    SuccessComponent,
    PaymentComponent,
    FideFormComponent,
    ConfirmComponent,
    PurchaseComponent,
    TournamentPurchaseComponent,
    BasePopupComponent,
    PaygateImageUploadComponent,
    UpgradeComponent,
    PaygateFormControlDirective,
    FideSearchProfileComponent,
    PaygateFormInputComponent,
    FideOnlineStatusComponent,
    VideoStreamAccessStatusComponent,
    FideVerificationComponent,
  ],
  providers: [AuthResourceService, AccountService],
  exports: [UpgradeComponent],
})
export class PaygateModule {}
