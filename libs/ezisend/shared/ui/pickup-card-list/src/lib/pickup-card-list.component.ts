import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPickupAddress } from '@pos/ezisend/profile/data-access/models';
import { IResponse } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-pickup-card-list',
  templateUrl: './pickup-card-list.component.html',
  styleUrls: ['./pickup-card-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PickupCardListComponent implements OnInit, OnDestroy {
  @Input() isShipment: any = false;
  @Input() pickupID:any;
  @Input() isEditOrder = false;
  @Input() isUpdatePickupList = false;
  @Input() isReturnOrder:any = false;
  @Input() pickupList$:
    | Observable<IResponse<{ 'pickup-addresses': IPickupAddress[] }>>
    | undefined;
  @Output() selectedAddress = new EventEmitter();
  @Output() totalPickupList = new EventEmitter<number>();
  @Output() eventAddEditPickup = new EventEmitter<{isNew: boolean, item: IPickupAddress}>();
  isFrmBulk = false;
  bulk_name:any;
  pickupList: any[] = [];
  selectedPickup?: any;
  selectedPickupId?: any;
  is_default: any = true;
  currentPath!: string;
  isLoading = false;
  isOrderEdit = false;
  isProfile= false;
  currentUpdatePickupId!: number;
  currentSelectedPickup!: IPickupAddress;
  protected _onDestroy = new Subject<void>(); 
  
  isPendingPickup: boolean = false;

  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.pickupCardList :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.pickupCardList :
    en.data.pickupCardList;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private translate: TranslationService
  ) {
    this.isOrderEdit = this.router.url.includes('order-edit') ? true : false;
    this.isProfile = this.router.url.includes('profile') ? true : false;

    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.pickupCardList
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.pickupCardList
      }
    })
  }

  pathUrl: any
  ngOnInit(): void {
    this.pathUrl= localStorage.getItem("firstPathUrl");
    this.route.queryParams.subscribe((query: any) => this.currentUpdatePickupId = +query.pickId);
    this.getPickUp();
    this.currentPath = this.router.url.replace('/', '');
    this.isPendingPickup = this.router.url.includes('pending-pickup') ? true : false;
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  getPickUp() {
    this.isLoading = true;
    this.commonService
      .fetchList('pickupaddress', 'list')
      .pipe(
        takeUntil(this._onDestroy),
        map(
          (response: IResponse<{ 'pickup-addresses': IPickupAddress[] }>) =>
            response.data['pickup-addresses']
        ),
        tap((pickupAddresses: IPickupAddress[]) => {
          this.totalPickupList.emit(pickupAddresses.length)
          pickupAddresses.forEach((data: any) => {
            if (this.currentUpdatePickupId && !this.isOrderEdit) {
                            this.selectedPickupId = this.currentUpdatePickupId;
            }
            if(this.route.snapshot.params['id1'] && this.isOrderEdit) {
              this.isFrmBulk = false;
              this.selectedPickupId = parseInt(this.route.snapshot.params['id1']);
              this.is_default = null;
            } else if(this.route.snapshot.params['id1'] && this.isReturnOrder) {
              this.isFrmBulk = false;
              this.selectedPickupId = parseInt(this.route.snapshot.params['id1']);
              this.is_default = null;
            } else if(!this.route.snapshot.params['id1'] && this.isReturnOrder) {
              this.isFrmBulk = false;
              this.selectedPickupId = parseInt(this.route.snapshot.params['id1']);
              this.is_default = null
            } else if(!this.route.snapshot.params['id1'] && this.isOrderEdit) {
              this.is_default = null;
              this.isFrmBulk = true;
            } else if(!this.isOrderEdit) {
              this.isFrmBulk = false;
            }
            if (data.is_default && !this.currentUpdatePickupId) {
              this.commonService.setSelectedPickUpID(data.id);
              this.commonService.setSelectedPickUpDetails(data);              
              this.selectedPickupId = data.id
              this.selectedAddress.emit(data);
            } else if (this.currentUpdatePickupId && data.id === this.currentUpdatePickupId) {
              this.commonService.setSelectedPickUpID(this.currentUpdatePickupId);
              this.selectedAddress.emit(data);
            }
          });
        })
      )
      .subscribe({
        next:(pickupList)=>{
          this.isLoading = false;
          this.pickupList = pickupList;
          this.commonService.getCurrentSelectedPickupAddress$.subscribe((val: IPickupAddress | null) => {
            if (val) {
              this.selectedPickupId = val.id;
              this.commonService.setSelectedPickUpID(val.id);
              this.commonService.setSelectedPickUpDetails(val); 
            }
          })
          this.cdr.detectChanges();
        },
        error:()=>{
          this.isLoading = false;
          this.cdr.detectChanges();
          this.commonService.openErrorDialog();
        }
      });
  }

  onSelect(val: IPickupAddress): void {
    // Replace 'my' with 'Malaysia' in country field
    const changeCountryName = 
  typeof val?.country === 'string' && val?.country.toLowerCase() === 'my' 
    ? 'Malaysia' 
    : val?.country;
    this.commonService.setSelectedPickUpID(val.id);
    this.commonService.setCurrentSelectedPickupAddress(val);
    this.commonService.setSelectedPickUpDetails(val);
    this.selectedPickup = val;
    this.selectedPickupId = null;
    this.is_default = null;
    const eventDetails = {
      event: 'pick_up_select_address',
      event_category: 'SendParcel Pro - My Profile - Pick Up Address',
      event_action: 'Select Pick Up Address',
      event_label: 'Pick Up Address',
      address_type: 'Pick Up Address',
      postcode: val.postcode,
      city: val.city,
      country: changeCountryName, 
     };
                this.commonService.googleEventPush(eventDetails);
    this.selectedAddress.emit(val);
  }
  @Output() nextClicked: EventEmitter<any> = new EventEmitter();

  onClickNextButton() {
    // When the "Next" button is clicked, emit the event to move to the "Recipient" tab
    this.nextClicked.emit();
  }

  addEditPickupAddress(isNew = false, item?: IPickupAddress) {
    if (isNew) {
      const eventDetails ={
        event: 'pick_up_add_new_address',
        event_category: 'SendParcel Pro - My Profile - Pick Up Address',
        event_action: 'Add New Pick Up Address',
        event_label: 'New Pick Up Address',
      };
      this.commonService.googleEventPush(eventDetails)
      this.eventAddEditPickup.emit();
    } else if (!isNew && item) {
      // Replace 'my' with 'Malaysia' in country field
        const changeCountryName = 
  typeof item?.country === 'string' && item?.country.toLowerCase() === 'my' 
    ? 'Malaysia' 
    : item?.country;
      const eventDetails ={
        event: 'pick_up_edit_address',
        event_category: 'SendParcel Pro - Single Shipments',
        event_action: 'Edit Pick Up Address',
        event_label: 'Pick Up Address',
        address_type: 'Pick Up Address',
        postcode: item.postcode,
        city: item.city,
        country: changeCountryName,
      };
          this.commonService.googleEventPush(eventDetails)
      this.eventAddEditPickup.emit({isNew, item});
    }
  }

  getHighlight(item: IPickupAddress) {
    if(this.isFrmBulk){
      return false
    }else {
      return this.selectedPickupId == item.id
      ? true
      : this.selectedPickup == item || this.is_default == item.is_default && !this.selectedPickupId
      ? true
      : false
    }
  }
}
