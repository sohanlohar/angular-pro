import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  ChangeDetectorRef
} from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {TranslationService} from '../../../../../shared-services/translate.service';
import * as moment from 'moment';
import { bm } from 'libs/ezisend/assets/my';
import { en } from 'libs/ezisend/assets/en';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';

export const DATE_RANGE_FORMATS = {
  parse: {
    dateInput: 'DD MMM YY',
  },
  display: {
    dateInput: 'DD MMM YY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'pos-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: DATE_RANGE_FORMATS },
  ],
})
export class DateRangePickerComponent implements OnInit, OnChanges {
  public languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.dialog_box_data :
      (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.dialog_box_data :
        en.data.dialog_box_data;
  @ViewChild('picker') picker: any;
  @ViewChild('inputField') inputField!: ElementRef;
  @ViewChild(DaterangepickerDirective) pickerDirective!: DaterangepickerDirective;
  currentDate = new Date();
  @Input() maxDate: Date | undefined;
  @Input() minDate: Date | undefined;
  @Input() isInvalidDate: ((m: moment.Moment) => boolean) | any;
  @Input() singleDateOnly = false;
  @Input() autoApply = false;
  @Input() initialStartDate?: string;
  @Input() initialEndDate?: string;
  form!: FormGroup;
  @Output() formChange = new EventEmitter();
  isPickerOpen = false;

  selected: any;
  alwaysShowCalendars = true;
  showRangeLabelOnInput = false;
  keepCalendarOpeningWithRange = true;
  invalidDates: any[] = [];
  tooltips = [
    { date: moment(), text: 'Today is just unselectable' },
    { date: moment().add(2, 'days'), text: 'Yeeeees!!!' },
  ];

  inlineDateTime: any;
  ranges: any = {
    ['Today']: [moment(), moment()],
    ['Yesterday']: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    ['Last 7 Days']: [moment().subtract(6, 'days'), moment()],
    ['Last 10 Days']: [moment().subtract(9, 'days'), moment()],
    ['Last 30 Days']: [moment().subtract(29, 'days'), moment()],
    ['Last 90 Days']: [moment().subtract(89, 'days'), moment()],
    ['Week to Date']: [
      moment().isoWeekday(1), // Monday of this ISO week (Monday = 1)
      moment() // Today's date
    ],
    ['Month to Date']: [moment().startOf('month'), moment()],
    // added this new label to make it clickable for mobile view and custom range coming from date picker hided with the css last-child
    ['Custom Range']: [moment().subtract(7, 'days'), moment()],
  };  

  data: any =
    localStorage.getItem('language') &&
    localStorage.getItem('language') === 'en'
      ? en.data
      : localStorage.getItem('language') &&
        localStorage.getItem('language') === 'my'
      ? bm.data
      : en.data;

  constructor(
    private roofFormGroup: FormGroupDirective,
    private translate: TranslationService,
    private renderer: Renderer2,
    private _snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
     this.translate.buttonClick$.subscribe(() => {
          if (localStorage.getItem("language") == "en") {
            this.languageData = en.data.dialog_box_data;
          }
          else if (localStorage.getItem("language") == "my") {
            this.languageData = bm.data.dialog_box_data;
          }
          this.cdr.detectChanges();
        })
  }

  ngOnInit(): void {
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem('language') == 'en') {
        this.data = en.data;
      } else if (localStorage.getItem('language') == 'my') {
        this.data = bm.data;
      }
    });
    this.form = this.roofFormGroup.control;

    // Use parent-provided initial dates if available
    let start: moment.Moment;
    let end: moment.Moment;
    if (this.initialStartDate && this.initialEndDate) {
      start = moment(this.initialStartDate);
      end = moment(this.initialEndDate);
    } else {
      // Default: last 30 days
      start = moment().subtract(30, 'days');
      end = moment();
    }
    this.selected = {
      startDate: start.toDate(),
      endDate: end.toDate()
    };
    this.form.patchValue({
      start_date: start.startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      end_date: end.endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
      console.log(changes);
  }

  defaultInvalidDate  = (m: any): boolean => {
    return this.invalidDates.some((d) => d.isSame(m, 'day'));
  };

  isTooltipDate = (m: any): string | boolean | null => {
    const tooltip = this.tooltips.find((tt) => tt.date.isSame(m, 'day'));
    if (tooltip) {
      return tooltip.text;
    } else {
      return false;
    }
  };
  get isMobileView(): boolean {
    return window.innerWidth <= 665;
  }
rangeClicked(range: any): void {
  const label = range.label?.trim();

  const isCustomRange = label === 'Custom Range';

  if (this.isMobileView) {
    const popup = document.querySelector('.md-drppicker, .drp-calendar') as HTMLElement;

    if (isCustomRange) {
      popup?.classList.add('show-calendars');
    } else {
      popup?.classList.remove('show-calendars');
      this.pickerDirective.hide();
    }
  }

  const start = moment(range.dates[0]['$d']);
  const end = moment(range.dates[1]['$d']);

  this.selected = {
    startDate: start.toDate(),
    endDate: end.toDate()
  };

  this.form.patchValue({
    start_date: start.startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
    end_date: end.endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
  });

  if (!isCustomRange) {
    this.onApplyDate();
  }
}

  datesUpdated(range: any): void {
  if (range?.startDate && range?.endDate) {
    const start = moment(range.startDate['$d']);
    const end = moment(range.endDate['$d']);

    const maxDuration = moment.duration(3, 'months');
    const actualDuration = moment.duration(end.diff(start));

    if (actualDuration.asDays() > maxDuration.asDays()) {
      // Show warning (Optional)
     this._snackBar.open(`${this.languageData.three_months_limit}`,'ok'),{
      duration: 4000,
      verticalPosition: 'top', 
      horizontalPosition: 'center'
    };

      // Auto-correct to 3-month range
      const correctedEnd = moment(start).add(3, 'months').subtract(1, 'days');

      this.selected = {
        startDate: start.toDate(),
        endDate: correctedEnd.toDate(),
      };

      this.form.patchValue({
        start_date: start.startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
        end_date: correctedEnd.endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      });

      return;
    }

    this.form.patchValue({
      start_date: start.startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      end_date: end.endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
    });

    this.onApplyDate();
  }
}


  onApplyDate() {
    if (this.form.value.start_date && this.form.value.end_date) {
      this.formChange.emit(this.formatDate());
    } else if (!this.form.value.start_date && !this.form.value.end_date) {
      this.formChange.emit();
    }
  }

  openDate() {
    this.pickerDirective.open();
  }

  chosenDateTime(e: any): void {
    console.log(e);
    this.inlineDateTime = e;
  }

  onClearDate() {

    this.selected = null

    this.form.patchValue({
      start_date: '',
      endDate: ''
    })
  }

  private formatDate() {
    const start_date: string | null = moment(this.form.value.start_date)
      .startOf('day')
      .utc()
      .format('YYYY-MM-DDTHH:mm:ss[Z]');

    const end_date: string | null = moment(this.form.value.end_date)
      .endOf('day')
      .utc()
      .format('YYYY-MM-DDTHH:mm:ss[Z]');
    return { start_date, end_date };
  }

/**
 * Method Name: openPicker
 *
 * Input Parameters:
 *   - None
 *
 * Output Parameters:
 *   - void: This method does not return any value
 *
 * Purpose:
 *   - To open the date picker and set the width of the calendar container
 *
 * Author:
 *   - [Saepul Latif]
 *
 * Description:
 *   - This method opens the date picker using the open method on the picker instance.
 *     After opening the picker, it calls the setWidthContainerCalendar method to adjust
 *     the width of the calendar container to match the width of the input field.
 */
 onPickerOpened() {
  if (!this.isMobileView) return;
  this.picker.open();
    this.setWidthContainerCalendar();
    this.isPickerOpen = true;
}



/**
 * Method Name: setWidthContainerCalendar
 *
 * Input Parameters:
 *   - None
 *
 * Output Parameters:
 *   - void: This method does not return any value
 *
 * Purpose:
 *   - To set the width of the date picker calendar container to match the width of the input field
 *
 * Author:
 *   - [Saepul Latif]
 *
 * Description:
 *   - This method calculates the width of the input field using the nativeElement's offsetWidth property.
 *     It then selects the overlay panel of the date picker using a query selector and sets its width to match
 *     the input field's width using the renderer's setStyle method. If the overlay panel is not found,
 *     the method does nothing.
 */
  setWidthContainerCalendar() {
    const inputWidth = this.inputField.nativeElement.offsetWidth;
    const overlayPanel = document.querySelector(
      '.mat-datepicker-content .mat-calendar'
    );
    if (overlayPanel) {
      this.renderer.setStyle(overlayPanel, 'width', inputWidth + 'px');
    }
  }

  clearForm() {
    this.form.reset();
    this.formChange.emit(this.form.value);
  }


}
