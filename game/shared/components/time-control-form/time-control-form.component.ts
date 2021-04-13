import * as moment from 'moment';

import { BehaviorSubject } from 'rxjs';
import {
  BoardType,
  ITimeControl,
  ITimeControlGrouped,
  ITimeControlTypeGroup,
  ITimeControlWithBorderBottom
} from '@app/broadcast/core/tour/tour.model';
import { ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AccountService } from '@app/account/account-module/services/account.service';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { filter, first } from 'rxjs/operators';
import { untilDestroyed } from '@app/@core';
import { truthy } from '@app/shared/helpers/rxjs-operators.helper';
import GameParamsEmitter from '../../../../../../emiiters/GameParamsEmitter';

@Component({
  selector: 'wc-time-control-form',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeControlFormComponent),
      multi: true
    },
  ],
  templateUrl: './time-control-form.component.html',
  styleUrls: ['./time-control-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeControlFormComponent implements OnInit, OnChanges, ControlValueAccessor, OnDestroy {

  @Input()
  timeControls: ITimeControl[];

  public timeControls$ = new BehaviorSubject<ITimeControl[]>(this.timeControls);

  public boardType = BoardType;
  public moment = moment;
  public timeControlsData: any = [
    {
      id: 8,
      name: '',
      board_type: 5,
      start_time: '00:02:00',
      black_start_time: '00:02:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:00',
      increment_start_move: 0
    },
    {
      id: 9,
      name: '',
      board_type: 3,
      start_time: '00:03:00',
      black_start_time: '00:03:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:00',
      increment_start_move: 0
    },
    {
      id: 10,
      name: '',
      board_type: 3,
      start_time: '00:05:00',
      black_start_time: '00:05:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:00',
      increment_start_move: 0
    },
    {
      id: 12,
      name: '',
      board_type: 5,
      start_time: '00:01:00',
      black_start_time: '00:01:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:01',
      increment_start_move: 1
    },
    {
      id: 13,
      name: '',
      board_type: 5,
      start_time: '00:01:00',
      black_start_time: '00:01:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:02',
      increment_start_move: 1
    },
    {
      id: 14,
      name: '',
      board_type: 3,
      start_time: '00:03:00',
      black_start_time: '00:03:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:02',
      increment_start_move: 1
    },
    {
      id: 15,
      name: '',
      board_type: 3,
      start_time: '00:05:00',
      black_start_time: '00:05:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:03',
      increment_start_move: 1
    },
    {
      id: 16,
      name: '',
      board_type: 2,
      start_time: '00:15:00',
      black_start_time: '00:15:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:10',
      increment_start_move: 1
    },
    {
      id: 7,
      name: '',
      board_type: 2,
      start_time: '00:05:00',
      black_start_time: '00:01:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:00',
      increment_start_move: 0
    },
    {
      id: 87,
      name: '',
      board_type: 2,
      start_time: '00:25:00',
      black_start_time: '00:25:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:10',
      increment_start_move: 1
    },
    {
      id: 88,
      name: '',
      board_type: 2,
      start_time: '00:45:00',
      black_start_time: '00:45:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:10',
      increment_start_move: 1
    },
    {
      id: 89,
      name: '',
      board_type: 2,
      start_time: '00:45:00',
      black_start_time: '00:45:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:00',
      increment_start_move: 0
    },
    {
      id: 90,
      name: '',
      board_type: 2,
      start_time: '00:25:00',
      black_start_time: '00:25:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:00',
      increment_start_move: 0
    },
    {
      id: 91,
      name: '',
      board_type: 3,
      start_time: '00:10:00',
      black_start_time: '00:10:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:00',
      increment_start_move: 0
    },
    {
      id: 92,
      name: '',
      board_type: 2,
      start_time: '00:10:00',
      black_start_time: '00:10:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:10',
      increment_start_move: 1
    },
    {
      id: 93,
      name: '',
      board_type: 2,
      start_time: '00:15:00',
      black_start_time: '00:15:00',
      additional_time: '00:00:00',
      additional_time_move: 0,
      increment: '00:00:00',
      increment_start_move: 0
    },
  ];
  public durationFormat: moment.DurationFormatSettings = {
    trim: 'both',
    trunc: true,
    usePlural: false,
    useSignificantDigits: true
  };

  public selectedTimeControl: ITimeControl;
  public disabled = false;

  private selectedBoardType: BoardType;
  private timeControlsByType: ITimeControlTypeGroup;
  private timeControlGrouped: ITimeControlGrouped[] = [];
  private timeControlsReady$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private gameSharedService: GameSharedService,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const fn = GameParamsEmitter.subscribe(data => {
      setTimeout(() => {
        const timeValue = this.timeControlsData.filter(timeData => {
          return timeData.id === +data.time_control;
        });
        this.writeValue(timeValue[0]);
      }, 1500);
    });
    GameParamsEmitter.unsubscribe(fn);
    this.timeControls$
      .pipe(
        filter((timecontrols) => timecontrols && !!timecontrols.length),
        untilDestroyed(this))
      .subscribe((timecontrols: ITimeControl[]) => {

        this.timeControlsByType = timecontrols
          .slice()
          .map((timecontrol) => {
            return {
              ...timecontrol,
              incrementAsNumber: moment.duration(timecontrol.increment).asSeconds(),
              startTimeAsNumber: moment.duration(timecontrol.start_time).asSeconds()
            };
          })
          .sort((a: any, b: any) => {
            if (a.board_type > b.board_type) {
              return 1;
            }

            if (a.board_type === b.board_type) {
              if (a.incrementAsNumber && !(b.incrementAsNumber)) {
                return 1;
              }
              if (!(a.incrementAsNumber) && b.incrementAsNumber) {
                return -1;
              }

              if (a.startTimeAsNumber > b.startTimeAsNumber) {
                return 1;
              }

              if (a.startTimeAsNumber === b.startTimeAsNumber) {
                if (a.incrementAsNumber > b.incrementAsNumber) {
                  return 1;
                }

                return -1;
              }
            }

            return -1;
          })
          .map((timecontrol) => {
            delete timecontrol.startTimeAsNumber;
            delete timecontrol.incrementAsNumber;

            return timecontrol;
          })
          .reduce((accum: ITimeControlTypeGroup, timecontrol: ITimeControl) => {
            if (accum[timecontrol.board_type] && accum[timecontrol.board_type].length) {
              accum[timecontrol.board_type].push(timecontrol);
            } else {
              accum[timecontrol.board_type] = [timecontrol];
            }

            return accum;
          }, {});

        this.timeControlGrouped = [];

        let lastLength = 0;
        Object.keys(this.timeControlsByType).forEach((key: string) => {
          this.timeControlGrouped.push({
            board_type: Number(key) as BoardType,
            timeControls: this.timeControlsByType[key].map((timecontrol) => ({ timecontrol, needBorderBottom: false })),
            topRounded: this.timeControlsByType[key].length > lastLength,
            bottomRounded: false
          });
          lastLength = this.timeControlsByType[key].length;
        });

        lastLength = 0;
        this.timeControlGrouped.reverse().forEach((timeControlGroup) => {
          timeControlGroup.bottomRounded = timeControlGroup.timeControls.length > lastLength;
          timeControlGroup.timeControls.forEach((timeControlWithBorder, index) => {
            if (index < lastLength) {
              timeControlWithBorder.needBorderBottom = true;
            }
          });
          lastLength = timeControlGroup.timeControls.length;
        });

        this.timeControlGrouped.reverse();
        this.timeControlsReady$.next(true);
        this.cdr.detectChanges();
      });
  }


  ngOnChanges(changes) {
    this.timeControls$.next(changes['timeControls'] && changes['timeControls'].currentValue);
  }

  ngOnDestroy() {
  }

  public onSelectTimeControl(value: ITimeControl) {
    if (!this.disabled) {
      this.writeValue(value);

      window['dataLayerPush'](
        'wchPlay',
        'Play',
        'Time control',
        this.gameSharedService.convertBoardType(value.board_type),
        this.gameSharedService.convertTime(value),
        null
      );
    }
  }

  public get value() {
    return this.selectedTimeControl;
  }

  public set value(val) {
    this.selectedTimeControl = val;
    this.onChange(val);
    this.onTouched();
    this.cdr.detectChanges();
  }


  public registerOnChange(fn) {
    this.onChange = fn;
  }

  public registerOnTouched(fn) {
    this.onTouched = fn;
  }

  public writeValue(value: ITimeControl) {
    if (value) {
      this.timeControlsReady$
        .pipe(
          truthy(),
          first())
        .subscribe(() => {
          let selectedTimeControl = {} as Partial<ITimeControlWithBorderBottom>;
          if (this.timeControlGrouped && this.timeControlGrouped.length) {
            selectedTimeControl = this.timeControlGrouped
              .find((timeControlGroup) => {
                return timeControlGroup.board_type === value.board_type;
              })
              .timeControls
              .find((timeControlWithBorder) => timeControlWithBorder.timecontrol.id === value.id);
          }
          this.value = selectedTimeControl.timecontrol;
          this.selectedBoardType = value.board_type;
          this.cdr.detectChanges();
        });
    }
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.detectChanges();
  }

  private onChange: any = () => { };
  private onTouched: any = () => { };
}
