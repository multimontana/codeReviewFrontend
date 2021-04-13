import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MtsRequestEnum, MtsTournamentData, MtsMarathonTournament } from '@app/modules/mts-landing/models/mts-landing.model';
import { MtsLandingService } from '@app/modules/mts-landing/services/mts-landing.service';

@Component({
  selector: 'wc-mts-landing-content',
  templateUrl: './mts-landing-content.component.html',
  styleUrls: ['./mts-landing-content.component.scss', './../../settings.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MtsLandingContentComponent implements OnInit {
  public MtsRequestType = MtsRequestEnum;
  public tournamentList: MtsTournamentData[] = [
    {
      date: '12 августа 20:00',
      rating: 'World Chess',
      timecontrol: 'Блиц 3+2',
      name: 'MTС Weekly',
      tournamentLink: 'https://arena.myfide.net/tournament/535'
    },
    {
      date: '16 августа 12:00',
      rating: 'World Chess',
      timecontrol: 'Блиц 3 мин',
      name: 'MTС Weekly',
      tournamentLink: 'https://arena.myfide.net/tournament/536'
    },
    {
      date: '19 августа 20:00',
      rating: 'World Chess',
      timecontrol: 'Блиц 5 мин',
      name: 'MTС Weekly',
      tournamentLink: 'https://arena.myfide.net/tournament/537'
    },
    {
      date: '23 августа 12:00',
      rating: 'World Chess',
      timecontrol: 'Блиц 3+2',
      name: 'MTС Weekly',
      tournamentLink: 'https://arena.myfide.net/tournament/538'
    },
    {
      date: '26 августа 20:00',
      rating: 'World Chess',
      timecontrol: 'Блиц 3+0',
      name: 'MTС Weekly',
      tournamentLink: 'https://arena.myfide.net/tournament/614'
    },
    {
      date: '30 августа 12:00',
      rating: 'World Chess',
      timecontrol: 'Блиц 3+2',
      name: 'MTС Weekly',
      tournamentLink: 'https://arena.myfide.net/tournament/615'
    },
    {
      date: '6 сентября 20:00',
      rating: 'World Chess',
      timecontrol: 'Блиц 5+0',
      name: 'MTС Weekly',
      tournamentLink: 'https://arena.myfide.net/tournament/616'
    },
    {
      date: '13 сентября 12:00',
      rating: 'World Chess',
      timecontrol: 'МАРАФОН',
      name: 'MTС Weekly',
      tournamentLink: ''
    },
  ];
  public marathonTournamentList: MtsMarathonTournament[] = [
    {
      time: '09:00',
      rating: 'World Chess',
      timecontrol: 'Блиц 3+2',
      name: 'МТС Марафон',
      tournamentLink: 'https://arena.myfide.net/tournament/846'
    },
    {
      time: '11:00',
      rating: 'World Chess',
      timecontrol: 'Блиц 3+2',
      name: 'МТС Марафон',
      tournamentLink: 'https://arena.myfide.net/tournament/847'
    },
    {
      time: '13:00',
      rating: 'World Chess',
      timecontrol: 'Блиц 3+2',
      name: 'МТС Марафон',
      tournamentLink: 'https://arena.myfide.net/tournament/848'
    },
    {
      time: '15:00',
      rating: 'World Chess',
      timecontrol: 'Блиц 3+2',
      name: 'МТС Марафон',
      tournamentLink: 'https://arena.myfide.net/tournament/849'
    },
    {
      time: '17:00',
      rating: 'World Chess',
      timecontrol: 'Блиц 3+2',
      name: 'МТС Марафон',
      tournamentLink: 'https://arena.myfide.net/tournament/850'
    },
    {
      time: '19:00',
      rating: 'World Chess',
      timecontrol: 'Блиц 3+2',
      name: 'МТС Марафон',
      tournamentLink: 'https://arena.myfide.net/tournament/851'
    },
    {
      time: '21:00',
      rating: 'World Chess',
      timecontrol: 'Блиц 3+2',
      name: 'МТС Марафон',
      tournamentLink: 'https://arena.myfide.net/tournament/852'
    },
  ];

  constructor(
    private mtsService: MtsLandingService
  ) {
  }

  ngOnInit(): void {
  }

  public goToTournament(link: string): void {
    window.location.assign(link);
  }

  openPopup(mtsRequestType: MtsRequestEnum, event: Event): void {
    this.mtsService.popupRequestType$.next(mtsRequestType);
    event.stopPropagation();
  }
}
