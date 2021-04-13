import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { BehaviorSubject, interval, timer } from 'rxjs';
import { OnlineTournamentInterface } from '@app/modules/game/modules/tournaments/models';
import { untilDestroyed } from '@app/@core';

@Component({
  selector: 'main-page-tournaments-today-row',
  templateUrl: './main-page-tournaments-today-row.component.html',
  styleUrls: ['./main-page-tournaments-today-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPageTournamentsTodayRowComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('class.single-line')@Input() singleLine = false;
  @Input() move: 'left' | 'right' = 'left';
  @Input() tournaments: OnlineTournamentInterface[];
  @ViewChild('cardContainer', { read: ViewContainerRef, static: true }) cardContainer;
  @ViewChild('cardHost', { read: ViewContainerRef, static: true }) cardHost;

  private isDragProceed$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private isDragging$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private mouseHover$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private cardHostWidth$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private cardContainerWidth$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private startDragX: number;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    interval(100)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.doScroll();
      });
  }

  ngAfterViewInit(): void {
    if (this.cardContainer) {
      this.cardContainerWidth$.next(this.cardContainer.element.nativeElement.clientWidth);
    }
  }

  ngOnDestroy(): void {
  }

  @HostListener('document:mouseup')
  stopDrag() {
    if (this.isDragging$.value) {
      this.isDragProceed$.next(false);

      setTimeout(() => {
        this.isDragging$.next(false);
      }, 200);
    }
  }

  @HostListener('document:mousemove', ['$event'])
  moveCursor(e: MouseEvent) {
    e.preventDefault();
    if (this.isDragProceed$.value) {
      this.scrollHorizontally(e.clientX - this.startDragX);
      this.startDragX = e.clientX;
      this.cdr.detectChanges();
      this.isDragging$.next(true);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.cardContainer) {
      this.cardContainerWidth$.next(this.cardContainer.element.nativeElement.clientWidth);
      if (this.cardHost.element.nativeElement.scrollLeft > this.cardHostWidth$.value - this.cardContainerWidth$.value) {
        this.cardContainer.element.nativeElement.scrollLeft = this.cardHostWidth$.value - this.cardContainerWidth$.value;
      }
    }
  }

  public startDrag(event: MouseEvent): void {
    this.isDragProceed$.next(true);
    this.isDragging$.next(false);
    this.startDragX = event.clientX;
    this.cdr.detectChanges();
  }

  public mouseEnter(event: MouseEvent): void {
    this.mouseHover$.next(Date.now());
  }

  public mouseLeave(event: MouseEvent): void {
    const enterTime = this.mouseHover$.value;
    timer(2000).subscribe(val => {
      if (this.mouseHover$.value === enterTime) {
        this.mouseHover$.next(0);
      }
    });
  }

  public scrollHorizontally(delta): void {
    if (this.cardHost) {
      this.cardHostWidth$.next(this.cardHost.element.nativeElement.clientWidth);
    }
    let scrollLeft = this.cardContainer.element.nativeElement.scrollLeft;
    if (!this.cardContainerWidth$.value) {
      return;
    }
    const leftBound = this.cardHostWidth$.value / 3;
    const rightBound = 2 * this.cardHostWidth$.value / 3;
    if (scrollLeft - (delta * 2) < this.cardHostWidth$.value - this.cardContainerWidth$.value) {
      scrollLeft -= (delta * 2);
    }
    if (scrollLeft < leftBound || scrollLeft > rightBound) {
      scrollLeft = leftBound + (scrollLeft % leftBound);
    }
    this.cardContainer.element.nativeElement.scrollLeft = scrollLeft;
    this.cdr.detectChanges();
  }

  private doScroll() {
    if (this.mouseHover$ && this.isDragging$ && !this.mouseHover$.value && !this.isDragging$.value) {
      this.scrollHorizontally(this.move === 'right' ? -1 : 1);
    }
  }
}
