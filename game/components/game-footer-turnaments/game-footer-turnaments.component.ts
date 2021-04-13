import { Component, OnInit } from '@angular/core';

import { AccountService } from '@app/account/account-module/services/account.service';

@Component({
  selector: 'wc-game-footer-turnaments',
  templateUrl: './game-footer-turnaments.component.html',
  styleUrls: ['./game-footer-turnaments.component.scss']
})
export class GameFooterTurnamentsComponent implements OnInit {

  window = window;

  constructor(
    public accountService: AccountService,
  ) { }

  ngOnInit() {
  }


}
