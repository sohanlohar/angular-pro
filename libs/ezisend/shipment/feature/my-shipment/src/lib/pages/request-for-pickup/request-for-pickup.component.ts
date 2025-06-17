/* eslint-disable no-case-declarations */
import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { IResponse } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { openPickupDialog } from '@pos/ezisend/shared/ui/dialogs/pickup-dialog';
import {
  IDataShipment,
  IShipmentParamFilter,
  IShipment,
} from '@pos/ezisend/shipment/data-access/models';
import { MyShipmentHelper } from '@pos/ezisend/shipment/data-access/helper/my-shipment-helper';
import { filter, finalize, map, mergeMap, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { MyShipmentTableComponent } from '@pos/ezisend/shipment/ui/my-shipment-table';
import { bm } from '../../../../../../../assets/my';
import { en } from '../../../../../../../assets/en';
import { TranslationService } from '../../../../../../../shared-services/translate.service';
import { environment } from '@pos/shared/environments';
import * as moment from 'moment';

@Component({
  selector: 'pos-request-for-pickup',
  templateUrl: './request-for-pickup.component.html',
  styleUrls: ['./request-for-pickup.component.scss'],
})
export class RequestForPickupComponent implements OnInit, OnDestroy {
  @ViewChild('shipmentTable') shipmentTable: any
  columns = [
    'select',
    'trackingDetail',
    'status',
    'recipient',
    'deliveryDetail',
    'type',
    'action',
  ];
  actions = ['edit', 'delete'];// removed print action
  shipment$: Observable<IResponse<IShipment>> | undefined;
  allShipments: IDataShipment[] = [];
  currentPage = 1;
  pageSize = 100;
  start_date:any = '';
  end_date:any = '';
  keyword = '';
  shipment_status = '';
  minSelectableDate = moment().subtract(3, 'months').toDate();
  maxSelectableDate = moment().add(3, 'months').toDate();
  totalBatchRequest = 0;
  currentBatchPageRequest = 0;
  totalShipmentRecords = 0;
  totalShipmentNotRequestPickup = 0;
  totalShipmentNoTrackingId = 0;
  batchProcessingIds: number[] = [];
  isSelectAllOrders = false;
  isShowCommercialinvoiceButton = false;
  selectedMultipleData: IDataShipment[] = [];
  selectedSingleData!: IDataShipment;
  dateRangePickerForm: FormGroup = this.fb.group({
    start_date: [''],
    end_date: [''],
  });
  isSelectedShipmentsNoTrackingId = false;
  @ViewChild(MyShipmentTableComponent) myShipment:any;
  @Output() dataEmitter: EventEmitter<any> = new EventEmitter<any>();
  conNoteV3Response: any;
  protected _onDestroy = new Subject<void>();
  totalTrackingDetails: any;
  isLoading = true;

  language: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
    en.data;
  languageData: any = this.language.myShipments.request_pickup;
  languageOrderDetail:any = this.language.order_details;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private _commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    public commonService: CommonService,
    private translate: TranslationService
  ) {
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.myShipments.request_pickup
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.myShipments.request_pickup
      }
    })
  }

  ngOnInit(): void {
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

    const eventDetails = {
      event: 'tab_to_section',
      event_category: 'SendParcel Pro - My Shipments - Request For Pickup',
      event_action: 'Tab To Section',
      event_label: 'Request For Pick Up',
      }
    this._commonService.googleEventPush(eventDetails);
    this.fetchShipments();
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  @HostListener('window:resize', ['$event'])

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

  fetchBatchShipments(event: string, query: string, isMultiple?: any) {
    this.batchProcessingIds = [];
    this._commonService.fetchList('shipments', query)
      .pipe(
        takeUntil(this._onDestroy),
        tap((response: IResponse<{ shipments: IDataShipment[] }>) => {
          if (event === 'gen-connote' || event === 'gen-connote-v2' ) {
            const shipmentNoTrackingId =
              response.data.shipments.filter((shipment: IDataShipment) => shipment.tracking_details.tracking_id === '');
            if (shipmentNoTrackingId.length) {
              this.batchProcessingIds = shipmentNoTrackingId.map((shipment: IDataShipment) => +shipment.id);
            }
          } else if (event === 'requestPickup') {
            this._commonService.isLoading(true);
            const shipmentwithTrackingId =
              response.data.shipments.filter((shipment: IDataShipment) => shipment.tracking_details.tracking_id !== '');
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
              response.data.shipments.filter((shipment: IDataShipment) => shipment.tracking_details.tracking_id !== '');

            if (shipmentwithTrackingId.length) {
              this.batchProcessingIds = shipmentwithTrackingId.map((shipment: IDataShipment) => +shipment.id);
            }

            // console.log('order selected is ',shipmentwithTrackingId.length, 'which is more than 100')
            if (shipmentwithTrackingId.length > 100 && event === 'connote') {
              this.dialog.open(DialogComponent, {
                data: {
                  title: 'Uh-oh',
                  descriptions: this.languageData.description1,
                  icon: 'warning',
                  confirmEvent: false,
                  closeEvent: true
                },
              });
              return
            }
          } else if (event === 'commercialinvoice') {
            const shipmentwithTrackingId =
              response.data.shipments.filter((shipment: IDataShipment) => shipment.tracking_details.tracking_id !== '');

            if (shipmentwithTrackingId.length) {
              const shipmentsInternational =
                response.data.shipments.filter((shipment: IDataShipment) => shipment.type === 'INTERNATIONAL');
              if (shipmentsInternational.length) {
                this.batchProcessingIds = shipmentsInternational.map((shipment: IDataShipment) => +shipment.id);
              }
            }
          } else if (event === 'delete') {
            const shipmentsWithoutTrackingID =
              response.data.shipments.filter((shipment: IDataShipment) => shipment.tracking_details.tracking_id === '');
            if (shipmentsWithoutTrackingID.length) {
              this.batchProcessingIds = shipmentsWithoutTrackingID.map((shipment: IDataShipment) => +shipment.id);
            }
          }

          event === 'gen-connote'
            ? this.onGenerateConnote(event, false)
            : event === 'gen-connote-v2'
            ? this.openDialogGenerateConnote(event,isMultiple)
            : event === 'requestPickup'
            ? this.openDialogRequestPickup()
            : event === 'delete'
            ? this.onDelete(event)
            : this.onDownloadAsAndPrint(event);
        })
      )
      .subscribe({
        next:(res)=> { this._commonService.isLoading(false); },
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

  onPageEvent(event: { currentPage: number; pageSize: number }) {
    this.currentPage = event.currentPage;
    this.pageSize = event.pageSize;
    this.fetchShipments();
  }

  onSearchEvent(search: string) {
    this.keyword = search.trim();
    this._commonService.googleEventPush({
      event: 'search_order',
      event_category:
        'SendParcel Pro - My Shipments - Request For Pickup',
      event_action: 'Search Order',
      event_label: this.keyword,
    });
    this.fetchShipments();
  }

  onDateRangePickerFormChange(event: any) {
    if (event) {
      this.start_date = event.start_date;
      this.end_date = event.end_date;
      const eventDetails = {
        event: 'filter_section',
        event_category:
          'SendParcel Pro - My Shipments - Request For Pickup',
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

  onSelectRow(data: IDataShipment[]) {
    this.selectedMultipleData = data;

    // let selectedAll = this.shipmentTable.enabledDataTable.length

    this.isSelectAllOrders = false

    // checking for select all (might use later)
    /*if (this.selectedMultipleData.length !== selectedAll || !this.selectedMultipleData.length) {
      this.isSelectAllOrders = false
    } else {
      this.isSelectAllOrders = true
    }*/

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
  }

  onActionIconEvent(event: { data: IDataShipment; actionType: string }) {

    this.selectedSingleData = event.data;

    switch (event.actionType) {
      case 'gen-connote':
        this.onActionButtonIcon('gen-connote', false);
        return;
      case 'gen-connote-v2':
        this.onActionButtonIcon('gen-connote-v2', false);
        return;
      case 'print':
        this.onActionButtonIcon('print', false);
        return;
      case 'connote':
        this.onActionButtonIcon(event.actionType, false);
        return;
      case 'tallysheet':
        this.onActionButtonIcon(event.actionType, false);
        return;
      case 'commercialinvoice':
        this.onActionButtonIcon(event.actionType, false);
        return;
      case 'order-details':
        this._commonService.googleEventPush({
          event: 'view_order_details',
          event_category: 'SendParcel Pro - My Shipments - Request For Pick Up',
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
        this.router.navigate([event.data.tracking_details.category.toLowerCase() === 'mps' ? 'my-shipment/mps-details' :'my-shipment/order-details', event.data.id],{ queryParams: {activeTab: 'request-pickup'} });
        return;
      case 'edit':
        const trackingId = event.data?.tracking_details?.tracking_id;
        const eventLabel = trackingId && trackingId.trim()
            ? "Tracking Number - " + trackingId
            : "NO TRACKING ID GENERATED";
        const eventDetails = {
          "event": "edit_order",
          "event_category": "Send Parcel Pro - My Shipments - Request For Pick Up",
          "event_action": "Edit Order",
          "event_label": eventLabel,
        };
        this._commonService.googleEventPush(eventDetails)
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
            const currentDomain = window.location.origin;
            window.open(`${currentDomain}/order-edit/${event.data.id}/${data.sender_details.pickup_option_id}`, '_blank');
          }else{
            const currentDomain = window.location.origin;
            window.open(`${currentDomain}/order-edit/${event.data.id}`, '_blank');
          }
        },
        error:()=>{
          this.commonService.openErrorDialog();
          this.cdr.detectChanges;
        }
        });
        return;
      case 'delete':
        this.onActionButtonIcon('delete', false);
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
              this.cdr.detectChanges();
              this._commonService.isLoading(false);
              this.shipmentTable.assignShipment()
            },
            error: (err) => {
              this.cdr.detectChanges();
              this._commonService.isLoading(false);
              /* dialog for http error 403 and body error E1004 */
              /* triggered in Interceptor service. */
              /* This is to avoid  multiple dialog */
              if ((err.error?.error?.status !== 403 && err.error?.error?.code !== 'E1004')) {
                this._commonService.openCustomErrorDialog(err);
              }
            },
            complete:()=> {
              this.cdr.detectChanges();
              this.myShipment.selectAllOrder(false);
              this._commonService.isLoading(false);
            }
          });
        return;
      default:
        return;
    }
  }

  onActionButtonIcon(event: string, isMultiple = false) {

    /* single or present */
    const orderState =
      isMultiple && this.selectedMultipleData.length > 1 ? "order's" : 'order';

    /* description label action */
    const typeAction =
      event === 'gen-connote'
        ? this.languageData.generate_consigment_note
        : event === 'gen-connote-v2'
        ? this.languageData.generate_consigment_note
        : event === 'print'
        ? this.languageData.print_label
        : event === 'connote'
        ? this.languageData.download_consignment_note
        : event === 'tallysheet'
        ? this.languageData.download_tallysheet
        : event === 'commercialinvoice'
        ? this.languageData.download_consignment_invoice
        : event === 'delete'
        ? this.languageData.delete_order
        : '';

    /* request pickup */
    if (event === 'requestPickup') {
      this.isSelectAllOrders
        ? this.calculateBatchProcessing(event)
        : this.openDialogRequestPickup()

      return;
    }

    /* actions */
    if (event === 'connote' ||
      event === 'tallysheet' ||
      event === 'commercialinvoice' ||
      event === 'print') {
      this.isSelectAllOrders
        ? this.calculateBatchProcessing(event)
        : this.onDownloadAsAndPrint(event, isMultiple);

      return;
    }

    /* generate connote */
    if (event === 'gen-connote') {
      this.isSelectAllOrders
        ? this.calculateBatchProcessing(event , isMultiple)
        : this.onGenerateConnote(event, isMultiple);
      return
    }

    /* generate connote V2 */
    if (event === 'gen-connote-v2') {

      const eventDetails = {
        "event": "pick_up_begin_schedule_request",
        "event_category": "SendParcel Pro - My Shipments - Request For Pick Up",
        "event_action": "Begin Schedule Pick Up Request",
        "event_label": "Schedule Pick Up Request - Create Consignment And Pick Up"
      };
      this.commonService.googleEventPush(eventDetails)

      this.isSelectAllOrders
        ? this.calculateBatchProcessing(event)
        : this.openDialogGenerateConnote(event,isMultiple);
      return
    }

    /* dialog config */
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        descriptions:
          event !== 'delete'
            ? this.languageData.dailog_msg1 + ' ' + typeAction + ' ' + this.languageData.dailog_msg2 + ' ' + orderState +'?'
            : typeAction,
        icon: 'warning',
        confirmEvent: true,
      },
    });

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe((result) => {
        // if (result && event === 'gen-connote') this.onGenerateConnote(event, isMultiple);
        if (result && event === 'delete') {
          this.isSelectAllOrders
            ? this.calculateBatchProcessing(event)
            : this.onDelete(event, isMultiple);

        };
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
  }

  onGenerateConnote(event: string, isMultiple: boolean, date?: string, tableRows?: any) {
    this._commonService.isLoading(true);
    let orderIds: number[] = [];
    /* if there is a case where user accidentally selected together with */
    /* shipment that have tracking id, so we need to filter and take the */
    /* shipment without trackingid */
    this.selectedMultipleData = this.selectedMultipleData.length ? this.selectedMultipleData : tableRows;
    const shipmentsHaveTrackingId = this.selectedMultipleData.filter(
      (shipment: IDataShipment) => shipment.tracking_details.tracking_id === ''
    );

    if (this.isSelectAllOrders) {
      orderIds = this.batchProcessingIds;
    }

    if (!this.isSelectAllOrders && isMultiple) {
      orderIds = this.selectedMultipleData.map(
        (shipment: IDataShipment) => shipment.id
      );
    }
    if (!this.isSelectAllOrders && !isMultiple) {
      orderIds = [this.selectedSingleData.id];
    }
    if(this.selectedMultipleData.length > 0 || orderIds.length > 0) {
      // PLACE TO CHANGE THE V3 GEN CONNOTE
      this._commonService
      // *********** changing this v3 to v2 for testing of Generating connote is taking too long SPPI-1440 on 23-07-2024 **************************
      .submitDataV2('shipments', 'gen-connote', {
        pickup_datetime : date,
        scope: {
          all: this.isSelectAllOrders,
          shipment_ids: this.isSelectAllOrders === true ? [] : orderIds,
        },
      })
      .pipe(takeUntil(this._onDestroy))
      .subscribe({
        next: (response: any) => {
          if (response?.code === 'S0000') {
            this.conNoteV3Response = response.data;
            this.shipmentTable.assignShipment();
          }
          this._commonService.isLoading(false);
        },
        error: (err) => {
          this.cdr.detectChanges();
          this._commonService.openCustomErrorDialog(err);
          this._commonService.isLoading(false);
          this._commonService.dialog.afterAllClosed.subscribe(() => {
            this.cdr.detectChanges();
            this.shipmentTable.assignShipment();
            this.myShipment.selectAllOrder(false);
            this.myShipment.selection.clear();
            this.selectedMultipleData.length = 0;
          });
        },
        complete:()=> {
          this.cdr.detectChanges();
          this._commonService.isLoading(false);
          this.myShipment.selectAllOrder(false);
          this.goPendingTab();
        }
      }
      );
    } else {
      this.cdr.detectChanges();
      this._commonService.isLoading(false);
      this.dialog.open(DialogComponent, {
        data: {
          title: 'Note',
          descriptions: "You've already generated consignment notes for all the shipments. Please proceed to request your pickup.",
          icon: 'warning',
          confirmEvent: false,
          closeEvent: true

        },
      })
    }
  }

  private goPendingTab() {
    // PLACE TO CHANGE THE V3 GEN CONNOTE
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: this.languageData.print_title,
        descriptions: this.languageData.description2,
        genCannotV3: true,
        successCount: this.conNoteV3Response.count_of_success,
        failedCount: this.conNoteV3Response.count_of_failed,
        icon: 'print',
        confirmEvent: true,
        closeEvent: true,
        actionText: this.languageData.go_now
      },
    });

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe(() => {
        this.dataEmitter.emit(1);
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });

      dialogRef.afterClosed().subscribe(() => {
        this.shipmentTable.assignShipment();
        // on Go Now Button Click after successful submission
      const eventDetails = {
        "event": "go_to_page",
        "event_category": "SendParcel Pro - My Shipments - Request For Pick Up ",
        "event_action": "Go To Page",
        "event_label": "My Shipments - Pending Shipments"
      };
      this.commonService.googleEventPush(eventDetails)
      });
      // on create Pick Up Request success
      const eventDetails = {
        "event": "pick_up_schedule_request_success",
        "event_category": "SendParcel Pro - My Shipments - Request For Pick Up ",
        "event_action": "Pick Up Schedule Request Success",
        "event_label": "Success"
      };
      this.commonService.googleEventPush(eventDetails)
  }

  onDelete(event: string, isMultiple = false) {
    let shipmentIds: number[] = [];
    if (this.isSelectAllOrders) {
      shipmentIds = this.batchProcessingIds;
    }
    if (!this.isSelectAllOrders && isMultiple) {
      shipmentIds = this.selectedMultipleData.map(
        (shipment: IDataShipment) => shipment.id
      );
    }
    if (!this.isSelectAllOrders && !isMultiple) {
      shipmentIds.push(this.selectedSingleData.id);
    }
    this._commonService.isLoading(true);
    this._commonService
      .submitData('shipments', event, {
        ids: shipmentIds,
      })
      .pipe(
        tap((response: any) => {
          if (response.code === 'S0000') {
            if(response.data.results[0].status === 'deletion_failed') {
              this._commonService.openErrorDialog();
            } else {
              this.fetchShipments();
              this.totalShipmentNoTrackingId = 0;
              this.totalShipmentNotRequestPickup = 0;
              this.selectedMultipleData.length = 0;
              this.totalShipmentRecords = 0;
              this.myShipment.selection.clear();
            }

          }
          if (this.isSelectAllOrders) {
            this.currentBatchPageRequest +=1;
            this.totalBatchRequest = this.totalBatchRequest - 1;
            const query = `list?uitab=request-pickup&page=${this.currentBatchPageRequest}&limit=100`;
            if (this.totalBatchRequest >= 1) this.fetchBatchShipments(event, query);
            else this.currentBatchPageRequest = 0;
          }
          this._commonService.isLoading(false);
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next: (asd:any) => {

          this.commonService.googleEventPush({
            "event": "delete_order",
            "event_category": "Send Parcel Pro - My Shipments - Request For Pick Up",
            "event_action": "Confirm Delete Order",
            "event_label": "Delete Order-Success  - "+ shipmentIds,
          });
          this.cdr.detectChanges();
          this._commonService.isLoading(false);
          // this._commonService.redirectTo('/my-shipment', { t: 'request-pickup' });
          this.shipmentTable.assignShipment()
        },
        error:() => {
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
        const shipmentwithTrackingId =
          this.selectedMultipleData.filter((shipment: IDataShipment) => shipment.tracking_details.tracking_id !== '');
        if (shipmentwithTrackingId.length) {
          shipmentIds = shipmentwithTrackingId.map(
            (shipment: IDataShipment) => shipment.id
          );
        }

        if (shipmentwithTrackingId.length > 100 && event === 'connote') {
          this.dialog.open(DialogComponent, {
            data: {
              title: this.languageData.dailog_title,
              descriptions: this.languageData.description1,
              icon: 'warning',
              confirmEvent: false,
              closeEvent: true

            },
          });
          return
        }
      } else if (event === 'print') {
        const shipmentWithTrackingId =
          this.selectedMultipleData.filter((shipment: IDataShipment) => shipment.tracking_details.tracking_id !== '');
        if (shipmentWithTrackingId.length) {
          shipmentIds = shipmentWithTrackingId.map((shipment: IDataShipment) => +shipment.id);
        }
      } else if (event === 'commercialinvoice') {
        /* button download commercial invoice; before download */
        /* need to filter the shipment that have type INTERNATIONAL only */
        const shipmentwithTrackingId =
          this.selectedMultipleData.filter((shipment: IDataShipment) => shipment.tracking_details.tracking_id !== '');
        if (shipmentwithTrackingId.length) {
          const shipmentsInternational =
            this.selectedMultipleData.filter((shipment: IDataShipment) => shipment.type === 'INTERNATIONAL');
          if (shipmentsInternational.length) {
            shipmentIds = shipmentsInternational.map((shipment: IDataShipment) => +shipment.id);
          }
        }
      } else if (event === 'delete') {
        /* button delete; before delete */
        /* need to filter the shipment that doesn't have tracking id only */
        const shipmentsWithoutTrackingID =
          this.selectedMultipleData.filter((shipment: IDataShipment) => shipment.tracking_details.tracking_id === '');
        if (shipmentsWithoutTrackingID.length) {
          shipmentIds = shipmentsWithoutTrackingID.map((shipment: IDataShipment) => +shipment.id);
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
        ? `connote/print`
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

  private get buildParams(): IShipmentParamFilter {
    return {
      uitab: 'request-pickup',
      start_date: this.start_date,
      end_date: this.end_date,
      keyword: this.keyword,
      page: +this.currentPage,
      limit: +this.pageSize,
      shipment_status: this.shipment_status
    };
  }

  onFilterCheckbox(filter: string) {
    this.shipment_status = filter === 'all' ? '' : filter;
    this.fetchShipments();
  }

  private calculateBatchProcessing(event: string, isMultiple?: boolean) {
    /* limit request per batch is 100 */
    const perRequest = this.totalShipmentRecords / 200;
    this.totalBatchRequest = perRequest < 1 ? 1 : Math.ceil(perRequest);

    this.currentBatchPageRequest = 1;
    const query = `list?uitab=request-pickup&page=${this.currentBatchPageRequest}&limit=${this.totalShipmentRecords}`;
    this.fetchBatchShipments(event, query, isMultiple)
  }

  private uploadSinglePickupRequest(date: string, connote_id: string | string[]) {
    let connoteId = this.isSelectAllOrders
      ? this.batchProcessingIds
      : connote_id;

    connoteId = (typeof connoteId === 'string') ? [connoteId] : connoteId;
    connoteId = (connoteId as any).filter((id: string) => id !== '');

    this._commonService.isLoading(true);
    return this._commonService.submitData('pickups', 'uploadpickuprequest', {
      pickup_datetime: date,
      pickup_message: this.languageData.pickup_message,
      connote_ids: connoteId,
    });
  }

  private openDialogRequestPickup() {
    openPickupDialog(this.dialog)
      .pipe(
        filter((date) => !!date),
        mergeMap((date: string) =>
          this.uploadSinglePickupRequest(
            date,
            this.selectedMultipleData.map((shipment: IDataShipment) => shipment.tracking_details.tracking_id)
          )
        ),
        tap(() => {
          this._commonService.isLoading(false);
          // this._commonService.redirectTo('/my-shipment', { t: 'request-pickup' })
          this.shipmentTable.assignShipment()
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        error: (err) => {
          this.cdr.detectChanges();
          this._commonService.isLoading(false);
          this._commonService.openCustomErrorDialog(err);
        },
        complete:() => {
          this.cdr.detectChanges();
          this.myShipment.selectAllOrder(false);
          this._commonService.isLoading(false);
        }
      });
  }

  private openDialogGenerateConnote(event:any, isMultiple:boolean) {
    const tableRows = this.selectedMultipleData
    openPickupDialog(this.dialog)
      .pipe(
        filter((date) => {
          return !!date
        }),
        // mergeMap((date: string) => {
        //   console.log(date)
        //   return this.onGenerateConnote(
        //     event,
        //     false,
        //     date
        //   );
        //   }),
        tap(() => {
          this._commonService.isLoading(false);
          // this._commonService.redirectTo('/my-shipment', { t: 'request-pickup' })
          // this.shipmentTable.assignShipment()
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next: (data) => {
          this.onGenerateConnote(event, isMultiple, data, tableRows);
        },
        error: (err) => {
          this.cdr.detectChanges();
          // this._commonService.isLoading(false);
          this._commonService.openCustomErrorDialog(err);
        },
        complete:() => {
          this.cdr.detectChanges();
          // this.myShipment.selectAllOrder(false);
          // this._commonService.isLoading(false);
        }
      });
  }
}
