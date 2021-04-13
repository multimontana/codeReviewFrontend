import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MtsRequestBody, MtsRequestEnum } from '../models/mts-landing.model';
import { environment } from '../../../../environments/environment';

@Injectable()

export class MtsLandingService {
  public popupRequestType$ = new BehaviorSubject<MtsRequestEnum>(null);

  constructor(private http: HttpClient) {
  }

  sendMtsTournamentRequest(body: MtsRequestBody): Observable<any> {
    return this.http.post(`${environment.endpoint}/online/tournaments/contact-mts`, body);
  }
}
