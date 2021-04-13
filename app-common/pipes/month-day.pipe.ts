import { Pipe, PipeTransform } from '@angular/core';
import moment = require("moment");

@Pipe({
  name: 'newsTime'
})
export class MonthDayPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (!value){
      return "";
    }
    const d1 = moment(value);
    if (d1.isSame(moment(),'day')){
      return d1.locale('en').format('HH:mm')
    }
    return d1.locale('en').format("MMM D")
  }

}
