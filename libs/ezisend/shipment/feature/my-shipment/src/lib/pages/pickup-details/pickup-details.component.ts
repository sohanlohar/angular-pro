/* eslint-disable no-case-declarations */
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BreadcrumbItem, IResponse } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { openPickupDialog } from '@pos/ezisend/shared/ui/dialogs/pickup-dialog';
import {
  IDataShipment,
  IShipmentParamFilter,
  IShipment,
} from '@pos/ezisend/shipment/data-access/models';
import { IFilterBoxList, MyShipmentTableComponent } from '@pos/ezisend/shipment/ui/my-shipment-table';
import { MyShipmentHelper } from '@pos/ezisend/shipment/data-access/helper/my-shipment-helper';
import { filter, finalize, map, mergeMap, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import * as moment from 'moment';
import { bm } from '../../../../../../../assets/my';
import { en } from '../../../../../../../assets/en';
import { TranslationService } from '../../../../../../../shared-services/translate.service';

import { environment } from '@pos/shared/environments';
@Component({
  selector: 'pos-pickup-details',
  templateUrl: './pickup-details.component.html',
  styleUrls: ['./pickup-details.component.scss']
})
export class PickupDetailsComponent implements OnInit, OnDestroy {

  columns = [
    'select',
    'trackingDetail',
    'status',
    'recipient',
    'deliveryDetail',
    'type',
    'action',
  ];

  actions:any = [];

  backData: {
    path: string;
    query: {
      t: string;
    };
    label: string;
  } = {
    path: '',
    query: {
      t: '',
    },
    label: '',
  };

  shipment$: Observable<IResponse<IShipment>> | undefined;
  pickUpNumbers: any;
  selectedPickUpNumber: any;
  pickUpDate:any = null;
  pickUpAddress: any = '';
  pickUpTotalParcel: any = '';
  pickUpTotalWeight: any = '';
  getPickUpNumber: any;
  allShipments: IDataShipment[] = [];
  currentPage = 1;
  pageSize = 100;
  start_date = '';
  activeTab = '';
  end_date = '';
  keyword = '';
  totalBatchRequest = 0;
  currentBatchPageRequest = 0;
  totalShipmentRecords = 0;
  totalShipmentNotRequestPickup = 0;
  totalShipmentNoTrackingId = 0;
  batchProcessingIds: number[] = [];
  isDisplayPrintButton = true;
  isDisplayDownloadButton = true;
  isDisplayDeleteButton = false;
  isSelectAllOrders = false;
  isHideCommercialinvoiceButton = false;
  selectedMultipleData: IDataShipment[] = [];
  selectedSingleData!: IDataShipment;
  dateRangePickerForm: FormGroup = this.fb.group({
    start_date: [''],
    end_date: [''],
  });
  isDisableOrder = false;


  protected _onDestroy = new Subject<void>();
  @ViewChild(MyShipmentTableComponent) myShipment:any;
  language: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
    en.data;
  data: any = this.language.pickup_details;
  languageOrderDetail:any = this.language.order_details;

  breadcrumbItems: BreadcrumbItem[] = [];
  selectedMultipleDataId: any=[];
  disabledPickupStatuses:any;
  isenableButton: any;
  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    public _commonService: CommonService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private translate: TranslationService,
    private commonService: CommonService
  ) {
    this.assignLanguageLabel();
    this.updateActions();
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.data = en.data.pickup_details
      }
      else if (localStorage.getItem("language") == "my") {
        this.data = bm.data.pickup_details
      }

    this.assignLanguageLabel();
      // this.breadcrumbItems[0].title = this.data.home;
      // this.breadcrumbItems[1].title = this.data.my_shipments;
      // this.breadcrumbItems[2].title = this.data.pickup_details_title;
    })
  }

  assignLanguageLabel() {
    this.breadcrumbItems = [
      {
        title: this.data.home,
        routerLink: [''],
        external: false,
        current: false,
      },
      {
        title: this.data.my_shipments,
        routerLink: ['/my-shipment'],
        external: false,
        current: false,
      },
      {
        title: this.data.pickup_details_title,
        external: false,
        current: true,
      },
    ];

    this.backData = {
      path: '/my-shipment',
      query: {t: 'pending-pickup'},
      label: this.data.back_data,
    };
  }

  ngOnInit(): void {
    this.fetchShipments();
    this.fetchPickUpNumbers();
    this.getPickUpNumber = this.route.snapshot.params['id'];
    this.route.params.subscribe((params: Params) => {
      this.getPickUpNumber = params['id'];
      this.populatePickupDetails();
      this.fetchShipments();
    })
    if (this.route.snapshot.queryParams && this.route.snapshot.queryParams['activeTab']) {
      this.activeTab = this.route.snapshot.queryParams['activeTab'];
      this.backData.query = {t: this.activeTab};
      const myShipmentsBreadcrumb = this.breadcrumbItems.find(item => item.title === 'My Shipments');
      if (myShipmentsBreadcrumb) {
        myShipmentsBreadcrumb.query = {t: this.route.snapshot.queryParams['activeTab']};
      }
    }
        }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateActions();
  }

  updateActions() {
    if (!this._commonService.checkIfMobile()) {
      this.actions = ['print', 'edit', 'download', 'cancel'];
    } else {
      this.actions = [];
    }
  }

  fetchShipments() {
    this.route.queryParams.subscribe(params => {
        if (params && params['keyword']) {
            this.keyword = params['keyword']
        }
    })
    const query = `list?${MyShipmentHelper.contructFilterObject(
        this.buildParams
    )}`;
    this.shipment$ = this._commonService.fetchList('shipments', query);
    this.shipment$.subscribe((shipments) => {
            this.isDisableOrder = shipments.data.shipments.filter(
                (shipment) => shipment.tracking_details.category.toLowerCase() === 'mps'
            ).length > 0
        ? true
        : false;
    });
  }


  fetchPickUpNumbers() {
    this._commonService.isLoading(true);
    const query = `list?uitab=pending-pickup&page=1&limit=10000&view_option=view-by-pickup-number`;
    this._commonService.fetchList('shipments', query)
    .pipe(
      takeUntil(this._onDestroy),
      tap((response: IResponse<{ shipments: IDataShipment[] }>) => {
        this.pickUpNumbers = response;
            })).subscribe({
        next:()=>{
                    this._commonService.isLoading(false);
          this.populatePickupDetails();
          this.cdr.detectChanges();
          this.cdr.markForCheck();
        },
        error:()=> {
          this._commonService.isLoading(false);
          this._commonService.openErrorDialog();
        }
      })
  }

  private populatePickupDetails() {
    this.selectedPickUpNumber = this.pickUpNumbers?.data?.shipments.find(
      (shipment: IDataShipment) => shipment.pickup_details.pickup_number === this.getPickUpNumber
    );
    if (this.selectedPickUpNumber) {
      this.pickUpDate = this.selectedPickUpNumber.pickup_details.pickup_datetime;
      this.pickUpAddress = this.selectedPickUpNumber.pickup_details.pickup_address;
      this.pickUpTotalParcel = this.selectedPickUpNumber.pickup_details.total_quantity;
      this.pickUpTotalWeight = this.selectedPickUpNumber.pickup_details.total_weight;
    }
  }

  changeDateFormat(date:string) {
    if(date) {
      const dt = moment.utc(date).format('YYYY-MM-DD HH:mm:ss');
      const stillUtc = moment.utc(dt).toDate();
      const local = moment(stillUtc).local().format('DD MMM YY');
      return local;
    } else {
      return '';
    }
  }

  fetchBatchShipments(event: string, query: string) {
    this._commonService.isLoading(true);
    this._commonService.fetchList('shipments', query)
      .pipe(
        takeUntil(this._onDestroy),
        tap((response: IResponse<{ shipments: IDataShipment[] }>) => {
          if (
            event === 'print' ||
            event === 'connote' ||
            event === 'tallysheet'
          ) {
            this.batchProcessingIds = response.data.shipments.map((shipment: IDataShipment) => +shipment.id);
          } else if (event === 'commercialinvoice') {
            const shipmentsInternational =
              response.data.shipments.filter((shipment: IDataShipment) => shipment.type === 'INTERNATIONAL');
            if (shipmentsInternational.length) {
              this.batchProcessingIds = shipmentsInternational.map((shipment: IDataShipment) => +shipment.id);
            }
          } else if (event === 'delete') {
            const shipmentsWithoutTrackingID =
              response.data.shipments.filter((shipment: IDataShipment) => shipment.tracking_details.tracking_id === '');
            if (shipmentsWithoutTrackingID.length) {
              this.batchProcessingIds = shipmentsWithoutTrackingID.map((shipment: IDataShipment) => +shipment.id);
            }
          }

          this.onDownloadAsAndPrint(event);
        })
      )
      .subscribe({
        next:()=>{
                    this._commonService.isLoading(false);
        },
        error:()=>{
          this._commonService.isLoading(false);
          this._commonService.openErrorDialog();
        }
      });
  }

  onPageEvent(event: { currentPage: number; pageSize: number }) {
    this.currentPage = event.currentPage;
    this.pageSize = event.pageSize;
    this.fetchShipments();
  }

  onSearchClick() {
    this.keyword = this.keyword?.trim() !== '' ? this.keyword : '';
    this.fetchShipments();
  }

  getSelectedPickUp(val:any) {
   const eventDetails = {
      "event": "filter_section",
      "event_category": "SendParcel Pro - My Shipments - Pick Up Details",
      "event_action": "Filter Section",
      "event_label": "Pick Up Number -"+ val.pickup_details.pickup_number
    };
             this._commonService.googleEventPush(eventDetails);

    this.router.navigate(['..', val.pickup_details.pickup_number], {
      relativeTo: this.route
    });
    this.myShipment.selectAllOrder(false);
  }

  onDateRangePickerFormChange(event: any) {

    if (event) {
      this.start_date = event.start_date;
      this.end_date = event.end_date;

      const eventDetails = {
        "event": "filter_section",
        "event_category": "SendParcel Pro - My Shipments - Pick Up Details",
        "event_action": "Filter Section",
        "event_label": this.start_date +" - "+ this.end_date
      };
          this._commonService.googleEventPush(eventDetails);

    } else {
      this.start_date = '';
      this.end_date = '';
    }
    this.fetchShipments();
  }

  onSelectedFilterBox(filtersBox: IFilterBoxList[]) {
    const isSelectPickupNotScheduled = filtersBox.some(
      (filter: IFilterBoxList) => filter.id === 'pick-up-not-scheduled'
    );
    const isSelectNoTrackingID = filtersBox.some(
      (filter: IFilterBoxList) => filter.id === 'no-tracking-id'
    );
    const isSelectAll = filtersBox.some(
      (filter: IFilterBoxList) => filter.id === 'all'
    );

    const isSomeOrderDoesnotHaveTrackingID =
      this.selectedMultipleData.some((order: IDataShipment) => order.tracking_details.tracking_id === '');

    if (isSelectNoTrackingID) {
      this.isDisplayDeleteButton = true;
      this.isDisplayPrintButton = false;
      this.isDisplayDownloadButton = false;
    }
    if (isSelectPickupNotScheduled || !filtersBox.length) {
      this.isDisplayPrintButton = true;
      this.isDisplayDownloadButton = true;
      this.isDisplayDeleteButton = false;
    }
    if (isSelectAll || !filtersBox.length) {
      this.isDisplayDeleteButton = true;
      this.isDisplayPrintButton = true;
      this.isDisplayDownloadButton = true;
    }
    if (isSelectPickupNotScheduled && isSelectNoTrackingID) {
      this.isDisplayPrintButton = true;
      this.isDisplayDownloadButton = true;
      this.isDisplayDeleteButton = true;
    }
    if (!filtersBox.length) {
      this.isDisplayPrintButton = true;
      this.isDisplayDownloadButton = true;
      this.isDisplayDeleteButton = false;
    }
    if (isSomeOrderDoesnotHaveTrackingID) {
      this.isDisplayDeleteButton = true;
    }
  }

  onSelectAllOrders(isSelectAll: boolean) {
    this.isSelectAllOrders = isSelectAll;
    if (isSelectAll) {
      this.isDisplayPrintButton = true;
      this.isDisplayDownloadButton = true;
      this.isDisplayDeleteButton = true;
    } else {
      this.isDisplayDeleteButton = false;
    }
      }
  onSelectedData(data: IDataShipment[]) {
    this.selectedMultipleData = data;
    const isDomesticSelected = this.selectedMultipleData.some(
      (order: IDataShipment) => order.type === 'DOMESTIC'
    );
    this.isHideCommercialinvoiceButton = isDomesticSelected;

    this.totalShipmentNoTrackingId = data.filter(
      (shipment: IDataShipment) => shipment.tracking_details.tracking_id === ''
    ).length;
    this.totalShipmentNotRequestPickup = data.filter(
      (shipment: IDataShipment) => shipment.tracking_details.tracking_id !== ''
    ).length;

    this.isDisplayDeleteButton = Boolean(this.totalShipmentNoTrackingId);
}

  onActionIconEvent(event: { data: IDataShipment; actionType: string }) {
    this.selectedSingleData = event.data;
    const urlPathDetails = event?.data?.tracking_details?.category?.toLowerCase() === 'mps'
    ? 'my-shipment/mps-details'
    : 'my-shipment/order-details';

  const urlDetails = `${urlPathDetails}/${event.data.id}?pickUpNumber=${this.getPickUpNumber}&activeTab=pending-pickup`;
    switch (event.actionType) {
      case 'cancel':
        this.cancelShipment(event.data?.tracking_details?.tracking_id);
        return;
      case 'gen-connote':
        this.onActionButtonIcon('gen-connote', false);
        return;
      case this.actions[0]:
        this.onActionButtonIcon(this.actions[0], false);
        return;
      case 'connote':
        this.onActionButtonIcon(event.actionType, false);
        return;
      case 'generateConnote':
        this.onGenerateConnoteById(event.data.id)
        return;
      case 'tallysheet':
        this.onActionButtonIcon(event.actionType, false);
        return;
      case 'commercialinvoice':
        this.onActionButtonIcon(event.actionType, false);
        return;
      case 'order-details':

        const eventDetails ={
          "event": "pick_up_view_info",
          "event_category": "Sendparcel Pro - My Shipments - Pending Shipments",
          "event_action": "View Pick Up Info",
          "event_label": "Pick Up Number - "+ event?.data?.tracking_details?.tracking_id ? event?.data?.tracking_details?.tracking_id : event?.data?.id,
          "status": "Status - "+ event?.data?.status,
        };
        this.commonService.googleEventPush(eventDetails)
        window.open(urlDetails);
        return;

      case 'edit':
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
      case this.actions[2]:
        this.commonService
      .fetchList('shipments', `query?id=${event.data.id}`)
      .pipe(
        map(response => response.data),
        takeUntil(this._onDestroy),
        finalize(() => this.cdr.detectChanges)
      )
      .subscribe({
        next:(data)=>{
          this.commonService.setSelectedShipmentData(data);
          if(data.sender_details.pickup_option_id) {
            this.router.navigate(['order-edit', event.data.id, data.sender_details.pickup_option_id]);
          }else{
            this.router.navigate(['order-edit', event.data.id]);
          }
        },
        error:()=>{
          this.commonService.openErrorDialog();
          this.cdr.detectChanges;
        }
        });
        return;
      case this.actions[3]:
        this.onActionButtonIcon(this.actions[3], false);
        return;
      case 'requestPickup':
        openPickupDialog(this.dialog)
          .pipe(
            filter((date) => !!date),
            mergeMap((date: string) =>
              this.uploadSinglePickupRequest(
                date,
                event.data.tracking_details.tracking_id
              )
            ),
            takeUntil(this._onDestroy)
          )
          .subscribe({
            next: () => {
              this._commonService.redirectTo('/my-shipment', { t: 'request-pickup' });
            },
            error:()=>{
              this._commonService.openErrorDialog();
            }
          });
        return;
      default:
        return;
    }
  }

  private uploadSinglePickupRequest(date: string, connote_id: string | number[]) {
    return this._commonService.submitData('pickups', 'uploadpickuprequest', {
      pickup_datetime: date,
      pickup_message: 'This is a static message.',
      connote_ids: (typeof connote_id === 'string') ? [connote_id] : connote_id,
    });
  }

  onActionButtonIcon(event: string, isMultiple = false) {
    const pickup_number = this.selectedPickUpNumber?.pickup_details?.pickup_number;
    const pickup_datetime = this.selectedPickUpNumber?.pickup_details?.pickup_datetime;
    switch (event) {
      case 'add':

        this.commonService.googleEventPush({
          "event": "go_to_page",
          "event_category": "SendParcel Pro - My Shipments - Pick Up Details",
          "event_action": "Go To Page",
          "event_label": "Add Orders"
        });
        this.router.navigate(['my-shipment', 'add-order'], {
          queryParams: {
            pickup_number,
            date: moment(pickup_datetime).format('DD MMM YYYY'),
          },
        });
        return;
      case 'update':
        const eventDetails = {
          "event": "pick_up_begin_schedule_request",
          "event_category": "SendParcel Pro - My Shipments - Pick Up Details",
          "event_action": "Begin Schedule Pick Up Request",
          "event_label": "Schedule Pick Up Request - Create Consignment And Pick Up"
        };
        this.commonService.googleEventPush(eventDetails)
        this.confirmReschedule(pickup_number);
        return;
      case 'close':
        this.confirmCancel(pickup_number);
        return;
      case 'connote':
      case 'tallysheet':
      case 'commercialinvoice':
      case 'print':
        this.isSelectAllOrders
          ? this.calculateBatchProcessing(event)
          : this.onDownloadAsAndPrint(event, isMultiple);
        return;
      default:
        return;
    }
  }

  onGenerateConnoteById(event:any) {
    this._commonService
      .submitData('shipments', 'gen-connote', {
        scope: {
          all: false,
          shipment_ids: [event],
        },
      })
      .pipe(
        tap((response: any) => {
          if (response?.code === 'S0000') {
            this.fetchShipments();
            this._commonService.redirectTo('/my-shipment', { t: 'request-pickup' });
          }
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        error:()=>{
          this._commonService.openErrorDialog();
        }
      });
  }

  onGenerateConnote(event: string, isMultiple: boolean) {
    /* if there is a case where user accidentally selected together with */
    /* shipment that have tracking id, so we need to filter and take the */
    /* shipment without trackingid */
    // for temporary
    const shipmentsHaveTrackingId = this.selectedMultipleData.filter(
      (shipment: IDataShipment) => shipment.tracking_details.tracking_id === ''
    );

    if (shipmentsHaveTrackingId.length) {
      let orderIds = shipmentsHaveTrackingId.map(
        (shipment: IDataShipment) => shipment.id
      );

      if (!isMultiple) {
        orderIds = [this.selectedSingleData.id];
      }

      this._commonService
        .submitData('shipments', event, {
          scope: {
            all: false,
            shipment_ids: orderIds,
          },
        })
        .pipe(
          tap((response: any) => {
            if (response?.code === 'S0000') {
              this._commonService.redirectTo('/my-shipment', { t: 'request-pickup' });
            }
          }),
          takeUntil(this._onDestroy)
        )
        .subscribe({
          error:()=>{
            this._commonService.openErrorDialog();
          }
        });
    }

  }
  onDownloadAsAndPrint(event: string, isMultiple = false) {
    let shipmentIds: number[] = [];
    /* if select all orders toggle */
    if (this.isSelectAllOrders) {
      shipmentIds = this.batchProcessingIds;
    } else if (isMultiple) { /* multiple checkbox tick */
      /* button print lable, download connote & tallysheet */
      /* just grab all shipment ids without filtering */
      if (
        event === 'print' ||
        event === 'connote' ||
        event === 'tallysheet'
      ) {
        shipmentIds = this.selectedMultipleData.map(
          (shipment: IDataShipment) => shipment.id
        );
      } else if (event === 'commercialinvoice') {
        /* button download commercial invoice; before download */
        /* need to filter the shipment that have type INTERNATIONAL only */
        const shipmentsInternational =
          this.selectedMultipleData.filter((shipment: IDataShipment) => shipment.type === 'INTERNATIONAL');
        if (shipmentsInternational.length) {
          shipmentIds = shipmentsInternational.map((shipment: IDataShipment) => +shipment.id);
        }
      }
    } else {
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

    this._commonService
      .submitData('shipments', query, {
        ids: shipmentIds,
        includeChildren: true
      })
      .pipe(
        tap((response: IResponse<{ link: string }>) => {
          window.open(
            `${environment.sppUatUrl.replace('/api/', '')}${
              response.data.link
            }`
          )
          if (this.isSelectAllOrders) {
            this.currentBatchPageRequest +=1;
            this.totalBatchRequest = this.totalBatchRequest - 1;
            const query = `list?pickup_no=${this.route.snapshot.params['id']}&page=${this.currentBatchPageRequest}&limit=100`;
            if (this.totalBatchRequest >= 1) this.fetchBatchShipments(event, query);
            else this.currentBatchPageRequest = 0;
          }
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        error:()=>{
          this._commonService.openErrorDialog();
        }
      });
  }

  private get buildParams(): IShipmentParamFilter {
    return {
      uitab:'pickup-details',
      pickup_no: this.route.snapshot.params['id'],
      page: +this.currentPage,
      limit: +this.pageSize,
      start_date: this.start_date,
      end_date: this.end_date,
      keyword: this.keyword,
    };
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
          this._commonService.redirectTo('/my-shipment/parcel-details/'+pickup_number);
        },
        error: (err) =>
        {
          this.errorMessage(err.error?.error?.data !== null ? err.error?.error?.data : err)
        }
      });
  }

  private reschedule(pickup_datetime: string, pickup_number: string) {
    return this._commonService.submitData('pickups', 'reschedule', {
      pickup_number,
      pickup_datetime,
    });
  }

  private confirmCancel(pickup_number: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        descriptions: 'Are you sure you want to cancel this Pick Up?',
        icon: 'warning',
        confirmEvent: true,
      },
    });

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe((result) => {
        if (result) {
          this.cancel(pickup_number);
        }
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
  }

  private cancel(pickup_number: string) {
    this._commonService.submitData('pickups', 'cancel', {
      pickup_number,
      cancel_notes: 'This is a static message',
    })
    .pipe(takeUntil(this._onDestroy))
    .subscribe({
      error: (err) => (this.errorMessage(err))
    });
  }

  private errorMessage(err:any) {
    this.dialog.open(DialogComponent, {
      data: {
        title: 'Error',
        descriptions: err.message ? err.message : err.error?.error?.message,
        icon: 'warning',
        confirmEvent: false,
        closeEvent: true
      },
    });
  }

  private calculateBatchProcessing(event: string) {
    /* limit request per batch is 100 */
    const perRequest = this.totalShipmentRecords / 200;
    this.totalBatchRequest = perRequest < 1 ? 1 : Math.ceil(perRequest);

    this.currentBatchPageRequest +=1;
    const query = `list?uitab=pending-pickup&page=${this.currentBatchPageRequest}&limit=200`;
    this.fetchBatchShipments(event, query)
  }

  /**
   * Method Name: cancelShipment
   *
   * Input Parameters:
   * - id: any - The identifier for the shipment to be canceled. It could be a string, number, or any other type.
   *
   * Output Parameters:
   * - Returns: void - This method does not return anything. It triggers a cancellation process for the shipment.
   *
   * Purpose:
   * - To initiate the cancellation of a shipment by first displaying a confirmation dialog.
   *   Upon user confirmation, it sends a request to cancel the shipment and handles success or failure responses.
   *
   * Author:
   * - [Saepul Latif]
   *
   * Description:
   * - This method opens a confirmation dialog prompting the user to confirm the cancellation of the shipment.
   *   If the user confirms the cancellation, it makes an API call to submit the cancellation request for the shipment
   *   (using the `tracking_no` from `this.detail`). The request is made via the `commonService.submitData` method.
   *   After the API response, the method handles the result by either displaying a success message or an error message
   *   depending on the outcome of the cancellation attempt.
   */
  cancelShipment(tracking_no: string){
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: '',
        descriptions: this.languageOrderDetail.confirm_cancel_shipment,
        icon: 'warning',
        confirmEvent: true,
        closeEvent: true,
        actionText: this.languageOrderDetail.confirm,
        cancelText: this.languageOrderDetail.cancel
      },
    });

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe(() => {
        this.cdr.detectChanges();
        this.commonService
        .submitData('shipments', 'cancel', {
          tracking_no: tracking_no,
        }).subscribe({
          next: (res) => {
            this.successCancelShipment(res.message);
          },
          error: (err) => {
            const msg = err?.error?.error?.message || this.languageOrderDetail.failed_cancel_shipment;
            this.errorCancelShipment(msg)
          }
        });
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });

      dialogRef.afterClosed().subscribe(() => {
        console.log('modal closed')
      });
  }

  private errorCancelShipment(err: string){
    this.cdr.detectChanges();
    this.commonService.openSnackBar(err, this.language.error_handling.close);
  }

  private successCancelShipment(message: string){
    this.commonService.openSnackBar(message, this.language.error_handling.close);
    this.fetchShipments();
    this.cdr.detectChanges();
  }
}
