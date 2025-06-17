import { Component, ChangeDetectionStrategy, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BreadcrumbItem } from '@pos/ezisend/shared/data-access/models';
import { ParcelDetailFormComponent } from '@pos/ezisend/shipment/ui/parcel-detail-form';
import { RecipientDetailFormComponent } from '@pos/ezisend/shipment/ui/recipient-detail-form';
import { GeneralFormDialogComponent } from '@pos/ezisend/shared/ui/dialogs/general-form-dialog';
import { IPickupAddress } from '@pos/ezisend/profile/data-access/models';
import { PickupCardListComponent } from '@pos/ezisend/shared/ui/pickup-card-list';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { MatTabGroup } from '@angular/material/tabs';
import {CdkStepper, CdkStepperModule} from '@angular/cdk/stepper';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';
import { finalize, Observable, Subject, takeUntil } from 'rxjs';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'pos-single-shipment',
  templateUrl: './single-shipment.component.html',
  styleUrls: ['./single-shipment.component.scss'],
  providers: [{provide: CdkStepper}],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SingleShipmentComponent implements OnDestroy{
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  showRecipientTab: boolean = false;
  @ViewChild('cardList') cardList!: PickupCardListComponent;
  pageTitle:string = '';
  isEditable = true;
  selectedTabIndex = 0;
  pageCopy:string = '';
  recipientForm: FormGroup | undefined;
  selectedPickupAddress!: IPickupAddress;
  parcelForm: FormGroup | undefined;
  recipientTabEnabled: boolean = false;
  parcelTabEnabled: boolean = false;
  
  getCitiesByPostcode$!: Observable<any>;

  @ViewChild(RecipientDetailFormComponent) recipientComp:
    | RecipientDetailFormComponent
    | undefined;
  @ViewChild(ParcelDetailFormComponent) parcelComp:
    | ParcelDetailFormComponent
    | undefined;

    
  @ViewChild('stepper') stepper!: MatStepper;

  get frmStepOne() {
    return this.recipientComp ? this.recipientComp.recipientForm : null;
  }

  get frmStepTwo() {
    return this.parcelComp ? this.parcelComp.parcelDetailsForm : null;
  }

  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.myShipments :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.myShipments :
    en.data.myShipments;

  breadcrumbItems: BreadcrumbItem[] = [];
  protected _onDestroy = new Subject<void>();

  constructor(
    public dialog: MatDialog, 
    public commonService:CommonService,
    private translate: TranslationService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar) {
      
      this.assignLanguageLabel();
      
      this.translate.buttonClick$.subscribe(() => {
        if (localStorage.getItem("language") == "en") {
          this.languageData = en.data.myShipments
        }
        else if (localStorage.getItem("language") == "my") {
          this.languageData = bm.data.myShipments
        }

        this.assignLanguageLabel();
      })

      this.commonService.countryList$ = this.commonService.getAPI(
        'countries',
        'list',
        0
      );
      this.commonService
      .fetchList('user', 'config')
      .pipe(takeUntil(this._onDestroy))
      .subscribe((data) => {
        this.commonService.isCOD.next(data.data?.feature_cod);
        this.commonService.isCODUbat.next(data.data?.feature_codubat);
        this.commonService.isMelPlus.next(data.data?.feature_melplus);
        this.commonService.isMelPlusCOD.next(data.data?.feature_melplus_cod);
        this.commonService.isMPS.next(data.data?.feature_mps);
      });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  assignLanguageLabel(){
    
    this.pageCopy = this.languageData.page_copy_note;
    this.pageTitle = this.languageData.page_title;

    this.breadcrumbItems = [
      {
        title: this.languageData.home,
        routerLink: [''],
        external: false,
        current: false,
      },
      {
        title: this.languageData.shipment,
        external: false,
        current: true,
      },
    ];
  }

 moveToRecipient(): void {
  const selectedIndex:any = this.tabGroup.selectedIndex;
  const tabCount = this.tabGroup._tabs.length; // Get the number of tabs

  if (selectedIndex < tabCount - 1) {
    // If the current tab index is less than the last tab index, increment to the next tab
    this.tabGroup.selectedIndex = selectedIndex + 1;

    // Enable the corresponding tab
    if (selectedIndex === 0) {
      this.recipientTabEnabled = true;
    } else if (selectedIndex === 1) {
      this.parcelTabEnabled = true;
    }
  }
}

  validateSenderPostCode(){
    if(this.commonService.checkIfMobile()){
      let pickUpDetails = this.commonService.getSelectedPickUpDetails();
      if(pickUpDetails.postcode?.length >= 5) {
        // this.isPopulatingStateCity = true;
        this.getCitiesByPostcode$ = this.commonService.getAPI(
          'cities',
          'querybypostcode?country=MY&postcode=' + pickUpDetails.postcode
        );
        this.getCitiesByPostcode$
          .pipe(
            takeUntil(this._onDestroy),
            finalize(() => this.cdr.markForCheck())
          )
          .subscribe({
            next: (val) => {
              if (!val?.data?.length) {
                this.showError(this.languageData?.invalid_sender_postcode)
              }
              else {
                this.moveToRecipient();
              }
            }
          });
      }
      else{
        this.showError(this.languageData?.invalid_sender_postcode)
      }
    }
    else{
      this.moveToRecipient();
    }
  }

  showError(message: string): void {
    this.snackBar.open(message, this.languageData?.close, {
      duration: 5000,
      panelClass: ['snack-bar-error']
    });
  }

  onBackButtonClick() {
    // Set the index to the "Recipient" tab
    this.selectedTabIndex = 1; // Index is zero-based, so 1 corresponds to the "Recipient" tab
  }
  onEventAddEditPickup(data: {isNew: boolean, item: IPickupAddress}) {
    const dialogRefConfig = new MatDialogConfig();
    dialogRefConfig.disableClose = true;
    dialogRefConfig.data = {
      title: (data && !data.isNew) ? this.languageData.update : this.languageData.add + ' '+ this.languageData.pick_up_address,
      formData: data?.item ? data.item : {},
      isNew: data && !data.isNew ? false : true
    };

    const dialogRef = this.dialog.open(GeneralFormDialogComponent, dialogRefConfig);

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe((isEvent: boolean) => {
        if (isEvent) this.cardList.getPickUp();
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
  }

  ChangeStep(message: any): void {
    this.stepper.next();
  }
}
