import {
  ChangeDetectionStrategy,
  Component,
  Output,
  Input,
  EventEmitter,
  Inject,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { bm } from '../../../../../../assets/my';
import { en } from '../../../../../../assets/en';
import { TranslationService } from '../../../../../../shared-services/translate.service';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import * as moment from 'moment';

export interface IDialogEvent {
  title: string;
  descriptions: string;
  information?: string;
  confirmEvent: boolean;
  actionText: string;
  actionUrl: string;
  cancelText?: string;
  genCannotV3?: boolean;
  successCount?: number;
  failedCount?: number;
  closeEvent: boolean;
  backDrop: boolean;
  icon: 'success' | 'warning' | 'user';
  height: string;
  width: string;
  deleteUserText?:boolean;
  type: 'date' | 'default';
  hideAction: boolean
}

@Component({
  selector: 'pos-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DialogComponent {
  @Output() confirmEvent = new EventEmitter<boolean>(false);
  @Output() changeDate = new EventEmitter<string>();
  minDate: Date = new Date();

  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.dialog_box_data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.dialog_box_data :
    en.data.dialog_box_data;

    datePicker: FormGroup = this.fb.group({
      start_date: ['', Validators.required],
    });

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogEvent,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private router: Router,
    private translate: TranslationService,
    public commonService: CommonService,
    private fb: FormBuilder,
  ) {

    this.data.actionText = this.data.actionText ? this.data.actionText : this.languageData.confirm;

    this.dialogRef.addPanelClass('dialog-container-custom');
    this.registerMatIcon();

    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.dialog_box_data;
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.dialog_box_data;
      }
    })
  }

  registerMatIcon() {
    this.matIconRegistry.addSvgIcon(
      `close_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/close-x.svg`)
    );
    this.matIconRegistry.addSvgIcon(
      `success_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `./assets/circle-success.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `warning_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `./assets/circle-warning.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `checkmark_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `./assets/checkmark.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `user_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `./assets/circle-user.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `print_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `./assets/print-icon.svg`
      )
    );
  }

  get icon(): string {
    return this.data.icon === 'success'
      ? 'success_icon'
      : this.data.icon === 'warning'
      ? 'warning_icon'
      : this.data.icon === 'user'
      ? 'user_icon'
      : this.data.icon === 'print'
      ? 'print_icon'
      : this.data.icon === 'checkmark'
      ? 'checkmark_icon'
      : '';
  }

  actionBtn(url:string) {
    if (url === 'auth/login') {
      this.commonService.googleEventPush({
        "event": "go_to_login",
        "event_category": "SendParcel Pro - Login",
        "event_action": "Go To Login",
        "event_label": "Login"
        });
    }
    this.router.navigate([url]);
    this.dialogRef.close();
  }

  onPickupAddressSubmit(data: any) {}

  onDateRangePickerFormChange(event: any) {
  }

  onSubmitDate(){
    this.confirmEvent.emit(true);
    const formattedStartDate = moment(this.datePicker.value.start_date).format('YYYY-MM-DDTHH:mm:ss[Z]');
    this.changeDate.emit(formattedStartDate);
  }
}
