import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'countryTranslate',
  pure: false,
})
export class CountryTranslatePipe implements PipeTransform {

  constructor(private translateService: TranslateService) {}

  transform(value: any, ...args: any[]): any {
    const translated = this.translateService.instant(`COUNTRIES.${value}`);
    return translated.includes('COUNTRIES') ? value : translated;
  }

}
