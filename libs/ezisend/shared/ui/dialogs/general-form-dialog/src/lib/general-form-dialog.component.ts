import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ICity, IState, IResponse } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { Subject, takeUntil, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { bm } from '../../../../../../assets/my';
import { en } from '../../../../../../assets/en';
import { TranslationService } from '../../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-general-form-dialog',
  templateUrl: './general-form-dialog.component.html',
  styleUrls: ['./general-form-dialog.component.scss'],
})
export class GeneralFormDialogComponent implements OnInit, OnDestroy {
  @Output() confirmEvent = new EventEmitter<boolean>(false);
  title = 'Add Pickup Address';
  generalFormData!: any;

  protected _onDestroy = new Subject<void>();
  
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.form_data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.form_data :
    en.data.form_data;

  onSubmitButton: boolean = false;

  constructor(
    private commonService: CommonService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<GeneralFormDialogComponent>,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private translate: TranslationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogRef.addPanelClass('dialog-container-custom');
    this.matIconRegistry.addSvgIcon(
      `close_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/close-x.svg`)
    );

    this.assignLanguageData();
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.form_data;
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.form_data
      }
      this.assignLanguageData();
    })
  }

  assignLanguageData(){
    this.title = this.languageData.add_pickup_address;
  }

  ngOnInit(): void {
    this.title = this.data?.title;
    this.generalFormData = this.data?.formData;
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  onSubmit(data: any) {
    this.commonService.isLoading(true);
    const {
      id,
      name,
      nick_name,
      email,
      address,
      city,
      dialCode,
      state,
      postcode,
      country,
      phone_no,
      is_default
    } = data;

    const params = {
      name,
      nick_name,
      email,
      address,
      city: (city as ICity).city_name,
      state: (state as IState).state_name,
      country: "MY",
      postcode,
      phone_no,
      dialing_code: (dialCode).calling_code,
      is_default,
    }
    // Replace 'my' with 'Malaysia' in country field
    const changeCountryName = 
  typeof data?.city?.country === 'string' && data?.city?.country.toLowerCase() === 'my' 
    ? 'Malaysia' 
    : data?.city?.country;
    const isEdit = !!id; // If `id` exists, it's an edit operation
    const eventDetails = isEdit
      ? {
          event: 'pick_up_update_address',
          event_category: 'SendParcel Pro - Single Shipments',
          event_action: 'Update Pick Up Address',
          event_label: 'Pick Up Address',
          address_type: 'Pick Up Address',
          postcode: postcode,
          city: (city as ICity).city_name,
          country: changeCountryName,
        }
      : {
          event: 'pick_up_add_address_success',
          event_category: 'SendParcel Pro - My Profile - Pick Up Address',
          event_action: 'Add Pick Up Address Success',
          event_label: 'Success',
          address_type: "Pick Up Address",
          postcode: data?.postcode,
          city: data?.city?.city_name,
          country: changeCountryName,
        };
    // Push event to Google Analytics
    this.commonService.googleEventPush(eventDetails);  
    const query = id ? `update/${data.id}` : `add`;
    this.onSubmitButton = true;
    this.commonService.submitData('pickupaddress', query, params)
    .pipe(
      tap((success: IResponse<{id: number}>) => {
        this.dialogRef.close();
        // this.commonService.redirectTo('/shipment');
        this.confirmEvent.emit(true);
        this.snackBar.open(this.languageData.pickup_added_success_note, this.languageData.close, {duration: 3000});
      }),
      takeUntil(this._onDestroy)
    )
    .subscribe({
      next:()=>{
        this.onSubmitButton = false;
        this.commonService.isLoading(false);
      },
      error:()=>{
        this.onSubmitButton = false;
        this.commonService.isLoading(false);
        this.commonService.openErrorDialog();
      }
    });
  }
}
