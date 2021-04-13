import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-algorand',
  templateUrl: './algorand-block.component.html',
  styleUrls: ['./algorand-block.component.scss']
})
export class AlgorandBlockComponent {
  public lang: string;
  constructor(private translateService: TranslateService) {
    this.lang = this.translateService.currentLang
    this.translateService.onLangChange.subscribe((lang) => {
      this.lang = lang.lang
    });
  }

}
