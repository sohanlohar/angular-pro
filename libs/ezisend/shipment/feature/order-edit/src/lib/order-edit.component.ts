import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { BreadcrumbItem } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { finalize, map, Subject, takeUntil } from 'rxjs';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-order-edit',
  templateUrl: './order-edit.component.html',
  styleUrls: ['./order-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderEditComponent implements OnInit, OnDestroy {
  protected _onDestroy = new Subject<void>();
  breadcrumbItems: BreadcrumbItem[] = [
    {
      title: 'Home',
      routerLink: [''],
      external: false,
      current: false,
    },
    {
      title: 'My Shipments',
      routerLink: ['/my-shipment'],
      external: false,
      current: false,
    },
    {
      title: 'Edit Order',
      external: false,
      current: true,
    },
  ]
  shipmentData: any;
  isLoading = false;
  
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.myShipments :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.myShipments :
    en.data.myShipments;

  constructor(
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslationService) {
      router.events
      .subscribe((event:any) => {
        if (event.navigationTrigger === 'popstate') {
          this.commonService.redirectTo('/my-shipment', { t: 'request-pickup' });
        }
      });

      
      this.AssignLanguageLabel();
      this.translate.buttonClick$.subscribe(() => {
        if (localStorage.getItem("language") == "en") {
          this.languageData = en.data.myShipments
        }
        else if (localStorage.getItem("language") == "my") {
          this.languageData = bm.data.myShipments
        }
        this.AssignLanguageLabel();
      })
  }

  AssignLanguageLabel(){
    this.breadcrumbItems = [
      {
        title: this.languageData.home, //'Home',
        routerLink: [''],
        external: false,
        current: false,
      },
      {
        title: this.languageData.my_shipments, //'My Shipments',
        routerLink: ['/my-shipment'],
        external: false,
        current: false,
      },
      {
        title: this.languageData.edit_order, //'Edit Order',
        external: false,
        current: true,
      },
    ]
  }

  ngOnInit(): void {
    this.shipmentData = this.commonService.getSelectedShipmentData();
    if(!this.shipmentData){
      this.commonService
      .fetchList('shipments', `query?id=${this.route.snapshot.params['id']}`)
      .pipe(
        map(response => response.data),
        takeUntil(this._onDestroy),
        finalize(() => this.cdr.detectChanges)
      )
      .subscribe({
        next:(data)=>{
          this.commonService.setSelectedShipmentData(data);
          this.shipmentData = data;

          if(this.shipmentData?.sender_details.pickup_option_id) {
            this.commonService.setSenderAddress('');
          } else {
            this.commonService.setSenderAddress(this.shipmentData?.sender_details);
          }
          this.extractRecipientDetails();
          this.extractParcelDetails();
          this.extractCustomDetails();
          this.cdr.detectChanges;
        },
        error:()=>{
          this.commonService.openErrorDialog();
          this.cdr.detectChanges;
        }
        });
    }else{
      if(this.shipmentData?.sender_details.pickup_option_id) {
        this.commonService.setSenderAddress('');
      } else {
        this.commonService.setSenderAddress(this.shipmentData?.sender_details);
      }
      this.extractRecipientDetails();
      this.extractParcelDetails();
      this.extractCustomDetails();
      this.cdr.detectChanges;
    }
    
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  extractRecipientDetails() {
    if (!this.shipmentData.recipient_details) {
      return;
    }
    this.commonService.setRecipientDetail(this.shipmentData.recipient_details);
  }

  extractParcelDetails() {
    if (!this.shipmentData.parcel_details) {
      return;
    }
    if (this.shipmentData.parcel_details.category === 'MPS') {
    const data:any = {
        ...this.shipmentData.parcel_details,
        parcel_Info: this.shipmentData
      };
      this.commonService.setParcelDetail(data);
    } else {
      this.commonService.setParcelDetail(this.shipmentData.parcel_details);
    }
  }

  extractCustomDetails() {
    if (!this.shipmentData.custom_details) {
      return;
    }
    this.commonService.setCustomDetail(this.shipmentData.custom_details);
  }
}
