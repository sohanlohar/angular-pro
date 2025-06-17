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
import { Observable, Subject, isEmpty, takeUntil, tap } from 'rxjs';
import { bm } from '../../../../../../../assets/my';
import { en } from '../../../../../../../assets/en';
import { TranslationService } from '../../../../../../../shared-services/translate.service';
import * as moment from 'moment';

@Component({
  selector: 'pos-live-shipments',
  templateUrl: './live-shipments.component.html',
  styleUrls: ['./live-shipments.component.scss'],
})
export class LiveShipmentsComponent implements OnInit, OnDestroy {
  currentPage = 1;
  pageSize = 100;
  start_date = '';
  end_date = '';
  keyword? = '';
  shipmentStatus = '';
  cod_type = '';
  selectedMultipleData: IDataShipment[] = [];
  isSelectAllOrders = false;
  isPlugins = false;
  isSelectedShipmentsNoTrackingId = false;
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
    'recipient',
    'deliveryDetail',
    'type',
    'action',
  ];
  actions:any = ['my_location', 'print'];
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.myShipments.live_shipment_tab :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.myShipments.live_shipment_tab :
    en.data.myShipments.live_shipment_tab;
  filterOrderStatus: { id: string; value: string }[] = [
    {
      id: '',
      value: 'ALL',
    },
    {
      id: 'picked up',
      value: 'PICKED UP',
    },
    {
      id: 'in transit',
      value: 'IN TRANSIT',
    },
    {
      id: 'out for delivery',
      value: 'OUT FOR DELIVERY',
    },
    {
      id: 'dropped off',
      value: 'DROPPED OFF',
    },
  ];
  shipment$: Observable<IResponse<IShipment>> | undefined;

  // Date Range
  dateRangePickerForm: FormGroup = this.fb.group({
    start_date: [''],
    end_date: [''],
  });

  // Select Dropdown
  dropdownOptions = [
    { value: '', viewValue: this.languageData.all },
    { value: 'picked-up', viewValue: this.languageData.picked_up },
    { value: 'in-transit', viewValue: this.languageData.in_transit },
    { value: 'out-for-delivery', viewValue: this.languageData.out_for_delivery },
    { value: 'dropped-off', viewValue: this.languageData.dropped_off },
  ];

  dropdownOptionsCodeType = [
    { value: '', viewValue: this.languageData.all },
    { value: 'cod', viewValue: 'COD' },
    { value: 'non_cod', viewValue: this.languageData.non_cod },
  ];

  order_status?: string;
  protected _onDestroy = new Subject<void>();
  totalTrackingDetails: any;
  isLoading = true;
  current_tab = ''

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
        this.languageData = en.data.myShipments.live_shipment_tab
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.myShipments.live_shipment_tab
      }

      this.dropdownOptions[0].viewValue = this.languageData.all;
      this.dropdownOptionsCodeType[0].viewValue = this.languageData.all;
      this.dropdownOptionsCodeType[2].viewValue = this.languageData.non_cod;
      this.dropdownOptions[1].viewValue = this.languageData.picked_up;
      this.dropdownOptions[2].viewValue = this.languageData.in_transit;
      this.dropdownOptions[3].viewValue = this.languageData.out_for_delivery;
      this.dropdownOptions[4].viewValue = this.languageData.dropped_off;
    })
  }

  ngOnInit(): void {
     // For API
    this.end_date = moment.utc().endOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]');
    this.start_date = moment.utc().subtract(30, 'days').startOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]');
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
    this.route.queryParams.subscribe((res: any) => {
      this.cod_type = res.q;
      this.current_tab = res.t;
    });
    const eventDetails = {
      event: 'tab_to_section',
      event_category: 'SendParcel Pro - My Shipments - Live Shipments',
      event_action: 'Tab To Section',
      event_label: 'Live Shipments',
    };
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
        const eventDetails = {
          "event": "track_order",
          "event_category": "SendParcel Pro - My Shipments - Live Shipments",
          "event_action": "Track Order",
          "event_label": "Track Order - "+ event?.data?.tracking_details?.tracking_id
        };
            this._commonService.googleEventPush(eventDetails)
       window.open(urlDetails);
        return;
      case 'order-details':
        this._commonService.googleEventPush({
          event: 'track_order',
          event_category: 'SendParcel Pro - My Shipments - Live Shipments',
          event_action: 'Track Order',
          event_label: 'Track Order -' + event.data.tracking_details.tracking_id,
        });
        const eventDetailsViewOrder ={
          event: 'view_order_details',
          event_category: 'SendParcel Pro - My Shipments - Live Shipments',
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
            this._commonService.googleEventPush(eventDetailsViewOrder)
        window.open(urlDetails);
        return;
      case 'print':
        this.onActionButtonIcon('print', false);
        return;
      default:
        return;
    }
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
    if (this.isSelectAllOrders) {
      shipmentIds = this.batchProcessingIds;
    }
    const shipmentwithTrackingId = this.selectedMultipleData.filter(
      (shipment: IDataShipment) => shipment.tracking_details.tracking_id !== ''
    );
    if (shipmentwithTrackingId.length) {
      shipmentIds = shipmentwithTrackingId.map(
        (shipment: IDataShipment) => shipment.id
      );
    }

    if (!this.isSelectAllOrders && !isMultiple) {
      shipmentIds.push(this.selectedSingleData.id);
    }

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

    if (event === 'print') {
      this._commonService.googleEventPush({
        event: 'print_label',
        event_category: 'SendParcel Pro - My Shipments - Live Shipments',
        event_action: 'Click Print Label',
        event_label: 'Print Label',
      });
    }

    this._commonService
      .submitData('shipments', query, {
        ids: shipmentIds,
      })
      .pipe(
        tap((response: IResponse<{ link: string }>) => {
          window.open(
            `${environment.sppUatUrl.replace('/api/', '')}${response.data.link}`
          );
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        error: () => {
          this._commonService.openErrorDialog();
        },
      });
  }

  onActionIconEvent(event: { data: IDataShipment; actionType: string }) {
    this.selectedSingleData = event.data;
    switch (event.actionType) {
      case 'tallysheet':
        this.onActionButtonIcon(event.actionType, false);
        return;
      case 'order-details':
        const eventDetails = {
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
        };
        this._commonService.googleEventPush(eventDetails)
        this.router.navigate([event.data.tracking_details.category.toLowerCase() === 'mps' ? 'my-shipment/mps-details' :'my-shipment/order-details', event.data.id], { queryParams: {activeTab: 'live'} });
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

  onPageEvent(event: { currentPage: number; pageSize: number }) {
    this.currentPage = event.currentPage;
    this.pageSize = event.pageSize;
    this.fetchShipments();
  }

  selectOrderStatus(event: any) {
    this.shipmentStatus = event.id;
    this.fetchShipments();
  }

  onSearchEvent(search: string) {
    this.keyword = search.trim();
    this._commonService.googleEventPush({
      event: 'search_order',
      event_category:
        'SendParcel Pro - My Shipments - Live Shipments',
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
          'SendParcel Pro - My Shipments - Live Shipments',
        event_action: 'Filter Section',
        event_label: this.start_date + ' - ' + this.end_date,
      });
    } else {
      this.start_date = '';
      this.end_date = '';
    }
    this.fetchShipments();
  }

  onSelectChange(event: string, state: string) {
    if (event === 'order-status') {
      this.order_status = state;
      const orderStatusLabel = state?.trim() || "all";
      const eventDetails = {
        "event": "filter_section",
        "event_category": "SendParcel Pro - My Shipments - Live Shipments",
        "event_action": "Filter Section",
        "event_label": "Order Status - "+ orderStatusLabel
      };
      this._commonService.googleEventPush(eventDetails)
    }
    if (event === 'order-type') {
      this.cod_type = state;
      const orderTypeLabel = state?.trim() || "all";
      const eventDetails ={
        event: 'filter_section',
        event_category: 'SendParcel Pro - My Shipments - Live Shipments',
        event_action: 'Filter Section',
        event_label:  "Order Type - "+ orderTypeLabel,
      };
      this._commonService.googleEventPush(eventDetails)
    }
    this.fetchShipments();
  }

  private get buildParams(): IShipmentParamFilter {
    return {
      uitab: 'live',
      start_date: this.start_date,
      end_date: this.end_date,
      shipment_status: this.order_status,
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
          } else if (event === 'connote' || event === 'tallysheet') {
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

    // const query =
    //   event === 'commercialinvoice'
    //     ? `${event}/print`
    //     : event === 'print'
    //     ? `connote/print`
    //     : event === 'connote';

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
