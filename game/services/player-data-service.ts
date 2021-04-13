import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "@env";
import { BarItemInterface } from '@app/modules/game/models/player/player.interface';

@Injectable()
export class PlayerDataService {

  constructor(private http: HttpClient) {}

    getAll() {
      return this.http.get<BarItemInterface[]>(`${environment.endpoint}/online/best-boards/top_list/`);
    }

}
