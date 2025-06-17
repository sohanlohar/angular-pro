import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPickupAddress } from '@pos/ezisend/profile/data-access/models';
import {
  IDataCuntry,
  IResponse,
} from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { GeneralFormDialogComponent } from '@pos/ezisend/shared/ui/dialogs/general-form-dialog';
import { PickupCardListComponent } from '@pos/ezisend/shared/ui/pickup-card-list';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-pickup-address',
  templateUrl: './pickup-address.component.html',
  styleUrls: ['./pickup-address.component.scss'],
})
export class PickupAddressComponent implements OnInit, OnDestroy {
  pageTitle = 'Send a single shipment';
  previousPage!: string;
  isShipment = false;
  isHaveDeleteAction = true;
  isNewPickupAddress = false;
  totalPickupList = 0;
  dataPickupAddress: IPickupAddress | undefined = undefined;
  protected _onDestroy = new Subject<void>();

  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.pickup_data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.pickup_data :
    en.data.pickup_data;

  pickupList$:
    | Observable<IResponse<{ 'pickup-addresses': IPickupAddress[] }>>
    | undefined;
  @ViewChild('pickupCard') pickupCard!: PickupCardListComponent;

  pickUpAddress:any = {};
  onSubmitButton: boolean = false;

  constructor(
    public dialog: MatDialog,
    public commonService: CommonService,
    private snackBar: MatSnackBar,
    private translate: TranslationService,
  ) {
    this.assignLanguageLabel();
    this.isMobile();
    
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.pickup_data
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.pickup_data
      }
      this.assignLanguageLabel();
    })
  }

  assignLanguageLabel(){
    this.pageTitle = this.languageData.send_shipment_note;
    this.pickUpAddress = {
      update: this.languageData.update,
      add: this.languageData.add,
      pick_up_address: this.languageData.pick_up_address,
      delete_address_note: this.languageData.delete_address_note,
      delete_address_note2: this.languageData.delete_address_note2,
      close: this.languageData.close,
    };
  }

  ngOnInit(): void {
    this.fetchPickupAddress();
    this.isMobile();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile();
  }
  isMobile(): boolean {
    return this.commonService.checkIfMobile();
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  fetchPickupAddress() {
    this.pickupList$ = this.commonService.fetchList('pickupaddress', 'list');
  }

  onEventAddPickup() {
    this.isNewPickupAddress = true;
    this.dataPickupAddress = {
      name: '',
      phone_no: '',
      nick_name: '',
      address: '',
      city: '',
      state: '',
      country: 'MY',
      postcode: '',
      email: '',
      dialing_code: '+60',
      is_default: false,
      id: null,
    };
  }

  // input: item defines pickupAddress and isNew defines if it's in add/edit mode
  // output open modal to add/edit pickupAddress
  onEventAddEditPickup(data: {isNew: boolean, item: IPickupAddress}) {
    const dialogRefConfig = new MatDialogConfig();
    dialogRefConfig.disableClose = true;
    dialogRefConfig.data = {
      title: (data && !data.isNew) ? this.pickUpAddress.update : this.pickUpAddress.add +' ' + this.pickUpAddress.pick_up_address,
      formData: data?.item ? data.item : {},
      isNew: data && !data.isNew ? false : true
    };

    const dialogRef = this.dialog.open(GeneralFormDialogComponent, dialogRefConfig);

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe((isEvent: boolean) => {
        if (isEvent) this.pickupCard.getPickUp();
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
  }
  pickupListTotal(total: number) {
    this.totalPickupList = total;
  }

  onDeleteFormData(pickupAddressID: string) {
    const dialogRefConfig = new MatDialogConfig();
    dialogRefConfig.disableClose = true;
    dialogRefConfig.autoFocus = true;
    dialogRefConfig.data = {
      descriptions: this.pickUpAddress.delete_address_note,
      icon: 'warning',
      confirmEvent: true,
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogRefConfig);
    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe((result) => {
        if (result) this.onDelete(pickupAddressID);
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
  }

  onDelete(pickupAddressID: string) {
    this.commonService
      .submitData('pickupaddress', `delete/${pickupAddressID}`, {})
      .pipe(
        tap((success: IResponse<{ id: number }>) => {
          this.snackBar.open(
            this.pickUpAddress.delete_address_note2,
            this.pickUpAddress.close,
            { duration: 2000 }
          );
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next: ()=> {
          this.commonService.redirectTo('/profile', { tab: 1 });
        },
        error: ()=>{
          this.commonService.openErrorDialog();
        }
      });
  }

  onPickupAddressSubmit(data: any) {
    const dialogRefConfig = new MatDialogConfig();
    dialogRefConfig.disableClose = true;
    dialogRefConfig.autoFocus = true;
    dialogRefConfig.data = {
      descriptions: this.pickUpAddress.delete_address_note,
      icon: 'warning',
      confirmEvent: true,
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogRefConfig);
    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe((result) => {
        if (result) this.onSubmit(data);
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
  }

  onSubmit(data: IPickupAddress) {
     // Replace 'my' with 'Malaysia' in country field
        const changeCountryName = 
      typeof data?.country === 'string' && data?.country.toLowerCase() === 'my' 
        ? 'Malaysia' 
        : data?.country;
    const eventDetails = {
      "event": "pick_up_update_address", 
      "event_category": "SendParcel Pro - My Profile - Pick Up Address", 
      "event_action": "Update Pick Up Address",
      "event_label": "Pick Up Address",
      "address_type": "Pick Up Address",
      "postcode": data?.postcode,
      "city": data?.city?.city_name, 
      "country": changeCountryName,
    };
        // Push event using the common service
        this.commonService.googleEventPush(eventDetails);

    this.commonService.isLoading(true);
    const {
      id,
      name,
      nick_name,
      email,
      address,
      city,
      state,
      postcode,
      country,
      phone_no,
      is_default,
    } = data;
    const params = {
      name,
      nick_name,
      email: email?.toLowerCase(),
      address,
      city: city.city_name ?? city,
      state: state.state_name ?? state,
      country: (country as IDataCuntry).name.code,
      postcode,
      phone_no: (phone_no as any).phone,
      is_default,
      dialing_code: (phone_no as any).dialCode.calling_code,
    };

    const query = id ? `update/${data.id}` : `add`;

    this.onSubmitButton = true;
    this.commonService
      .submitData('pickupaddress', query, params)
      .pipe(
        tap((success: IResponse<{ id: number }>) => {
          this.commonService.redirectTo('/profile', { tab: 1, pickId: data.id });
          this.fetchPickupAddress();
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
