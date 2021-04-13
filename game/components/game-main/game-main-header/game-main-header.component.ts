import { ChangeDetectionStrategy, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'game-main-header',
  templateUrl: './game-main-header.component.html',
  styleUrls: ['./game-main-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMainHeaderComponent {
  public prevSelectedLanguage= '';

  @ViewChild('parentEl', {static: true}) parentEl: ElementRef;

  constructor(private translate: TranslateService,
              private renderer: Renderer2) {
    this.translate.onLangChange.subscribe((lang) => {
      if (this.prevSelectedLanguage) {
       this.renderer.removeClass(this.parentEl.nativeElement, this.prevSelectedLanguage);
      }
      this.renderer.addClass(this.parentEl.nativeElement, `lang-${lang.lang}`);
      this.prevSelectedLanguage = `lang-${lang.lang}`;
    });
  }
}
