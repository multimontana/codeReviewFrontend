import { Component, OnInit } from '@angular/core';

import { AccountService } from '@app/account/account-module/services/account.service';

@Component({
  selector: 'wc-game-footer',
  templateUrl: './game-footer.component.html',
  styleUrls: ['./game-footer.component.scss']
})
export class GameFooterComponent implements OnInit {

  window = window;

  constructor(
    public accountService: AccountService,
  ) { }

  ngOnInit() {
  }

}
