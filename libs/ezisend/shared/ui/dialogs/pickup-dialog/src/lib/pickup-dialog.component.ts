import { Component, Renderer2 } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import {
    MatDialog,
    MatDialogConfig,
    MatDialogRef
} from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { bm } from '../../../../../../assets/my';
import { en } from '../../../../../../assets/en';
import { TranslationService } from '../../../../../../shared-services/translate.service';
import { CommonService } from '@pos/ezisend/shared/data-access/services';

@Component({
  selector: 'pos-pickup-dialog',
  templateUrl: './pickup-dialog.component.html',
  styleUrls: ['./pickup-dialog.component.scss'],
})
export class PickupDialogComponent {
  currentDate = moment(new Date()).startOf('day');
  showError = false;
  errorMessage = '';
  date = '';
  start_date = '';
  end_date = '';
  cutOff = moment().clone().hour(14).minute(30).second(0);
  today = moment().format('MM/DD/YYYY');
  tomorrow = moment().add(1,'day').format('MM/DD/YYYY');

  releaseDate = new FormControl(moment("10-20-2020", "MM-DD-YYYY")); 
 // Date Range
 dateRangePickerForm: FormGroup = this.fb.group({
  start_date: [''],
  end_date: [''],
});
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.form_data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.form_data :
    en.data.form_data;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PickupDialogComponent>,
    private translate: TranslationService,
    private commonService: CommonService,
    private renderer: Renderer2
  ) {
    this.dialogRef.addPanelClass('dialog-container-custom');
    this.matIconRegistry.addSvgIcon(
      `close_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/close-x.svg`)
    );
    this.setDefaultDate();

    
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.form_data
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.form_data
      }
    })
  }
  ngOnInit(): void {
    this.start_date  = moment().format('YYYY-MM-DDT00:00:00[Z]');
    this.end_date = moment().add(30, 'days').format('YYYY-MM-DDT00:00:00[Z]');
    this.dateRangePickerForm= this.fb.group({
      start_date: [this.start_date],
      end_date: [this.end_date],
    });
  }
  setDefaultDate() {
    if(moment().isBefore(this.cutOff)) {
      this.releaseDate.patchValue(moment(this.today, "MM/DD/YYYY")) 
      this.date = moment(this.today).format('YYYY-MM-DDTHH:mm:ss[Z]')
    } else {
      this.releaseDate.patchValue(moment(this.tomorrow, "MM/DD/YYYY"));
      this.date = moment(this.tomorrow).format('YYYY-MM-DDTHH:mm:ss[Z]')
    }
  };
  onDateRangePickerFormChange(event: any) {
    if (event) {
      this.start_date = event.start_date;
      this.end_date = event.end_date;
      const eventDetails ={
        "event": "pick_up_select_date",
        "event_category": "SendParcel Pro - My Shipments - Request For Pick Up",
        "event_action": "Select Pick Up Date",
        "event_label": "Pick Up Date"
      };
      this.commonService.googleEventPush(eventDetails)
    } else {
      this.start_date = '';
      this.end_date = '';
    }
  }
  isInvalidDate = (m: moment.Moment): boolean => {
    const todayMoment = moment().startOf('day');
    const selectedDate = m.startOf('day');
  
    // Disallow past dates
    if (selectedDate.isBefore(todayMoment)) return true;
  
    // If today and current time is past cutoff, disallow today
    if (selectedDate.isSame(todayMoment, 'day') && moment().isAfter(this.cutOff)) {
      return true;
    }
  
    return false;
  };
  
  back() {
    this.dialogRef.close();
  }

  requestPickUp() {
    if (this.errorMessage !== '' || this.date === '') {
      this.showError = true;
      this.errorMessage = this.languageData.required_date;
      return;
    }
    
      this.commonService.googleEventPush({
      "event": "pick_up_submit_schedule_request",
      "event_category": "SendParcel Pro - My Shipments - Request For Pick Up",
      "event_action": "Submit Schedule Request",
      "event_label": "Schedule Request - "+ this.date
    });

    this.showError = false;
    this.dialogRef.close(this.date);
  }

  onDateSelected(event: any) {
    if (event && event.startDate) {
      this.date = moment(event.startDate).format('YYYY-MM-DDTHH:mm:ss[Z]');
      this.showError = false;
      this.errorMessage = '';
    } else {
      this.date = '';
    }
  
      const eventDetails = {
      "event": "pick_up_select_date",
      "event_category": "SendParcel Pro - My Shipments - Request For Pick Up",
      "event_action": "Select Pick Up Date",
      "event_label": "Pick Up Date"
    };
    this.commonService.googleEventPush(eventDetails)
  }

  editDate(){
    const eventDetails ={
      "event": "pick_up_edit_date",
      "event_category": "SendParcel Pro - My Shipments - Request For Pick Up",
      "event_action": "Edit Pick Up Date",
      "event_label": "Pick Up Date"
    };
    this.commonService.googleEventPush(eventDetails)
  }
  ngAfterViewInit() {
    const observer = new MutationObserver(() => {
      const drp = document.querySelector('.md-drppicker.shown');
      const targetParent = document.querySelector('.pickup__form-container');

      if (targetParent) {
        if (drp && !targetParent.classList.contains('date-picker-shown')) {
          // Add the class when the date picker is shown
          this.renderer.addClass(targetParent, 'date-picker-shown');
        } else if (!drp && targetParent.classList.contains('date-picker-shown')) {
          // Remove the class when the date picker is not shown
          this.renderer.removeClass(targetParent, 'date-picker-shown');
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  }
}

export function openPickupDialog(dialog: MatDialog) {
  
  const config = new MatDialogConfig();

  config.disableClose = true;
  config.autoFocus = true;
  config.minWidth = 650;
  config.maxWidth = 650;

  const dialogRef = dialog.open(PickupDialogComponent, config);

  return dialogRef.afterClosed();
}
