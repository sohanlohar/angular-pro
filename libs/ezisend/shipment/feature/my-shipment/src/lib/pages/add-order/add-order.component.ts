import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbItem, IResponse } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { MyShipmentHelper } from '@pos/ezisend/shipment/data-access/helper/my-shipment-helper';
import { IDataShipment, IShipment, IShipmentParamFilter } from '@pos/ezisend/shipment/data-access/models';
import { MyShipmentTableComponent } from '@pos/ezisend/shipment/ui/my-shipment-table';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { bm } from '../../../../../../../assets/my';
import { en } from '../../../../../../../assets/en';
import { TranslationService } from '../../../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-add-order',
  templateUrl: './add-order.component.html',
  styleUrls: ['./add-order.component.scss'],
})
export class AddOrderComponent implements OnInit, OnDestroy {
  @ViewChild(MyShipmentTableComponent) myShipment:any;

  pickup_number = '';
  pickup_id = '';
  pickup_date = '';
  pickup_address = ''
  connote_ids: string[] = [];
  order_id!: number;
  isSelectAllOrder = false;
  totalBatchRequest = 0;
  currentBatchPageRequest = 0;
  totalShipmentRecords = 0;
  breadcrumbItems: BreadcrumbItem[] = []
  backData = {};
  columns = [
    'select',
    'trackingDetail',
    'status',
    'recipient',
    'deliveryDetail',
    'type',
    'action',
  ];

  shipment$: Observable<IResponse<IShipment>> | undefined;
  currentPage = 1;
  pageSize = 100;
  start_date = '';
  end_date = '';
  keyword? = '';
  total = 0;
  isLoading = false;

  protected _onDestroy = new Subject<void>();

  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.order_details :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.order_details :
    en.data.order_details;

  constructor(
    public commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private translate: TranslationService
  ) {
    this.pickup_number = this.route.snapshot.params['trackingId'];    
    
    this.assignLanguageLabel()
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.order_details
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.order_details
      }
      // this.languageData = this.languageData.order_details
      this.assignLanguageLabel()
    })
  }

  assignLanguageLabel(){
    this.breadcrumbItems = [
      {
        title: this.languageData.home, // 'Home',
        routerLink: [''],
        external: false,
        current: false,
      },
      {
        title: this.languageData.my_shipments,  // 'My Shipments',
        routerLink: ['/my-shipment'],
        external: false,
        current: false,
      },
      {
        title: this.languageData.add_orders, // 'Add Order',
        external: false,
        current: true,
      },
    ];

    this.backData = {
      path: '/my-shipment',
      query: {t: 'pending-pickup'},
      label: this.languageData.back_data,
    };

  }

  ngOnInit(): void {
    const { pickup_id, pickup_number, date } = this.route.snapshot.queryParams;
    this.pickup_id = pickup_id;
    this.pickup_number = pickup_number;
    this.pickup_date = date;

    if (!this.pickup_number || !this.pickup_date) {
      this.router.navigate(['..'], { relativeTo: this.route });
      return;
    }

    this.fetchShipments();
    this.fetchShipmentDetails();

    this.commonService.googleEventPush({
      "event": "add_order_success",
      "event_category": "SendParcel Pro - My Shipments - Add Order",
      "event_action": "Add Order Success",
      "event_label": "Success"
    });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  fetchShipments() {
    this.isLoading = true;
    const query = `list?${MyShipmentHelper.contructFilterObject(
      this.buildParams
    )}`;
    this.shipment$ = this.commonService.fetchList('shipments', query).pipe(
      tap((res: IResponse<IShipment>) => {
        this.total = res.data.total;
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    );
  }
  
  fetchShipmentDetails() {
    const query = `list?keyword=${this.pickup_number}&uitab=pending-pickup`
    this.commonService
      .fetchList('shipments', query)
      .pipe(
        tap((res: IResponse<{ shipments: IDataShipment[] }>) => {
          this.pickup_address = res.data.shipments[0].pickup_details.pickup_address;
          this.cdr.detectChanges();
        } )
      )
      .subscribe();
  }

  fetchBatchShipments(query: string) {
    this.commonService.fetchList('shipments', query)
      .pipe(
        takeUntil(this._onDestroy),
        tap((response: IResponse<{ shipments: IDataShipment[] }>) => {
          this.connote_ids = response.data.shipments.map((shipment: IDataShipment) => shipment.tracking_details.tracking_id);
          this.handleAddToPickupRequest();
        })
      )
      .subscribe();
  }

  onActionEvent(event: { data: IDataShipment; actionType: string }) {
    this.order_id = event.data.id;
    switch (event.actionType) {
      case 'gen-connote':
        this.onActionButtonIcon('gen-connote', false);
        return;
      case 'order-details':
          this.router.navigate(['my-shipment/order-details', event.data.id]);
          return;
      default:
        return;
    }
  }



  onActionButtonIcon(event: string, isMultiple = false) {
    const typeAction =
      event === 'gen-connote'
        ? this.languageData.generate_consignment_note
        : '';

    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        descriptions:
          event !== 'delete'
            ? this.languageData.action_note1 +' '+ typeAction +' '+ this.languageData.action_note2
            : typeAction,
        icon: 'warning',
        confirmEvent: true,
      },
    });

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe((result) => {
        if (result && event === 'gen-connote') this.onGenerateConnote(event, isMultiple);
        
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
  }

  onGenerateConnote(event: string, isMultiple: boolean) {
    this.commonService.isLoading(true);
    this.commonService.submitData('shipments', event, {
        scope: {
          all: false,
          shipment_ids: [this.order_id],
        },
      })
      .pipe(
        tap((response: any) => {
          if (response?.code === 'S0000') {
            this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => this.router.navigate(['my-shipment', 'add-order'], { queryParams: {
              id: this.pickup_number,
              date: this.pickup_date,
              }}
            ));
          }
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next:()=>{
          this.commonService.isLoading(false);
        },
        error:()=>{
          this.commonService.isLoading(false);
          this.commonService.openErrorDialog();
        },
        complete:()=>{
          this.myShipment.selectAllOrder(false);
        }
      });
  }

  onPageEvent(event: { currentPage: number; pageSize: number }) {
    this.currentPage = event.currentPage;
    this.pageSize = event.pageSize;
    this.fetchShipments();
  }

  addToPickup() {
    this.commonService.googleEventPush({
      "event": "add_order",
      "event_category": "SendParcel Pro - My Shipments - Add Order",
      "event_action": "Add Order",
      "event_label": "Order"
    });

    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        descriptions:
          this.languageData.add_orders_to_pickup,
        icon: 'warning',
        confirmEvent: true,
      },
    });

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe((result) => {
        
        this.commonService.googleEventPush({
          "event": "confirm_add_order",
          "event_category": "SendParcel Pro - My Shipments - Add Order",
          "event_action": "Confirm Add Order",
          "event_label": "Add Order"
        });

        if (result) {
          this.isSelectAllOrder
            ? this.calculateBatchProcessing()
            : this.handleAddToPickupRequest();
        }
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
  }

  private handleAddToPickupRequest() {
    this.commonService.isLoading(true);
    this.commonService
      .submitData('pickups', 'addtopickuprequest', {
        pickup_number: this.pickup_number,
        connote_ids: this.connote_ids,
        pickup_message: this.languageData.static_message,
      })
      .pipe(takeUntil(this._onDestroy))
      .subscribe({
        next: () => { 
          this.commonService.isLoading(false);
          if (this.isSelectAllOrder) {
            this.currentBatchPageRequest +=1;
            this.totalBatchRequest = this.totalBatchRequest - 1;
            const query = `list?uitab=all&page=${this.currentBatchPageRequest}&limit=100`;
            if (this.totalBatchRequest >= 1) this.fetchBatchShipments(query);
            else this.currentBatchPageRequest = 0;
          }
          this.commonService.redirectTo('/my-shipment/add-order', { pickup_number: this.pickup_number, date: this.pickup_date });
        },
        error: (err) => {
          let errorMessage = this.commonService.errorMessageTranslate(err?.error?.error?.data?.message);

          this.commonService.isLoading(false);
          this.dialog.open(DialogComponent, {
            data: {
              title: this.languageData.uh_oh,
              descriptions: errorMessage,
              icon: 'warning',
              confirmEvent: false,
              closeEvent: true

            },
          });
        }
      });
  }

  onSelectRow(dataShipments: IDataShipment[]) {
    this.connote_ids = dataShipments.map(
      (data) => data.tracking_details.tracking_id
    );
  }

  private get buildParams(): IShipmentParamFilter {
    return {
      uitab: 'add-orders',
      pickup_no: this.pickup_number,
      start_date: this.start_date,
      end_date: this.end_date,
      keyword: this.keyword,
      page: +this.currentPage,
      limit: +this.pageSize,
    };
  }

  private calculateBatchProcessing() {
    /* limit request per batch is 100 */
    const perRequest = this.totalShipmentRecords / 200;
    this.totalBatchRequest = perRequest < 1 ? 1 : Math.ceil(perRequest);

    this.currentBatchPageRequest +=1;
    const query = `list?uitab=all&page=${this.currentBatchPageRequest}&limit=200`;
    this.fetchBatchShipments(query)
  }
}
