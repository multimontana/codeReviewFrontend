import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPaginationResponse } from '@app/modules/main/model/common';
import { News, NewsDto } from '@app/modules/main/model/news';
import { NewsShort } from '@app/modules/main/model/news-short';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import moment = require('moment');

@Injectable()
export class NewsServiceService {

  constructor(private http: HttpClient) {
  }

  getHeaderNews(): Observable<NewsShort> {
    return new BehaviorSubject<NewsShort>({
      imageSrc: 'https://s3-wctour-ut-test.s3.amazonaws.com/media/mini_banner_images/7005182eaeec623a.png',
      time: '18:22',
      title: 'Who are the Seconds in the Candidates'
    });
  }

  getLastNews(limit: number = 10, offset: number = 0): Observable<News[]> {
    const params = new HttpParams();
    params.set('limit', `${limit}`);
    params.set('offset', `${offset}`);
    return this.http.get<IPaginationResponse<NewsDto>>(`${environment.endpoint}/news/`, { params })
      .pipe(
        map(news => news.results
          .map(val => ({
            id: val.id || 0,
            title: val.title || '',
            preview: val.preview || '',
            content: val.content || '',
            slug: val.slug || '',
            featured_image: val.featured_image || 'https://s3-wctour-ut-test.s3.amazonaws.com/media/mini_banner_images/7005182eaeec623a.png',
            video_link: val.video_link || '',
            pub_date: moment(val.pub_datetime),
          }) as News)
          .sort((a, b) => a.pub_date.diff(a.pub_date, 'ms'))));
  }
}
