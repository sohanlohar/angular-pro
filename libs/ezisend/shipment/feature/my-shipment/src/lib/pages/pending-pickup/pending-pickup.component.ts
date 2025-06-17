/* eslint-disable no-case-declarations */
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { IResponse } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { openPickupDialog } from '@pos/ezisend/shared/ui/dialogs/pickup-dialog';
import { MyShipmentHelper } from '@pos/ezisend/shipment/data-access/helper/my-shipment-helper';
import {
  IDataShipment,
  IShipment,
  IShipmentParamFilter
} from '@pos/ezisend/shipment/data-access/models';
import * as moment from 'moment';
import { catchError, filter, finalize, mergeMap, Observable, Subject, takeUntil, tap, map } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { bm } from '../../../../../../../assets/my';
import { en } from '../../../../../../../assets/en';
import { TranslationService } from '../../../../../../../shared-services/translate.service';
import { MyShipmentTableComponent } from '@pos/ezisend/shipment/ui/my-shipment-table';
import { environment } from '@pos/shared/environments';


@Component({
  selector: 'pos-pending-pickup',
  templateUrl: './pending-pickup.component.html',
  styleUrls: ['./pending-pickup.component.scss'],
})
export class PendingPickupComponent implements OnInit, OnDestroy {
  // currentYear = new Date().getFullYear();
  // maxDate = new Date(this.currentYear + 1, 11, 31);
  currentPage = 1;
  pageSize = 100;
  start_date = '';
  end_date = '';
  columns = [
    'select',
    'pickupNo',
    'status',
    'pickupTime',
    'pickupAddress',
    'quantity',
    'weight',
    'action',
  ];
  actions = ['print', 'edit', 'reschedule-pick-up', 'publish'];
  selectedMultipleData: IDataShipment[] = [];
  totalShipmentNoTrackingId: any = [];
  shipment$: Observable<IResponse<IShipment>> | undefined;
  protected _onDestroy = new Subject<void>();
  @ViewChild(MyShipmentTableComponent) myShipment:any;
  // Search Field
  keyword?: string;

  // Date Range
  dateRangePickerForm: FormGroup = this.fb.group({
    start_date: [''],
    end_date: [''],
  });

  pickup_status?: string;
  isSelectAllOrders = false;
  totalShipmentNotRequestPickup = 0;
  totalShipmentRecords = 0;
  totalBatchRequest = 0;
  currentBatchPageRequest = 0;
  batchProcessingIds: number[] = []; 
  shipment_status = '';
  minSelectableDate = moment().subtract(3, 'months').toDate();
  maxSelectableDate = moment().add(3, 'months').toDate();
  next30Start = '';
  next30End = '';
  isShowCommercialinvoiceButton = false;
  isSelectedShipmentsNoTrackingId = false;
  toggleValue = new FormControl('view-by-orders');
  activeTab = 'pending';
  showOrderMessage = 'pickup';
  totalTrackingDetails: any;
  isLoading = true;
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.myShipments.pending_shipments :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.myShipments.pending_shipments :
    en.data.myShipments.pending_shipments;

  // Select Dropdown
  dropdownOptions = [
    { value: '', viewValue: this.languageData.order_status_all },
    { value: 'pick up scheduled', viewValue: this.languageData.order_status_pickup_schedule },
    { value: 'pick up rescheduled', viewValue: this.languageData.order_status_pickup_reschedule },
    { value: 'partial picked up', viewValue: this.languageData.order_status_partial },
    { value: 'drop off requested', viewValue: this.languageData.order_status_dropoff },
    // { value: 'pick up cancelled', viewValue: 'Pick Up Cancelled' },
  ];

  constructor(
    public _commonService: CommonService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private translate: TranslationService
  ) {
    if (
      this.route.snapshot.queryParams &&
      this.route.snapshot.queryParams['viewBy'] === 'view-by-orders'
    ) {
      this.toggleValue.setValue('view-by-orders');
    }
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.myShipments.pending_shipments
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.myShipments.pending_shipments
      }

      this.dropdownOptions[0].viewValue = this.languageData.order_status_all;
      this.dropdownOptions[0].viewValue = this.languageData.order_status_pickup_schedule;
      this.dropdownOptions[0].viewValue = this.languageData.order_status_pickup_reschedule;
      this.dropdownOptions[0].viewValue = this.languageData.order_status_partial;
      this.dropdownOptions[0].viewValue = this.languageData.order_status_dropoff;
    })
  }

  ngOnInit(): void {
    this.next30Start = moment().startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
    this.next30End = moment().add(30, 'days').endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
    this.dateRangePickerForm = this.fb.group({
      start_date: [this.next30Start],
      end_date: [this.next30End],
    });

    this.fetchShipments();
    const eventDetails = {
      event: 'tab_to_section',
      event_category: 'SendParcel Pro - My Shipments - Pending Shipments',
      event_action: 'Tab To Section',
      event_label: 'Pending Shipments',
    };
    this._commonService.googleEventPush(eventDetails);
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  fetchShipments() {
    const query = `list?${MyShipmentHelper.contructFilterObject(
      this.buildParams
    )}`;
    this.shipment$ = this._commonService.fetchList('shipments', query);
    this.shipment$.subscribe({
      next:(res)=>{
        this.totalTrackingDetails=res.data.total;
        if(res){
          this.isLoading= false;
          this.cdr.detectChanges();
        }
        this.onSelectRow([]);
        this.myShipment?.selectAllOrder(false);
        this.cdr.detectChanges();
      }
    })
  }

  onActionEvent(event: { data: IDataShipment; actionType: string }) {
    let pickup_number;
    if(event.actionType == 'close'){
      pickup_number = event.data.pickup_details.pickup_number;
    }else{
      pickup_number = this.toggleValue.value === 'view-by-orders' ? event.data.tracking_details.tracking_id : event.data.pickup_details.pickup_number;
    }
    const pickup_datetime = event.data.pickup_details.pickup_datetime;
    const params:any = {
      activeTab: 'pending-pickup'
    }
    if (this.toggleValue.value === 'view-by-orders') {
      params['viewBy'] = 'view-by-orders'
    }
    const urlPathDetails = event?.data?.tracking_details?.category?.toLowerCase() === 'mps'
    ? 'my-shipment/mps-details'
    : 'my-shipment/order-details';

  const urlDetails = `${urlPathDetails}/${event.data.id}?activeTab=pending-pickup`;

    switch (event.actionType) {
      case 'publish':
        this.router.navigate(['my-shipment', 'add-order'], {
          queryParams: {
            pickup_number,
            date: moment(pickup_datetime).format('DD MMM YYYY'),
          },
        });
        return;
      case 'update':
        this.confirmReschedule(pickup_number);
        return;
      case 'close':
        this.confirmCancel(pickup_number);
        return;
      case 'parcel-details':
         if (event.data.tracking_details.category.toLowerCase() === 'mps') {
          this.router.navigate(['my-shipment/mps-details', event.data.id],{ queryParams: params });
        } else {
          this.router.navigate(['my-shipment/parcel-details', event.data.pickup_details.pickup_number], { queryParams: params });
        }
        // this.router.navigate(['my-shipment/parcel-details', event.data.pickup_details.pickup_number]);
        return;
      case 'print':
        this.onDownloadAsAndPrint('print', event.data.pickup_details.pickup_number, event.data.id);
        return;
      case 'order-details':
        this._commonService.googleEventPush({
          event: 'track_order',
          event_category: 'SendParcel Pro - My Shipments - All',
          event_action: 'Track Order',
          event_label: 'Track Order -' + event.data.tracking_details.tracking_id,
        });

        this._commonService.googleEventPush({
          event: 'view_order_details',
          event_category: 'SendParcel Pro - My Shipments - All',
          event_action: 'View Order Details',
          event_label: 'Order Details - ' + event.data.tracking_details.tracking_id,
          tracking_number: event.data.tracking_details.tracking_id,
          order_date: moment(event.data.created_date).format('DD MMM YYYY'),
          order_time: moment(event.data.created_date).format('h:mm:ss A'),
          parcel_category: event.data.tracking_details.category || undefined,
          parcel_weight: event.data.pickup_details.total_weight || undefined,
          parcel_width: event.data.pickup_details.width || null,
          parcel_height: event.data.pickup_details.height || null,
          parcel_length: event.data.pickup_details.length || null,
          volumetric_weight: event.data.pickup_details.volumetric_weight || null,
          item_description: event.data.pickup_details.item_description || null,
          sum_insured_amount: event.data.sum_insured || null,
          premium_amount: event.data.premium_amount || null,
          status: event.data.status,
          order_type: event.data.is_cod ? 'COD' : 'NON COD',
          currency: 'MYR',
          cash_on_delivery_amount: event.data.order_amount,
          insured_shipping_insurance: event.data.sum_insured ? 'Yes' : 'No',
          shipment_type: event.data.type,
        });
        window.open(urlDetails)
        return;
      case 'reschedule-pick-up':
        this.reschedulePickUp(event.data);
        return;
      case 'edit':

          const eventDetails ={
            "event": "edit_order",
            "event_category": "Send Parcel Pro - My Shipments - Pending Pick Up",
            "event_action": "Edit Order",
            "event_label": event.data.tracking_details.tracking_id,
          };
          this._commonService.googleEventPush(eventDetails)
          this._commonService.fetchList('shipments', `query?id=${event.data.id}`)
          .pipe(
            map((response: { data: any; }) => response.data),
            takeUntil(this._onDestroy),
            finalize(() => this.cdr.detectChanges)
          )
          .subscribe({
            next:(data)=>{
              this._commonService.setSelectedShipmentData(data);
              if(data.sender_details.pickup_option_id) {
                const currentDomain = window.location.origin;
                window.open(`${currentDomain}/order-edit/${event.data.id}/${data.sender_details.pickup_option_id}/pending-pickup`, '_blank');
              }else{
                const currentDomain = window.location.origin;
                window.open(`${currentDomain}/order-edit/${event.data.id}/pending-pickup`, '_blank');
              }
            },
            error:()=>{
              this._commonService.openErrorDialog();
              this.cdr.detectChanges;
            }
          });
        return;
      default:
        return;
    }
  }

  private confirmCancel(pickup_number: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        descriptions: this.languageData.cancel_pickup_note,
        icon: 'warning',
        confirmEvent: true,
      },
    });

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe((result) => {
        if (result) {
          this.cancel([pickup_number]);
        }
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
  }

  private errorMessage(err:any) {
    this.dialog.open(DialogComponent, {
      data: {
        title: 'Error',
        descriptions: err.error?.error?.message,
        icon: 'warning',
        confirmEvent: false,
        closeEvent: true
      },
    });
  }

  private cancelV2(pickup_number: string) {
    this._commonService.isLoading(true);
    this._commonService.submitDataV2('pickups', 'cancel', {
      connote_number: pickup_number
    })
    .pipe(takeUntil(this._onDestroy))
    .subscribe({
      next: (data) =>{
        this._commonService.isLoading(false);
        this.cdr.detectChanges();
        this.fetchShipments();
      },
      error: (err) => {
        this._commonService.isLoading(false);
        this.cdr.detectChanges();
        this.errorMessage(err)
      }
    });
  }

  private cancel(pickup_numbers: string[]) {
    this._commonService.isLoading(true);
    this._commonService.submitData('pickups', 'cancel', {
      pickup_numbers,
      cancel_notes: 'This is a static message',
    })
    .pipe(takeUntil(this._onDestroy))
    .subscribe({
      next: (data) =>{
        this._commonService.isLoading(false);
        this.cdr.detectChanges();
        this.fetchShipments();
      },
      error: (err) => {
        this._commonService.isLoading(false);
        this.cdr.detectChanges();
        this.errorMessage(err)
      }
    });
  }

  private confirmReschedule(pickup_number: string) {
    openPickupDialog(this.dialog)
      .pipe(
        filter((date) => !!date),
        mergeMap((date: string) => this.reschedule(date, pickup_number)),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next:() => {
          this._commonService.isLoading(false);
          this.cdr.detectChanges();
          this._commonService.redirectTo('/my-shipment', { t: 'pending-pickup' });
        },
        error: (err) => {
          this._commonService.isLoading(false);
          this.cdr.detectChanges();
          this.errorMessage(err.error?.error?.data !== null ? err.error?.error?.data : err)
        }
      });
  }

  private reschedule(pickup_datetime: string, pickup_number: string) {
    this._commonService.isLoading(true);
    return this._commonService.submitData('pickups', 'reschedule', {
      pickup_number,
      pickup_datetime,
    });
  }

  onPageEvent(event: { currentPage: number; pageSize: number }) {
    this.currentPage = event.currentPage;
    this.pageSize = event.pageSize;
    this.fetchShipments();
  }

  onSearchEvent(search: string) {
    this.keyword = search.trim();
    this._commonService.googleEventPush({
      event: 'search_shipment',
      event_category: 'SendParcel Pro - My Shipments - Pending Shipments',
      event_action: 'Search Shipment',
      event_label: this.keyword,
    });
  
    const query = `list?uitab=pending-pickup&keyword=${this.keyword}&page=${this.currentPage}&limit=100`;
    const params: any = {
      activeTab: 'pending-pickup',
    };
  
    if (this.toggleValue.value === 'view-by-orders') {
      params['viewBy'] = 'view-by-orders';
    }
  
    this._commonService.fetchList('shipments', query).subscribe((data) => {
      // Check if the `total` field is greater than 0
      if (data?.data?.total > 0) {
        const regexPattern = /^[a-zA-Z]{2}.*[a-zA-Z]{2}$/;
  
        // Reload table data
        this.fetchShipments();
  
        // Extract the pickup number safely
        const pickupNumber = data.data.shipments[0]?.pickup_details?.pickup_number;
  
        if (pickupNumber) {
          if (regexPattern.test(search.trim())) {
            params['keyword'] = search.trim();
            this.router.navigate(['my-shipment/parcel-details', pickupNumber], { queryParams: params });
          } else {
            this.router.navigate(['my-shipment/parcel-details', pickupNumber], { queryParams: params });
          }
        }
      } else {
        this.openSnackBar('Data not found for given input', 'close');
      }
    });
  }
  
  

  onDateRangePickerFormChange(event: any) {
    if (event) {
      this.start_date = event.start_date;
      this.end_date = event.end_date;
      const eventDetails = {
        event: 'filter_section',
        event_category:
          'SendParcel Pro - My Shipments - Pending Shipments',
        event_action: 'Filter Section',
        event_label: this.start_date + ' - ' + this.end_date,
      };
          this._commonService.googleEventPush(eventDetails);
    } else {
      this.start_date = '';
      this.end_date = '';
    }
    this.fetchShipments();
  }

  onSelectChange(pickupStatus: string) {
    const status =
      pickupStatus === 'pick up scheduled'
      ? 'pickup-requested'
      : pickupStatus === 'pick up rescheduled'
      ? 'pickup-rescheduled'
      : pickupStatus === 'partial picked up'
      ? 'partial-picked-up'
      : pickupStatus === 'pick up cancelled'
      ? 'cancelled'
      : pickupStatus === 'drop off requested'
      ? 'pending-dropoff'
      :'';

    this.pickup_status = status;
    const orderStatusLabel = status?.trim() || "all";
    const eventDetails = {
      event: 'filter_section',
      event_category:
        'SendParcel Pro - My Shipments - Pending Shipments',
      event_action: 'Filter Section',
      event_label: "Order Status – " + orderStatusLabel,
   };
                this._commonService.googleEventPush(eventDetails);
    this.fetchShipments();
  }

  // private get buildParams(): IShipmentParamFilter {
  //   return {
  //     uitab: 'pending-pickup',
  //     pickup_start_date : this.start_date,
  //     pickup_end_date: this.end_date,
  //     pickup_status: this.pickup_status,
  //     keyword: this.keyword,
  //     page: +this.currentPage,
  //     limit: +this.pageSize,
  //   };
  // }

  private get buildParams(): IShipmentParamFilter {
    const isViewByOrders = this.toggleValue.value === 'view-by-orders';

    const baseParams: IShipmentParamFilter = {
      uitab: 'pending-pickup', // isViewByOrders ? 'live' : 'pending-pickup',
      pickup_start_date: this.start_date,
      pickup_end_date: this.end_date,
      pickup_status: this.pickup_status,
      keyword: this.keyword,
      page: +this.currentPage,
      limit: +this.pageSize,
      shipment_status: this.shipment_status
    };
    if (this.toggleValue.value) {
      baseParams.view_option = this.toggleValue.value;
    }
    this.showOrderMessage = isViewByOrders ? 'order' : 'pick up'
    this.activeTab = 'pending';
    this.actions = isViewByOrders ? ['print', 'edit', 'reschedule-pick-up', 'close'] : ['print', 'reschedule-pick-up', 'publish', 'close'];
    this.columns = isViewByOrders
      ? ['select', 'trackingDetail', 'pickupNo', 'status','pickupTime', 'recipient', 'deliveryDetail', 'type', 'action']
      : ['select', 'pickupNo', 'status', 'pickupTime', 'pickupAddress', 'quantity', 'weight', 'action'];

    return baseParams;
  }

  onDownloadAsAndPrint(event: string, pickupNumber : string, shipmentId: number) {
    const shipmentIds: string = pickupNumber;

    const query = this.toggleValue.value === 'view-by-orders' ? 'connote/print' :`pickup/connote/print`;

    const shipmentPayload:any = {
      ids: [shipmentId],
      includeChildren: true
    }

    if (this.toggleValue.value !== 'view-by-orders') {
      delete shipmentPayload.ids;
      shipmentPayload.pickup_id = shipmentIds;
    }
    // {
    //   pickup_id: shipmentIds,
    //   includeChildren: true
    // }
    this._commonService.isLoading(true);
    this._commonService
      .submitData('shipments', query, shipmentPayload)
      .pipe(
        takeUntil(this._onDestroy),
        tap((response: IResponse<{ link: string }>) => {
          this._commonService.isLoading(false);
          this.cdr.detectChanges();
          window.open(
            `${environment.sppUatUrl.replace('/api/', '')}${
              response.data.link
            }`
          )
        }),
        catchError((err)=> {
          this._commonService.openErrorDialog();
          return err;
        }),
        finalize(()=>{
          this.cdr.detectChanges();
          this._commonService.isLoading(false);
        })
      )
      .subscribe();
  }

  private openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  onFilterCheckbox(filter: string) {
    this.shipment_status = filter === 'all' ? '' : filter;
    this.fetchShipments();
  }

  onSelectRow(data: IDataShipment[]) {
    this.selectedMultipleData = data;
    this.isSelectAllOrders = false;
    this.isShowCommercialinvoiceButton = this.selectedMultipleData.some(
      (order: IDataShipment) => order.type === 'INTERNATIONAL'
    );

    this.totalShipmentNoTrackingId = data.filter(
      (shipment: IDataShipment) => shipment.tracking_details.tracking_id === ''
    ).length;

    if (this.toggleValue.value === 'view-by-orders') {
      this.totalShipmentNotRequestPickup = data.filter(
        (shipment: IDataShipment) =>
          shipment.tracking_details.tracking_id !== ''
      ).length;
    } else {
      this.totalShipmentNotRequestPickup = data.reduce(
        (accumulator, shipment) => {
          return accumulator + Number(shipment.pickup_details.total_quantity);
        },
        0
      );
    }


    this.isSelectedShipmentsNoTrackingId = this.selectedMultipleData.every(
      (shipment: IDataShipment) => this.toggleValue.value === 'view-by-orders' ? shipment.tracking_details.tracking_id === '' : shipment.pickup_details.pickup_number === ''
    )
  }

  onActionButtonIcon(event: string, isMultiple = false) {
    /* single or present */
    const orderState =
      isMultiple && this.selectedMultipleData.length > 1 ? "order's" : 'order';

    /* description label action */
    const typeAction =
      event === 'print'
        ? 'Print Label'
        : event === 'connote'
        ? 'Download Consignment Note'
        : event === 'tallysheet'
        ? 'Download Tallysheet'
        : event === 'commercialinvoice'
        ? 'Download Commercial Invoice'
        : '';

    /* actions */
    if (event === 'connote' ||
      event === 'tallysheet' ||
      event === 'commercialinvoice' ||
      event === 'print') {
      this.isSelectAllOrders
        ? this.calculateBatchProcessing(event)
        : this.onPrintAndDownloadShipments(event, isMultiple);

      return;
    }

    if (event === 'print') {
      this._commonService.googleEventPush({
        event: 'print_label',
        event_category: 'SendParcel Pro - My Shipments - Pending Shipments',
        event_action: 'Click Print Label',
        event_label: 'Print Label',
      });
    }

    /* dialog config */
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        descriptions:
          event !== 'delete'
            ? `Are you sure you want to ${typeAction} for this ${orderState}?`
            : typeAction,
        icon: 'warning',
        confirmEvent: true,
      },
    });

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe((result) => {
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
  }

  private calculateBatchProcessing(event: string, isMultiple?: boolean) {
    /* limit request per batch is 100 */
    const perRequest = this.totalShipmentRecords / 200;
    this.totalBatchRequest = perRequest < 1 ? 1 : Math.ceil(perRequest);

    this.currentBatchPageRequest = 1;
    const query = `list?uitab=request-pickup&page=${this.currentBatchPageRequest}&limit=${this.totalShipmentRecords}`;
    this.fetchBatchShipments(event, query, isMultiple)
  }

  onPrintAndDownloadShipments(event: string, isMultiple = false) {
    let shipmentIds: any = [];
    /* if select all orders toggle */
    if (this.isSelectAllOrders) {
      shipmentIds = this.batchProcessingIds;
    }
    if (!this.isSelectAllOrders && isMultiple) {
      /* multiple checkbox tick */
      /* button print lable, download connote & tallysheet */
      /* just grab all shipment ids without filtering */
      if (event === 'connote' || event === 'tallysheet') {
        const shipmentwithTrackingId =
          this.selectedMultipleData.filter((shipment: IDataShipment) => this.toggleValue.value === 'view-by-orders' ? +shipment.id : shipment.pickup_details.pickup_number !== '');
        if (shipmentwithTrackingId.length) {
          shipmentIds = shipmentwithTrackingId.map(
            (shipment: IDataShipment) => shipment.id
          );
        }

      } else if (event === 'print') {
        const shipmentWithTrackingId =
          this.selectedMultipleData.filter((shipment: IDataShipment) => this.toggleValue.value === 'view-by-orders' ? +shipment.id : shipment.pickup_details.pickup_number !== '');
        if (shipmentWithTrackingId.length) {
          shipmentIds = shipmentWithTrackingId.map((shipment: IDataShipment) => this.toggleValue.value === 'view-by-orders' ? +shipment.id : shipment.pickup_details.pickup_number);
        }
      } else if (event === 'commercialinvoice') {
        /* button download commercial invoice; before download */
        /* need to filter the shipment that have type INTERNATIONAL only */
        const shipmentwithTrackingId =
          this.selectedMultipleData.filter((shipment: IDataShipment) => this.toggleValue.value === 'view-by-orders' ? +shipment.id : shipment.pickup_details.pickup_number !== '');
        if (shipmentwithTrackingId.length) {
          const shipmentsInternational =
            this.selectedMultipleData.filter((shipment: IDataShipment) => shipment.type === 'INTERNATIONAL');
          if (shipmentsInternational.length) {
            shipmentIds = shipmentsInternational.map((shipment: IDataShipment) => +shipment.id);
          }
        }
      }
    }

    const query =
      event === 'commercialinvoice'
        ? `${event}/print`
        : event === 'tallysheet'
        ? `${event}/download`
        : event === 'print'
        ? (this.toggleValue.value === 'view-by-orders' ? 'connote/print' :`pickup/connote/print`)
        : event === 'connote'
        ? 'thermal/prn'
        : '';

    const shipmentPayload:any = {
      ids: shipmentIds,
      includeChildren: true
    }
    if (event === 'print' && this.toggleValue.value !== 'view-by-orders') {
      delete shipmentPayload.ids;
      shipmentPayload.pickup_ids = shipmentIds;
    }
    this._commonService.isLoading(true);
    this._commonService
      .submitData('shipments', query, shipmentPayload)
      .pipe(
        tap((response: IResponse<{ link: string }>) => {
          this._commonService.isLoading(false);
          this.cdr.detectChanges();
          window.open(
            `${environment.sppUatUrl.replace('/api/', '')}${
              response.data.link
            }`
          )
          if (this.isSelectAllOrders) {
            this.currentBatchPageRequest +=1;
            this.totalBatchRequest = this.totalBatchRequest - 1;
            const query = `list?uitab=request-pickup&page=${this.currentBatchPageRequest}&limit=100`;
            if (this.totalBatchRequest >= 1) this.fetchBatchShipments(event, query);
            else this.currentBatchPageRequest = 0;
          }
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next:()=>{
          this._commonService.isLoading(false);
          this.cdr.detectChanges();
        },
        error:()=>{
          this.cdr.detectChanges();
          this._commonService.isLoading(false);
          this._commonService.openErrorDialog();
        },
        complete:()=> {
          this.cdr.detectChanges();
          this._commonService.isLoading(false);
        }
      });
  }

  fetchBatchShipments(event: string, query: string, isMultiple?: any) {
    this.batchProcessingIds = [];
    this._commonService.fetchList('shipments', query)
      .pipe(
        takeUntil(this._onDestroy),
        tap((response: IResponse<{ shipments: IDataShipment[] }>) => {
          if (event === 'gen-connote' || event === 'gen-connote-v2' ) {
            const shipmentNoTrackingId =
              response.data.shipments.filter((shipment: IDataShipment) => shipment.pickup_details.pickup_number === '');
            if (shipmentNoTrackingId.length) {
              this.batchProcessingIds = shipmentNoTrackingId.map((shipment: IDataShipment) => +shipment.id);
            }
          } else if (event === 'requestPickup') {
            this._commonService.isLoading(true);
            const shipmentwithTrackingId =
              response.data.shipments.filter((shipment: IDataShipment) => shipment.pickup_details.pickup_number !== '');
            if (shipmentwithTrackingId.length) {
              this.batchProcessingIds = shipmentwithTrackingId.map((shipment: IDataShipment) => shipment.tracking_details.tracking_id);
            }
          } else if (event === 'print') {
            this.batchProcessingIds = response.data.shipments.map((shipment: IDataShipment) => +shipment.id);
          } else if (
            event === 'connote' ||
            event === 'tallysheet'
          ) {
            const shipmentwithTrackingId =
              response.data.shipments.filter((shipment: IDataShipment) => shipment.pickup_details.pickup_number !== '');

            if (shipmentwithTrackingId.length) {
              this.batchProcessingIds = shipmentwithTrackingId.map((shipment: IDataShipment) => +shipment.id);
            }

            if (shipmentwithTrackingId.length > 100 && event === 'connote') {
              this.dialog.open(DialogComponent, {
                data: {
                  title: 'Uh-oh',
                  descriptions: 'You can download up to 100 consignment notes at one time. Please unselect the remaining consignment notes to proceed with the download action.',
                  icon: 'warning',
                  confirmEvent: false,
                  closeEvent: true
                },
              });
              return
            }
          } else if (event === 'commercialinvoice') {
            const shipmentwithTrackingId =
              response.data.shipments.filter((shipment: IDataShipment) => shipment.pickup_details.pickup_number !== '');

            if (shipmentwithTrackingId.length) {
              const shipmentsInternational =
                response.data.shipments.filter((shipment: IDataShipment) => shipment.type === 'INTERNATIONAL');
              if (shipmentsInternational.length) {
                this.batchProcessingIds = shipmentsInternational.map((shipment: IDataShipment) => +shipment.id);
              }
            }
          }
          this.onPrintAndDownloadShipments(event);
        })
      )
      .subscribe({
        next:(res)=> { this._commonService.isLoading(false);this.cdr.detectChanges(); },
        error:(err)=>{
          this.cdr.detectChanges();
          this._commonService.isLoading(false);
          // this._commonService.openErrorDialog();
          this._commonService.openCustomErrorDialog(err);
        },
        complete:()=> {
          this.cdr.detectChanges();
          this._commonService.isLoading(false);
        }
      });
  }

/**
 * Method Name: reschedulePickUp
 *
 * Input Parameters:
 *   - data (IDataShipment): Contains shipment details including pickup information.
 *
 * Output Parameters:
 *   - void: This method doesn't return any value, but it opens a dialog and performs actions based on user input.
 *
 * Purpose:
 *   - This method triggers the rescheduling of a shipment pickup by opening a dialog for the user to select a new date.
 *
 * Author:
 *   - [Saepul Latif]
 *
 * Description:
 *   - The method opens a dialog where the user is prompted with a reschedule pickup message. It uses language-specific content for the title and description.
 *   - The dialog includes an option for the user to confirm the event (`confirmEvent`).
 *   - When the user confirms, the subscription listens for changes to the date (via `changeDate`), and once the new date is selected, the `onReschedulePickUp` method is called with the selected date and the pickup number.
 *   - The `takeUntil(this._onDestroy)` operator is used to clean up the subscriptions to avoid memory leaks when the component is destroyed.
 */
  private reschedulePickUp(data: IDataShipment){
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: this.languageData.reschedule_pickup_title,
        descriptions: this.languageData.reschedule_pickup_description,
        confirmEvent: true,
        actionText: 'Request for Pickup',
        type: 'date',
        hideAction: true,
        // width: '30rem'
      },
    });


      dialogRef.componentInstance
      .confirmEvent
      .pipe(
        takeUntil(this._onDestroy)
      ).subscribe((result) => {
        if (result) {
          dialogRef.componentInstance.changeDate
          .pipe(
            takeUntil(this._onDestroy)
          ).subscribe((res) => {
            this.onReschedulePickUp(data.pickup_details.pickup_number, res, dialogRef);
                 // Trigger Google Analytics event for date selection
        const eventDetails = {
          event: "pick_up_edit_date",
          event_category: "SendParcel Pro - My Shipments - Pending Shipments",
          event_action: "Edit Pick Up Date",
          event_label: "Pick Up Date",
        };
        // Push event details to Google Analytics
        this._commonService.googleEventPush(eventDetails);
              })
            }
      });
  }

  private onReschedulePickUp(
    pickupNumber: string,
    pickupDateTime: string,
    dialogRef: MatDialogRef<DialogComponent, any>
  ){

    this._commonService.submitData('pickups','reschedule',
      { pickup_number: pickupNumber,
        pickup_datetime: pickupDateTime
      }
    ).pipe((
      takeUntil(this._onDestroy)
    ))
    .subscribe({
      next: (res) => {
        this.fetchShipments();
        dialogRef.close();
        this.openSnackBar(
          res.message,
          'close'
        );
        // Trigger Google Analytics event on successful date chaneg
        const eventDetails = {
          event: "pick_up_schedule_request_success",
          event_category: "SendParcel Pro - My Shipments - Pending Shipments",
          event_action: "Pick Up Schedule Request Success",
          event_label: "Success",
        };
        // Push event details to Google Analytics
        this._commonService.googleEventPush(eventDetails);
      },
      error: (err) => {
        dialogRef.close();
        this.openSnackBar(
          err.error.error.message || 'Internal Server Error',
          'close'
        );
      }
    })
        // Trigger Google Analytics event for date selection
        const eventDetails = {
          event: "pick_up_submit_schedule_request",
          event_category: "SendParcel Pro - My Shipments - Pending Shipments",
          event_action: "Submit Schedule Request",
          event_label: "Schedule Request –" + pickupDateTime,
        };
        // Push event details to Google Analytics
        this._commonService.googleEventPush(eventDetails);
  }
}
