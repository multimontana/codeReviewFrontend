import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TournamentCertificateComponent } from '@app/modules/game/modules/tournaments/components/components/tournament-certificate/tournament-certificate.component';

@Component({
  selector: 'wc-tournament-certificate-mts',
  templateUrl: './tournament-certificate-mts.component.html',
  styleUrls: ['./tournament-certificate-mts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentCertificateMtsComponent extends TournamentCertificateComponent {}
