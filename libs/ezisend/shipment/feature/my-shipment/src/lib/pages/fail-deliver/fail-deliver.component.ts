/* eslint-disable no-case-declarations */
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IResponse } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { MyShipmentHelper } from '@pos/ezisend/shipment/data-access/helper/my-shipment-helper';
import {
  IDataShipment,
  IShipment,
  IShipmentParamFilter,
} from '@pos/ezisend/shipment/data-access/models';
import { environment } from '@pos/shared/environments';
import { catchError, EMPTY, Observable, Subject, takeUntil, tap } from 'rxjs';
import { bm } from '../../../../../../../assets/my';
import { en } from '../../../../../../../assets/en';
import { TranslationService } from '../../../../../../../shared-services/translate.service';
import * as moment from 'moment';

@Component({
  selector: 'pos-fail-deliver',
  templateUrl: './fail-deliver.component.html',
  styleUrls: ['./fail-deliver.component.scss'],
})
export class FailDeliverComponent implements OnInit, OnDestroy {
  currentPage = 1;
  pageSize = 100;
  start_date = '';
  end_date = '';
  keyword? = '';
  cod_type?: string;
  selectedMultipleData: IDataShipment[] = [];
  isSelectAllOrders = false;
  isSelectedShipmentsNoTrackingId = false;
  isPlugins = false;
  totalShipmentNotRequestPickup = 0;
  totalShipmentNoTrackingId = 0;
  isShowCommercialinvoiceButton = false;
  totalShipmentRecords = 0;
  totalBatchRequest = 0;
  currentBatchPageRequest = 0;
  batchProcessingIds: number[] = [];
  selectedSingleData!: IDataShipment;
  shipment_status = '';
  minSelectableDate = moment().subtract(3, 'months').toDate();
  maxSelectableDate = moment().add(3, 'months').toDate();
  columns = [
    'select',
    'trackingDetail',
    'status',
    'reason',
    'recipient',
    'deliveryDetail',
    'type',
    'action',
  ];
  actions = ['print','my_location'];
  shipment$: Observable<IResponse<IShipment>> | undefined;
  totalTrackingDetails:any;
  // Date Range
  dateRangePickerForm: FormGroup = this.fb.group({
    start_date: [''],
    end_date: [''],
  });
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.myShipments.failed_deliveries :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.myShipments.failed_deliveries :
    en.data.myShipments.failed_deliveries;
  // Select Dropdown
  dropdownOptions = [
    { value: '', viewValue: this.languageData.all },
    { value: 'cod', viewValue: 'COD' },
    { value: 'non_cod', viewValue: this.languageData.non_cod },
  ];

  protected _onDestroy = new Subject<void>();
  isLoading = true;
  current_tab = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public _commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private translate: TranslationService
  ) {
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.myShipments.failed_deliveries
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.myShipments.failed_deliveries
      }
      this.dropdownOptions[0].viewValue = this.languageData.all;
      this.dropdownOptions[2].viewValue = this.languageData.non_cod;
    })
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.current_tab = params['t']
    })
    // For API
     this.end_date = moment().endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
    this.start_date = moment().subtract(30, 'days').startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
    // For Date Picker UI (local time)
    const localEndDate = moment().endOf('day').format('YYYY-MM-DDTHH:mm:ss');
    const localStartDate = moment().subtract(30, 'days').startOf('day').format('YYYY-MM-DDTHH:mm:ss');

    this.dateRangePickerForm = this.fb.group({
      start_date: [localStartDate],
      end_date: [localEndDate],
    });
    this.route.queryParams.subscribe((res: any) => (this.cod_type = res.q));
    const eventDetails = {
      event: 'tab_to_section',
      event_category: 'SendParcel Pro - My Shipments - Failed Deliveries',
      event_action: 'Tab To Section',
      event_label: 'Failed Deliveries',
    };// Log for debugging
    this._commonService.googleEventPush(eventDetails);
    this.fetchShipments();
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  onFilterCheckbox(filter: string) {
    this.shipment_status = filter === 'all' ? '' : filter;
    this.fetchShipments();
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
        }
        this.cdr.detectChanges();
      }
    })
  }

  onActionEvent(event: { data: IDataShipment; actionType: string }) {
    this.selectedSingleData = event.data;
    const urlPathDetails = event?.data?.tracking_details?.category?.toLowerCase() === 'mps'
    ? 'my-shipment/mps-details'
    : 'my-shipment/order-details';
  const urlDetails = `${urlPathDetails}/${event.data.id}?activeTab=${this.current_tab}`;
    switch (event.actionType) {
      case 'my_location':
        const eventDetails ={
          event: 'track_order',
          event_category: 'SendParcel Pro - My Shipments - Failed Deliveries',
          event_action: 'Track Order',
          event_label: 'Track Order - ' + event.data.tracking_details.tracking_id,
        };
        this._commonService.googleEventPush(eventDetails)
      window.open(urlDetails);
        return;
      case 'print':
        this.onActionButtonIcon('print', false);
        return;
      case 'order-details':
        // this._commonService.googleEventPush({
        //   event: 'track_order',
        //   event_category: 'SendParcel Pro - My Shipments - Failed Deliveries',
        //   event_action: 'Track Order',
        //   event_label: 'Track Order -' + event.data.tracking_details.tracking_id,
        // });
        const eventDetailsOrderDetails = {
          event: 'view_order_details',
          event_category: 'SendParcel Pro - My Shipments - Failed Deliveries',
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
        };
        this._commonService.googleEventPush(eventDetailsOrderDetails)
        window.open(urlDetails);
        return;
      default:
        return;
    }
  }

  onPageEvent(event: { currentPage: number; pageSize: number }) {
    this.currentPage = event.currentPage;
    this.pageSize = event.pageSize;
    this.fetchShipments();
  }

  onSelectRow(data: IDataShipment[]) {
    this.selectedMultipleData = data;

    this.isPlugins = data.some(
      (shipment : IDataShipment) =>  Object.keys(shipment.channel_order).length !== 0
    )

    this.isShowCommercialinvoiceButton = this.selectedMultipleData.some(
      (order: IDataShipment) => order.type === 'INTERNATIONAL'
    );

    this.totalShipmentNoTrackingId = data.filter(
      (shipment: IDataShipment) => shipment.tracking_details.tracking_id === ''
    ).length;

    this.totalShipmentNotRequestPickup = data.filter(
      (shipment: IDataShipment) => shipment.tracking_details.tracking_id !== ''
    ).length;

    this.isSelectedShipmentsNoTrackingId = this.selectedMultipleData.every(
      (shipment: IDataShipment) => shipment.tracking_details.tracking_id === ''
    )
    // console.log('this.selectedMultipleData =',this.selectedMultipleData)
    // console.log('this.isSelectedShipmentsNoTrackingId =',this.isSelectedShipmentsNoTrackingId)

  }


  onActionButtonIcon(event: string, isMultiple = false) {
    let shipmentIds: number[] = [];
    const query =
      event === 'tallysheet'
        ? `${event}/download`
        : ''
        ? event === 'print'
        : 'Print Label';

    if (
      event === 'connote' ||
      event === 'commercialinvoice' ||
      event === 'print'
    ) {
      this.isSelectAllOrders
        ? this.calculateBatchProcessing(event)
        : this.onDownloadAsAndPrint(event, isMultiple);

      return;
    }

    const shipmentwithTrackingId = this.selectedMultipleData.filter(
      (shipment: IDataShipment) => shipment.tracking_details.tracking_id !== ''
    );

    if (this.isSelectAllOrders) {
      shipmentIds = this.batchProcessingIds;
    }

    if (shipmentwithTrackingId.length) {
      shipmentIds = shipmentwithTrackingId.map(
        (shipment: IDataShipment) => shipment.id
      );
    }

    if (!this.isSelectAllOrders && !isMultiple) {
      shipmentIds.push(this.selectedSingleData.id);
    }

    if (event === 'print') {
      this._commonService.googleEventPush({
        event: 'print_label',
        event_category: 'SendParcel Pro - My Shipments - Failed Deliveries',
        event_action: 'Click Print Label',
        event_label: 'Print Label',
      });
    }

    this._commonService
      .submitData('shipments', query, {
        ids: shipmentIds,
      })
      .pipe(
        takeUntil(this._onDestroy),
        tap((response: IResponse<{ link: string }>) => {
          window.open(
            `${environment.sppUatUrl.replace('/api/', '')}${response.data.link}`
          );
        }),
        catchError(() => {
          this._commonService.openErrorDialog();
          return EMPTY;
        })
      )
      .subscribe();
  }

  onActionIconEvent(event: { data: IDataShipment; actionType: string }) {
    this.selectedSingleData = event.data;
    switch (event.actionType) {
      case 'tallysheet':
        this.onActionButtonIcon(event.actionType, false);
        return;
      case 'print':
        this.onActionButtonIcon('print', false);
        return;
      case 'order-details':
        this.router.navigate([event.data.tracking_details.category.toLowerCase() === 'mps' ? 'my-shipment/mps-details' :'my-shipment/order-details', event.data.id], { queryParams: {activeTab: 'failed-deliver'} });
        return;
      default:
        return;
    }
  }

  searchFieldChange(event?: any) {
    if (event?.target?.value || event?.target?.value == '') {
      this.keyword = event.target.value;
    }
  }
  searchFieldClick() {
    this.fetchShipments();
  }

  onSearchEvent(search: string) {
    this.keyword = search.trim();
    this._commonService.googleEventPush({
      event: 'search_order',
      event_category:
        'SendParcel Pro - My Shipments - Failed Deliveries',
      event_action: 'Search Order',
      event_label: this.keyword,
    });
    this.fetchShipments();
  }

  onDateRangePickerFormChange(event: any) {
    if (event) {
      this.start_date = event.start_date;
      this.end_date = event.end_date;
      this._commonService.googleEventPush({
        event: 'filter_section',
        event_category:
          'SendParcel Pro - My Shipments - Failed Deliveries',
        event_action: 'Filter Section',
        event_label: this.start_date + ' - ' + this.end_date,
      });
    } else {
      this.start_date = '';
      this.end_date = '';
    }
    this.fetchShipments();
  }

  onSelectChange(orderType: string) {
    this.cod_type = orderType;
    const orderTypeLabel = orderType?.trim() || "all";
    this._commonService.googleEventPush({
      event: 'filter_section',
      event_category:
        'SendParcel Pro - My Shipments - Failed Deliveries',
      event_action: 'Filter Section',
      event_label: "Order Type – " + orderTypeLabel,
    });
    this.fetchShipments();
  }

  private get buildParams(): IShipmentParamFilter {
    return {
      uitab: 'failed-delivery',
      start_date: this.start_date,
      end_date: this.end_date,
      cod_type: this.cod_type,
      keyword: this.keyword,
      page: +this.currentPage,
      limit: +this.pageSize,
    };
  }

  fetchBatchShipments(event: string, query: string) {
    this.batchProcessingIds = [];
    this._commonService
      .fetchList('shipments', query)
      .pipe(
        takeUntil(this._onDestroy),
        tap((response: IResponse<{ shipments: IDataShipment[] }>) => {
          if (event === 'print') {
            this.batchProcessingIds = response.data.shipments.map(
              (shipment: IDataShipment) => +shipment.id
            );
          } else if (event === 'tallysheet') {
            const shipmentwithTrackingId = response.data.shipments.filter(
              (shipment: IDataShipment) =>
                shipment.tracking_details.tracking_id !== ''
            );

            if (shipmentwithTrackingId.length) {
              this.batchProcessingIds = shipmentwithTrackingId.map(
                (shipment: IDataShipment) => +shipment.id
              );
            }
          }
        })
      )
      .subscribe({
        next: (res) => {
          this._commonService.isLoading(false);
        },
        error: (err) => {
          this.cdr.detectChanges();
          this._commonService.isLoading(false);
          // this._commonService.openErrorDialog();
          this._commonService.openCustomErrorDialog(err);
        },
        complete: () => {
          this.cdr.detectChanges();
          this._commonService.isLoading(false);
        },
      });
  }

  onDownloadAsAndPrint(event: string, isMultiple = false) {
    let shipmentIds: number[] = [];
    /* if select all orders toggle */
    if (this.isSelectAllOrders) {
      shipmentIds = this.batchProcessingIds;
    }
    if (!this.isSelectAllOrders && isMultiple) {
      /* multiple checkbox tick */
      /* button print lable, download connote & tallysheet */
      /* just grab all shipment ids without filtering */
      if (event === 'connote' || event === 'tallysheet') {
        const shipmentwithTrackingId = this.selectedMultipleData.filter(
          (shipment: IDataShipment) =>
            shipment.tracking_details.tracking_id !== ''
        );
        if (shipmentwithTrackingId.length) {
          shipmentIds = shipmentwithTrackingId.map(
            (shipment: IDataShipment) => shipment.id
          );
        }
      } else if (event === 'print') {
        const shipmentWithTrackingId = this.selectedMultipleData.filter(
          (shipment: IDataShipment) =>
            shipment.tracking_details.tracking_id !== ''
        );
        if (shipmentWithTrackingId.length) {
          shipmentIds = shipmentWithTrackingId.map(
            (shipment: IDataShipment) => +shipment.id
          );
        }
      } else if (event === 'commercialinvoice') {
        /* button download commercial invoice; before download */
        /* need to filter the shipment that have type INTERNATIONAL only */
        const shipmentsInternational = this.selectedMultipleData.filter(
          (shipment: IDataShipment) => shipment.type === 'INTERNATIONAL'
        );
        if (shipmentsInternational.length) {
          shipmentIds = shipmentsInternational.map(
            (shipment: IDataShipment) => +shipment.id
          );
        }
      }
    }
    if (!this.isSelectAllOrders && !isMultiple) {
      shipmentIds.push(this.selectedSingleData.id);
    }

    const query =
      event === 'commercialinvoice'
        ? `${event}/print`
        : event === 'tallysheet'
        ? `${event}/download`
        : event === 'print'
        ? 'connote/print'
        : event === 'connote'
        ? 'thermal/prn'
        : '';

    /* above condition for print label and connote has changed */
    /* previous */
    /*
      if (event === 'print') query = 'thermal/prn
      if (event === connote') query = `${event}/print`
    */

    this._commonService.isLoading(true);
    this._commonService
      .submitData('shipments', query, {
        ids: shipmentIds,
        includeChildren: true
      })
      .pipe(
        tap((response: IResponse<{ link: string }>) => {
          this._commonService.isLoading(false);
          window.open(
            `${environment.sppUatUrl.replace(
              '/api/',
              ''
            )}${response.data.link}`
          );
          if (this.isSelectAllOrders) {
            this.currentBatchPageRequest += 1;
            this.totalBatchRequest = this.totalBatchRequest - 1;
            const query = `list?uitab=request-pickup&page=${this.currentBatchPageRequest}&limit=100`;
            // if (this.totalBatchRequest >= 1) this.fetchBatchShipments(event, query);
            // else this.currentBatchPageRequest = 0;
          }
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next: () => {
          this._commonService.isLoading(false);
        },
        error: () => {
          this.cdr.detectChanges();
          this._commonService.isLoading(false);
          this._commonService.openErrorDialog();
        },
        complete: () => {
          this.cdr.detectChanges();
          this._commonService.isLoading(false);
        },
      });
  }

  private calculateBatchProcessing(event: string) {
    /* limit request per batch is 100 */
    const perRequest = this.totalShipmentRecords / 200;
    this.totalBatchRequest = perRequest < 1 ? 1 : Math.ceil(perRequest);
    this.currentBatchPageRequest = 1;
    const query = `list?uitab=request-pickup&page=${this.currentBatchPageRequest}&limit=${this.totalShipmentRecords}`;
    this.fetchBatchShipments(event, query);
  }
}
