/* eslint-disable no-case-declarations */
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '@pos/ezisend/auth/data-access/services';
import { IResponse } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { MyShipmentHelper } from '@pos/ezisend/shipment/data-access/helper/my-shipment-helper';
import {
  IDataShipment,
  IShipment,
  IShipmentParamFilter,
} from '@pos/ezisend/shipment/data-access/models';
import { environment } from '@pos/shared/environments';
import { Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { bm } from '../../../../../../../assets/my';
import { en } from '../../../../../../../assets/en';
import { TranslationService } from '../../../../../../../shared-services/translate.service';
import * as moment from 'moment';

@Component({
  selector: 'pos-delivered',
  templateUrl: './delivered.component.html',
  styleUrls: ['./delivered.component.scss'],
})
export class DeliveredComponent implements OnInit, OnDestroy {
  currentPage = 1;
  pageSize = 100;
  start_date = '';
  end_date = '';
  keyword? = '';
  shipmentType = '';
  cod_type = '';
  current_tab = '';
  product_type = ''
  shipmentStatus = ''
  // uiTab = 'delivered';
  @Input() uiTab = 'delivered';
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

  actions: any = ['my_location', 'print'];
  selectedData: IDataShipment[] = [];
  shipment$: Observable<IResponse<IShipment>> | undefined;
  dateRangePickerForm: FormGroup = this.fb.group({
    start_date: [''],
    end_date: [''],
  });
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.myShipments.delivered_tab :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.myShipments.delivered_tab :
    en.data.myShipments.delivered_tab;
  protected _onDestroy = new Subject<void>();
  private isFetching = false;
  totalTrackingDetails: any;
  isLoading = true;
  callv2 = false;
  is_select_all = false;

  dropdownOptions = [
    { value: '', viewValue: this.languageData.all },
    { value: 'cod', viewValue: 'COD' },
    { value: 'non_cod', viewValue: this.languageData.non_cod },
  ];
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public _commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private loginService: LoginService,
    private translate: TranslationService
  ) {
    this.loginService.globalSearch.subscribe((data: any) => {
      this.start_date = data.start_date ? data.start_date : this.start_date;
      this.end_date = data.end_date ? data.end_date : this.end_date;
      this.cod_type = data.payment_type ? data.payment_type : this.cod_type;
      this.product_type = data.product_type ? data.product_type : '';
      this.shipmentStatus = data.shipment_status ? data.shipment_status : '';
      this.is_select_all = data.is_select_all ? data.is_select_all : '';

      if (data.keyword && data.keyword.length > 0) {
        this.keyword = data.keyword;
      }
      if (data) {
        this.uiTab = 'all';
        this.callv2 = true;
        // Reset pageSize for advanced search
        this.pageSize = 100;
        this.checkGlobalSearchParamsAndFetchShipments(); // Fetch shipments based on updated conditions
      }

    });
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.myShipments.delivered_tab
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.myShipments.delivered_tab
      }
      this.dropdownOptions[0].viewValue = this.languageData.all; 
      this.dropdownOptions[2].viewValue = this.languageData.non_cod; 
    })
  }

  ngOnInit(): void {
    //For API
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
    if (this.uiTab === 'delivered') {
      const eventDetails = {
        event: 'tab_to_section',
        event_category: 'Send Parcel Pro - My Shipments - Delivered',
        event_action: 'Tab To Section',
        event_label: 'Delivered',
      };
      this._commonService.googleEventPush(eventDetails);
    }
    if (this.uiTab === 'all') {
      // this.keyword = search.trim();
      const eventDetails = {
        event: 'tab_to_section',
        event_category: 'Send Parcel Pro - My Shipments - All',
        event_action: 'Tab To Section',
        event_label: 'All',
      };
      this._commonService.googleEventPush(eventDetails);
    }
    // this.fetchParamsLoginService();
    this.checkGlobalSearchParamsAndFetchShipments();
  }
triggerPaginationEvent() {
  this.onPageEvent({
    currentPage: this.currentPage,
    pageSize: this.pageSize
  });
}
checkGlobalSearchParamsAndFetchShipments() {
  this._commonService.globalSearchParams$.pipe(take(1)).subscribe((params) => {
    // Check if the parameters are available and valid
    if (params && params.payment_type && params.shipment_status && params.product_type) {
      this.callv2 = true;
    } else {
      this.callv2 = false;
    }

    this.fetchShipments();
  });
}


  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  onFilterCheckbox(filter: string) {
    this.shipment_status = filter === 'all' ? '' : filter;
    this.checkGlobalSearchParamsAndFetchShipments(); // Fetch shipments based on updated conditions
  }

  onSelectRow(data: IDataShipment[]) {
    this.selectedMultipleData = data;

    this.isPlugins = data.some(
      (shipment: IDataShipment) =>
        Object.keys(shipment.channel_order).length !== 0
    );

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
    );
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
        event_category: 'SendParcel Pro - My Shipments - Delivered',
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
            `${environment.sppUatUrl.replace('/api/', '')}${
              response.data.link
            }`
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
      case 'print':
        this.onActionButtonIcon('print', false);
        return;
      case 'order-details':
        // eslint-disable-next-line no-case-declarations
        const eventDetails = {
          event: 'view_order_details',
          event_category: 'SendParcel Pro - My Shipments - All',
          event_action: 'View Order Details',
          event_label: 'Order Details - ' + event.data.tracking_details.tracking_id,
          // tracking_number: event.data.tracking_details.tracking_id, removed as per google Analytics slide #51
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
                    this._commonService.googleEventPush(eventDetails);
        this.router.navigate(
          [
            event.data.tracking_details.category.toLowerCase() === 'mps'
              ? 'my-shipment/mps-details'
              : 'my-shipment/order-details',
            event.data.id,
          ],
          { queryParams: { activeTab: this.current_tab } }
        );
        return;
      default:
        return;
    }
  }

  fetchShipments() {
    if (this.isFetching) return;
    this.isFetching = true; // Prevent duplicate calls
    // console.log(this.buildParams(), 'param fetch');
    const query = `list?${MyShipmentHelper.contructFilterObject(
      this.buildParams
    )}`;


    this.shipment$ = this.callv2
    ? this._commonService.fetchListv2('shipments', query)
    : this._commonService.fetchList('shipments', query);
    this.shipment$.subscribe({
      next: (res) => {
        this.totalTrackingDetails = res.data.total;
        this.isLoading = false;
        this.isFetching = false; // Reseting flag here
        // this._commonService.updateGlobalSearchParams(null);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isFetching = false; // Reseting flag on error
      },
    });
    setTimeout(() => {
      // this.loginService.globalSearch.next('');
      this.callv2 = false;
    }, 500);
  }

  onDateRangePickerFormChange(event: any) {
    if (event) {
      this.start_date = event.start_date;
      this.end_date = event.end_date;
      this._commonService.googleEventPush({
        event: 'filter_section',
        event_category:
          'Send Parcel Pro - My Shipments - ' + this.uiTab === 'all'
            ? 'All'
            : 'Delivered',
        event_action: 'Filter Section',
        event_label: this.start_date + ' - ' + this.end_date,
      });
    } else {
      this.start_date = '';
      this.end_date = '';
    }
    this.checkGlobalSearchParamsAndFetchShipments(); // Fetch shipments based on updated conditions
  }
  onActionEvent(event: { data: IDataShipment; actionType: string }) {
    let tabValue = (this.uiTab === "all") ? "All" : "Delivered";
    this.selectedSingleData = event.data;
    const urlPathDetails = event?.data?.tracking_details?.category?.toLowerCase() === 'mps'
    ? 'my-shipment/mps-details'
    : 'my-shipment/order-details';

  // eslint-disable-next-line no-case-declarations
  const urlDetails = `${urlPathDetails}/${event.data.id}?activeTab=${this.current_tab}`;
    switch (event.actionType) {
      case 'my_location':
        const eventDetails = {
          "event": "track_order",
          "event_category": "SendParcel Pro - My Shipments - " + tabValue,
          "event_action": "Track Order",
          "event_label": "Track Order - "+ event?.data?.tracking_details?.tracking_id
        };
                     this._commonService.googleEventPush(eventDetails);
      window.open(urlDetails);
        return;
      case 'print':
        this.onActionButtonIcon('print', false);
        return;
      case 'order-details':
        // this._commonService.googleEventPush({
        //   event: 'track_order',
        //   event_category: 'SendParcel Pro - My Shipments - ' + tabValue,
        //   event_action: 'Track Order',
        //   event_label: 'Track Order -' + event.data.tracking_details.tracking_id,
        // });
        // eslint-disable-next-line no-case-declarations
        const eventDetailsViewOrder = {
          event: 'view_order_details',
          event_category: 'SendParcel Pro - My Shipments - ' + tabValue,
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
            this._commonService.googleEventPush(eventDetailsViewOrder);
        window.open(urlDetails);
        return;
      default:
        return;
    }
  }

  onPageEvent(event: { currentPage: number; pageSize: number }) {
    this.currentPage = event.currentPage;
    this.pageSize = event.pageSize;
    const hasBuildParams = this.buildParams && Object.keys(this.buildParams).length > 0 ? true : false;

      const hasFilterParams =
        (this.cod_type && this.cod_type !== '') ||
        (this.product_type && this.product_type !== '') ||
        (this.shipmentStatus && this.shipmentStatus !== '') ||
        (this.start_date && this.start_date !== '') ||
        (this.end_date && this.end_date !== '')
          ? true
          : false;
      this.callv2 = hasBuildParams && hasFilterParams;
      this.fetchShipments();
  }

  onSearchEvent(search: string) {
    this.keyword = search.trim();
    this._commonService.googleEventPush({
      event: 'search_order',
      event_category:
        'Send Parcel Pro - My Shipments - ' + this.uiTab === 'all'
          ? 'All'
          : 'Delivered',
      event_action: 'Search Order',
      event_label: this.keyword,
    });
    this.checkGlobalSearchParamsAndFetchShipments(); // Fetch shipments based on updated conditions
  }

  onSelectChange(orderType: string) {
    this.cod_type = orderType;
    const orderTypeLabel = orderType?.trim() || "all";
    const eventDetails ={
      event: 'filter_section',
      event_category:
        'Send Parcel Pro - My Shipments - ' + this.uiTab === 'all'
          ? 'All'
          : 'Delivered',
      event_action: 'Filter Section',
      event_label: "Order Type – " + orderTypeLabel ,
    };
    this._commonService.googleEventPush(eventDetails);
    this.checkGlobalSearchParamsAndFetchShipments(); // Fetch shipments based on updated conditions
  }

  private get buildParams(): IShipmentParamFilter {
    const baseParams: IShipmentParamFilter = {
      start_date: moment(this.start_date).startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      end_date: moment(this.end_date).endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      cod_type: this.cod_type,
      keyword: this.keyword,
      product_type: this.product_type,
      shipment_status: this.shipmentStatus,
      page: +this.currentPage,
      limit: +this.pageSize,

    };

    if (this.uiTab !== 'all') {
      baseParams.uitab = this.uiTab;
    }
    if (this.is_select_all) {
      baseParams.is_select_all = this.is_select_all;
    }

    return baseParams;
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
        includeChildren: true,
      })
      .pipe(
        tap((response: IResponse<{ link: string }>) => {
          this._commonService.isLoading(false);
          window.open(
            `${environment.sppUatUrl.replace('/api/', '')}${
              response.data.link
            }`
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
