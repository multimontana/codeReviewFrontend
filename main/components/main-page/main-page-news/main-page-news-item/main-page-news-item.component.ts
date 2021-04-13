import { Component, Input, OnInit } from '@angular/core';
import { News } from '@app/modules/main/model/news';

@Component({
  selector: 'main-page-news-item',
  templateUrl: './main-page-news-item.component.html',
  styleUrls: ['./main-page-news-item.component.scss']
})
export class MainPageNewsItemComponent implements OnInit {
  @Input() newsItem: News;

  constructor() {
  }

  ngOnInit() {
  }
}
