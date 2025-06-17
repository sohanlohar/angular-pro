import { SelectionModel } from '@angular/cdk/collections';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatTableDataSource } from '@angular/material/table';
import { IResponse } from '@pos/ezisend/shared/data-access/models';
import {
  IDataShipment,
  IShipment,
} from '@pos/ezisend/shipment/data-access/models';
import {
  catchError,
  finalize,
  Observable,
  Subject,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';

export interface IButton {
  label: string;
  show: boolean;
  color: string;
}

export interface IFilterBoxList {
  id: string;
  label: string;
}

import * as moment from 'moment';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { environment } from '@pos/shared/environments';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';
import { Router } from '@angular/router';

@Component({
  selector: 'pos-my-shipment-table',
  templateUrl: './my-shipment-table.component.html',
  styleUrls: ['./my-shipment-table.component.scss'],
})
export class MyShipmentTableComponent implements OnInit, OnChanges, OnDestroy {
  searchContactStatus = false;
  numSelected = 0;
  searchContact = '';
  total = 0;
  isTimeout = false;
  protected _onDestroy = new Subject<void>();
  private trackingUrl = environment.trackingURL;

  @Output() pageEvent = new EventEmitter<{
    currentPage: number;
    pageSize: number;
  }>();
  @Output() actionIconEvent = new EventEmitter<{
    data: IDataShipment;
    actionType: string;
  }>();
  @Output() selectedData = new EventEmitter<IDataShipment[]>();
  @Output() totalShipmentRecords = new EventEmitter<number>();
  @Output() onSelectAllOrder = new EventEmitter<boolean>();
  @Output() filterCheckbox = new EventEmitter<string>();
  @Output() pluginId = new EventEmitter<any>();
  // table definition
  isListingLoading = false;
  isSelectAllOrder = false
  @Input() shipment$: Observable<IResponse<IShipment>> | undefined;
  @Input() myStore$: Observable<any> | undefined;
  @Input() pageSize = 100;
  @Input() currentPage = 1;
  @Input() columnsToDisplay: string[] = [];
  @Input() iconActions: string[] = [];
  @Input() isDisabled = true;
  @Input() activeTab = '';
  @Input() shopify = './assets/shopify-logo.svg'
  @Input() woo = './assets/wooCommerce.svg'
  @Input() fromMps = false;
  @Input() viewBy = '';
  // pageSizeOptions = [10, 20, 50, 100, 150, 200]; ASAL
  woo2 = './assets/wooCommerce2.svg';
  shopify2 = './assets/shopify2.svg';
  pageSizeOptions = [10, 20, 50, 100, 200, 500, 1000];
  dataTable = new MatTableDataSource<any>([]);
  enabledDataTable: any = [];
  selection = new SelectionModel<number>(true, []);
  selectedRows: IDataShipment[] = [];
  labelTab = '';
  oms_img = environment.oms_stores.bizapp
  easystore_img = environment.oms_stores.easystore
  checked = false;

  // filter status
  dropDownFilter: IFilterBoxList[] = [
    { id: 'complete', label: 'No Tracking Id' },
    { id: 'connote-assigned', label: 'Pick Up Not Scheduled' },
    { id: 'all', label: 'All' },
  ];
  selectedFilter = '';
  previousFilter = '';
  private isToggled = false;

  notAllowedReasonCodes = [
    "AEX194", "AEX08", "AEX12", "AEX30", "AEX32", "AEX33", "AEX04",
    "AEX14", "AEX191", "AEX24", "AEX34", "AEX198", "AEX195", "AEX37"
];

  pluginList = [
    {
      name: 'woocommerce',
      imgUrl: 'https://s.uat-pos.com/i/assets/wooCommerce.svg',
      width: '100',
      height: '60'
    },
    {
      name: 'shopify',
      imgUrl: this.shopify2,
      width: '100',
      height: '40'
    },
    {
      name: this.oms_img,
      imgUrl: 'https://s.uat-pos.com/i/assets/bizapp.svg',
      width: '100',
      height: '40'
    },
    {
      name: 'fighter',
      imgUrl: 'https://s.uat-pos.com/i/assets/fighter.svg',
      width: '100',
      height: '40'
    },
    {
      name: this.easystore_img,
      imgUrl: 'https://s.uat-pos.com/i/assets/easystore.svg'
    },
    {
      name: 'firesell',
      imgUrl: 'https://s.uat-pos.com/i/assets/firesell.svg',
      width: '100',
      height: '40'
    },
    {
      name: 'onpay',
      imgUrl: 'https://s.uat-pos.com/i/assets/onpay.svg',
      width: '100',
      height: '40'
    },
    {
      name: 'ordela.my',
      imgUrl: 'https://s.uat-pos.com/i/assets/ordela.svg',
      width: '100',
      height: '40'
    },
    {
      name: 'sitegiant',
      imgUrl: 'https://s.uat-pos.com/i/assets/sitegiant.svg',
      width: '100',
      height: '40'
    },
    {
      name: 'squarelet',
      imgUrl: 'https://s.uat-pos.com/i/assets/squarelet.svg',
      width: '100',
      height: '40'
    },
    {
      name: 'vinasia',
      imgUrl: 'https://s.uat-pos.com/i/assets/vinasia.svg',
      width: '100',
      height: '40'
    },
    {
      name: 'webspert',
      imgUrl: 'https://s.uat-pos.com/i/assets/webspert.svg',
      width: '100',
      height: '40'
    },
  ];

  languageObj: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
    en.data;

  languageData:any = this.languageObj.myShipments;
    qty = 0;

  isLoading:boolean = false;
  currentIndex:number = -1;

  constructor(private cdr: ChangeDetectorRef, public commonService: CommonService,
    private translate: TranslationService, private router: Router,
    ) {
    this.commonService.fetchList('user', 'config')
    .pipe(takeUntil(this._onDestroy))
    .subscribe((data) => {
      this.commonService.isCOD.next(data.data?.feature_cod);
      this.commonService.isCODUbat.next(data.data?.feature_codubat);
      this.commonService.isMelPlus.next(data.data?.feature_melplus);
    })
    this.AssignLanguageLabel();
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageObj = en.data
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageObj = bm.data;
      }
      this.languageData = this.languageObj.myShipments
      this.AssignLanguageLabel();
    })
    this.commonService.pageSize$.subscribe((size) => {
      this.pageSize = size;
    });
  }

  AssignLanguageLabel() {
    this.dropDownFilter = [
      { id: 'complete', label: this.languageData.no_tracking_id2 },
      { id: 'connote-assigned', label: this.languageData.pick_up_not_scheduled },
      { id: 'all', label: this.languageData.all2 },
    ];
  }

  ngOnInit(): void {
    this.assignShipment();
    this.createLabel();
    this.commonService.pageSize$
    .pipe(takeUntil(this._onDestroy))
    .subscribe((size: number) => {
      this.pageSize = size;
      this.triggerPaginationEvent();
    });


  }
  triggerPaginationEvent() {
    this.onPageEvent({
      pageSize: this.pageSize,
      pageIndex: 0,
      length: 0
    });
  }

  getAction(val:any) {
    if(val === 'publish') {
      return this.languageData.add_order_to_pickup;
    }
    if(val === 'update') {
      return this.languageData.reschedule;
    }
    if(val === 'close') {
      return this.languageData.cancel;
    }
    if(val === 'edit') {
      return this.languageData.edit_shipment;
    }
    if(val === 'delete') {
      return this.languageData.delete_shipment;
    }
    if(val === 'deleteStore') {
      return this.languageData.delete_store;
    }
    if(val === 'my_location') {
      return this.languageData.track;
    }
    if(val === 'remove_red_eye') {
      return this.languageData.view;
    }
    if(val === 'print') {
      return this.languageData.print;
    }
    if(val === 'download') {
      return this.languageData.download;
    }
    if(val === 'cancel'){
      return this.languageData.cancel_shipment;
    }
    if(val === 'reschedule-pick-up'){
      return 'Reschedule Pick Up'
    }
    else {
      return val;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.pageSizeOptions  = this.activeTab === 'request-pickup' ? [10, 20, 50, 100, 200] : [10, 20, 50, 100, 200, 500, 1000]
    if (changes && changes['shipment$'] && changes['shipment$']?.previousValue) {
      this.assignShipment();
    }
    if (changes && changes['myStore$'] && changes['myStore$']?.previousValue) {
      this.assignShipment();
    }
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  createLabel() {
    this.labelTab =
      this.activeTab === 'request-pickup'
      ? this.languageData.request_pickup_note
      : this.activeTab === 'pending'
      ? this.languageData.pending_pickup_note
      : this.activeTab === 'live'
      ? this.languageData.live_shipments_note
      : this.activeTab === 'delivered'
      ? this.languageData.delivered_note
      : this.activeTab === 'failed-deliver'
      ? this.languageData.failed_deliveries_note
      : this.activeTab === 'returned'
      ? this.languageData.returned_note
      : this.activeTab === 'pickup details'
      ? this.languageData.pickup_details_note
      : ''
  }

  assignShipment() {
    this.isListingLoading = true;
    this.commonService.setTableLoad(true);
    this.dataTable.data = [];
    this.enabledDataTable = [];
    this.total = 0;
    if (this.shipment$) {
      this.shipment$
        .pipe(
          takeUntil(this._onDestroy),
          tap((res: IResponse<IShipment>) => {
            if(res.error?.error?.code === 'E1005') {
              this.isTimeout = true;
              this.isListingLoading = false;
            } else {
              this.isTimeout = false;
              this.dataTable.data = res.data.shipments;
              this.enabledDataTable = this.dataTable.data.filter(
                (shipment) => shipment.tracking_details.tracking_id !== ''
              );
              this.total = res.data.total;
              this.totalShipmentRecords.emit(this.total);
              if (
                this.selectedFilter &&
                !this.isToggled &&
                this.previousFilter !== this.selectedFilter
              ) {
                this.handleCheckboxFilter();
              }
              if (this.isSelectAllOrder) {
                this.handleCheckAllRows(this.dataTable.data);
              }
              if ( this.dataTable.data) {
                this.dataTable.data.forEach((data:any) => {
                  data.channelOrderLogo = this.getLogo(data.channel_order?.channel)
                })
              }
              this.isListingLoading = false;
            }

          }),
          finalize(() => this.commonService.setTableLoad(false)),
          catchError((err) => {
            this.isListingLoading = false;
            this.dataTable.data = [];
            this.cdr.detectChanges();
            this.enabledDataTable = [];
            this.total = 0;
            return throwError(err);
          })
        )
        .subscribe(() => this.cdr.detectChanges());
    }
    if(this.myStore$) {
      this.myStore$
        .pipe(
          takeUntil(this._onDestroy),
          tap((res: any) => {
           this.dataTable.data = res.data.stores;
           this.total = res.data.total;
           this.totalShipmentRecords.emit(this.total);
          }),
          finalize(() => this.commonService.setTableLoad(false)),
          catchError((err) => {
            this.isListingLoading = false;
            // this.dataTable.data = [];
            this.cdr.detectChanges();
            this.enabledDataTable = [];
            this.total = 0;
            return throwError(err);
          })
        )
        .subscribe(() => this.cdr.detectChanges());
      // this.dataTable.data = [{channel:'test'},{channel:'data'}];
      // this.isListingLoading = false;
      // this.commonService.setTableLoad(false)
      // console.log(this.commonService.$onTableLoad)
    }
  }

  private handleCheckboxFilter() {
    this.previousFilter = this.selectedFilter;
    this.selection.clear();
    this.selectedRows = [];
    this.isSelectAllOrder = true;
  }

  private handleCheckAllRows(dataTable: any) {
    this.qty = 0;
    this.selection.clear();
    this.selectedRows = [];
    const filteredData = dataTable.filter((x:any) => {
      const quantityToAdd = Number(x.pickup_details?.total_quantity);
      if (this.qty + quantityToAdd <= 1000) {
        this.qty += quantityToAdd;
        return true;
      }
      return false;
    });
    const dataTableIds = (this.activeTab === 'pending' && this.viewBy !== 'order' ? filteredData : dataTable).map((data: any) => data.id);
    this.selection.select(...dataTableIds);

    dataTableIds.forEach((id: number) => {
      const selectedRowsId = this.selectedRows.map((row) => row.id);
      if (!selectedRowsId.includes(id)) {
        this.selectedRows.push(dataTable.find((data: any) => data.id === id));
      }
    });
    this.selectedData.emit(this.selectedRows);
  }

  onPageEvent(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;

    /* -----below even to clear selection */
    this.selectAllOrder(false);
    /* ----- */

    this.pageEvent.emit({
      currentPage: this.currentPage,
      pageSize: this.pageSize,
    });
  }

  getLogo(name:string): string {
    if (!name) return '';
    const lowercaseName = name.toLowerCase();
    const logo = this.pluginList.find((x:any)=>  x.name === lowercaseName);
    return logo ? logo.imgUrl : '';
    // return this.pluginList.find((x:any)=> x.name === name.toLowerCase())?.imgUrl
  }
  getSize(name:string,size:string) {
    if(size === 'width'){
      return this.pluginList.find((x:any)=> x.name === name.toLowerCase())?.width
    } else {
      return this.pluginList.find((x:any)=> x.name === name.toLowerCase())?.height
    }
  }

  isAllSelected() {
    const activeDataTable =
      this.activeTab === 'add-order'
        ? this.enabledDataTable
        : this.dataTable.data;

    const dataTableIds = activeDataTable.map((data: IDataShipment) => data.id);

    let isAllSelected = true;
    for (const id of dataTableIds) {
      if (!this.selection.selected.includes(id)) {
        isAllSelected = false;
        break;
      }
    }
    return isAllSelected;
  }

  selectEntire(event: string) {
    const activeDataTable =
      this.activeTab === 'add-order'
        ? this.enabledDataTable
        : this.dataTable.data;

    const dataTableIds = activeDataTable.map((data: IDataShipment) => data.id);

    if (event === 'all') {
      this.isSelectAllOrder = true;
      this.selection.select(...dataTableIds);
      this.selectedRows = activeDataTable;

      this.selectedData.emit(activeDataTable);
    }
    if (event === 'cancel') {
      this.isSelectAllOrder = false;
      const removeIds = this.selectedRows.map((data: IDataShipment) => data.id)
      this.selection.deselect(...removeIds);
      dataTableIds.forEach((id: number) => {
        this.selectedRows = this.selectedRows.filter((row) => row.id !== id);
      });

      this.selectedData.emit(this.selectedRows);
    }

    this.onSelectAllOrder.emit(this.isSelectAllOrder);
  }

  masterToggle(event:any) {
    const activeDataTable =
      this.activeTab === 'add-order'
        ? this.enabledDataTable
        : this.dataTable.data;

    const dataTableIds = activeDataTable.map((data: IDataShipment) => data.id);
    this.isSelectAllOrder = false;
    this.isToggled = true;
    if (this.isAllSelected()) {
      this.selection.deselect(...dataTableIds);
      dataTableIds.forEach((id: number) => {
        this.selectedRows = this.selectedRows.filter((row) => row.id !== id);
      });
      this.selectedData.emit(this.selectedRows);
      return;
    }
    if (event.checked) {
      this.handleCheckAllRows(activeDataTable);
    } else {
      this.selection.clear()
      this.selectedRows = [];
      this.selectedData.emit(this.selectedRows);
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: IDataShipment): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row['id']) ? 'deselect' : 'select'} row `;
  }
  actionHandler(data: any, actionType: string) {
    if(data?.pickup_details?.pickup_status == 'pending-cancellation' || data?.pickup_details?.pickup_status == 'cancelled'){
      return
    }

    this.actionIconEvent.emit({ data, actionType });

    //to track session link
    sessionStorage.setItem('lastVisitedRoute', window.location.href);
  // Check if the current active tab is "Pending"
  const isPendingTabActive = this.activeTab === 'pending' || window.location.href.includes('pending-pickup');

    // Define event details based on actionType
    let eventDetails = {};

    switch (actionType) {
        case 'order-details':
          if (isPendingTabActive) {
            eventDetails = {
                event: "pick_up_view_info",
                event_category: "Sendparcel Pro - My Shipments - Pending Shipments",
                event_action: "View Pick Up Info",
                event_label: "Pick Up Number - " + (data?.tracking_details?.tracking_id || data?.id),
                status: "Status - " + (data?.pickup_details?.pickup_status || data?.status)
            };
        this.commonService.googleEventPush(eventDetails);
      }
            break;

        case 'reschedule-pick-up':
            eventDetails = {
                event: "pick_up_begin_schedule_request",
                event_category: "SendParcel Pro - My Shipments - Pending Shipments",
                event_action: "Begin Schedule Pick Up Request",
                event_label: "Schedule Pick Up Request - Create Consignment And Pick Up",
            };
         // Push event details to Google Analytics
       this.commonService.googleEventPush(eventDetails);
            break;

        default:
            return; // Exit early if actionType is not handled
    }

}

  filterShipmentStatus(event: MouseEvent, filter: IFilterBoxList) {
    event.stopPropagation();
    if (this.selectedFilter === filter.id) {
      this.selectedFilter = '';
      this.previousFilter = '';
      this.selection.clear();
      this.selectedRows = [];
      this.isSelectAllOrder = false;
      this.selectedData.emit(this.selectedRows);
    } else {
      this.selectedFilter = filter.id;
    }
    this.isToggled = false;
    this.filterCheckbox.emit(this.selectedFilter);
    this.currentPage = 1;
    this.pageEvent.emit({
      currentPage: 1,
      pageSize: this.pageSize,
    });
  }

  isListingEmpty() {
    return this.dataTable.data.length === 0 && !this.isListingLoading;
  }

  changeDateFormat(date:string) {
    return moment.utc(date).local().format('DD MMM YY');
  }

  changeTimeFormat(date:string) {
    const dt = moment.utc(date).format('YYYY-MM-DD HH:mm:ss');
    const stillUtc = moment.utc(dt).toDate();
    const local = moment(stillUtc).local().format('hh:mmA');
    return local;
  }

  onSelectRow(event: MatCheckboxChange, row: IDataShipment) {
    this.qty = 0;
    if (!event) return;

    this.isSelectAllOrder = false;
    this.isToggled = true;
    if (this.activeTab === 'pending') {
      this.selectedRows.filter((x:any) => {
        const quantityToAdd = Number(x.pickup_details?.total_quantity);
        if (this.qty + quantityToAdd <= 1000) {
          this.qty += quantityToAdd;
          return true;
        }
        return false;
      });
      if (this.qty < 1000) {
        this.selection.toggle(row['id']);
        this.getSelectedDataShipments(row);
      } else if (event.checked && this.qty <= 1000) {
        this.selection.clear();
        this.selectedRows = [];
        this.selection.toggle(row['id']);
        this.getSelectedDataShipments(row);
      } else if (!event.checked && this.qty <= 1000) {
        this.selection.toggle(row['id']);
        this.getSelectedDataShipments(row);
      }
    } else {
      this.selection.toggle(row['id']);
      this.getSelectedDataShipments(row);
    }
    // Trigger Google Event
    const trackingId = row.tracking_details?.tracking_id
    ? `Tracking Number – ${row.tracking_details.tracking_id}`
    : 'NO TRACKING ID GENERATED';

  if (event.checked) { // Only trigger the event when checkbox is selected
    const eventDetails = {
      event: 'select_order',
      event_category: 'SendParcel Pro - My Shipments - ' + (this.labelTab || 'All'),
      event_action: 'Select Order',
      event_label: trackingId,
    };
    this.commonService.googleEventPush(eventDetails);
  }
    this.selectedData.emit(this.selectedRows);
  }

  private getSelectedDataShipments(row: IDataShipment) {
    this.selectedRows = this.selectedRows.find(
      (selected) => row.id === selected.id
    )
      ? this.selectedRows.filter((selected) => selected.id !== row.id)
      : [...this.selectedRows, row];
  }

  selectAllOrder(status: boolean) {
    if (status) {
      this.handleCheckAllRows(this.dataTable.data);
      this.isToggled = false;
    } else {
      this.handleCheckboxFilter();
    }

    this.selectedData.emit(this.selectedRows);
    this.isSelectAllOrder = status;
    this.onSelectAllOrder.emit(this.isSelectAllOrder);
  }

  pluginToggle(id:number, status:boolean) {
    this.pluginId.emit({id, status})
  }

/**
 * Method Name: editActions
 *
 * Input Parameters:
 * - tab: string - The current active tab.
 * - action: string - The action being evaluated (e.g., 'print', 'edit', 'my_location').
 * - data: any - The data object containing tracking details and other relevant information.
 * - keyvalue: any - The key-value pair that may influence the action's state.
 *
 * Output Parameters: none
 *
 * Purpose:
 * - To determine whether a specific action is editable based on the current tab, action type,
 *   the presence of a tracking ID, and certain conditions in the data object.
 *
 * Author:
 * - [Saepul Latif]
 *
 * Description:
 * - This method evaluates multiple conditions to decide if an action should be disabled.
 *   It checks if the tracking ID is empty and the action is either 'print' or 'my_location',
 *   or if the tracking ID is present and the action is 'edit'.
 *   It also considers the length of the keyvalue and if the action is 'edit' with an RTS condition.
 *   Returns true if the action should be disabled; otherwise, false.
 */
  editActions(tab: string, action: string, data: any, keyvalue: any): boolean {
    // Check if the tracking ID is empty and the action is 'print' or 'my_location'
    const trackingId = tab === 'pending' && this.viewBy === 'order' ? data?.tracking_details?.tracking_id :
    (tab === 'pending' && this.viewBy !== 'order' ? data?.pickup_details?.pickup_number : data?.tracking_details?.tracking_id);

    if (trackingId === '' && (action === 'print' || action === 'my_location')) {
      return true;
    }

    // Check if the tracking ID is not empty and the action is 'edit'
    if (data.tracking_details?.tracking_id !== '' && action === 'edit') {
      return true;
    }

    // Check if keyvalue has length and tracking is disabled
    if ((keyvalue)?.length > 0 && this.isDisabled) {
      return true;
    }

    // Check if the action is 'edit' and is_rts is truthy
    if (action === 'edit' && data?.is_rts) {
      return true;
    }

    // If none of the above conditions matched, return false
    return false;
  }

  /**
   * Method Name: copyToClipboard
   *
   * Input Parameters:
   * - text: any - The text to be appended to the tracking URL and copied to the clipboard.
   *
   * Output Parameters:-
   *
   * Purpose:
   * - To concatenate a given text with a base tracking URL, copy the resulting URL to the clipboard,
   *    and show a notification indicating success or failure.
   *
   * Author:
   * - Clayton
   *
   * Description:
   * - This method checks if the tracking URL and the text are present. If both are valid,
   *    it appends the text to the tracking URL, copies the combined URL to the clipboard,
   *    and displays a success message. If either is missing, it displays a failure message.
  */
  copyToClipboard(text: any) {
    if(this.trackingUrl && text) {
      const trackingUrl = this.trackingUrl + text;
      this.commonService.copyToClipboard(String(trackingUrl));
      this.commonService.openSnackBar(
        this.languageObj.error_handling.shipment_tracking_link_is_copied, this.languageObj.error_handling.close
      );
    }
    else {
      this.commonService.openSnackBar(
        this.languageObj.error_handling.failed_to_copy_shipment_tracking_link, this.languageObj.error_handling.close
      );
    }
  }
  /**
 * Method Name: getStoreClass
 *
 * Input Parameters:
 *   - channelName (string): The name of the channel for which the store class is to be determined.
 *     It should represent a specific store name like 'woocommerce', 'bizapp', or 'shopify'.
 *
 * Output Parameters:
 *   - string: Returns a CSS class string corresponding to the given channel name. If the channel
 *     name does not match any predefined values, a default class string is returned.
 *
 * Purpose:
 *   - To map a given channel name to a corresponding CSS class string used for styling purposes.
 *
 * Author:
 *   - Ilyas Ahmed
 *
 * Description:
 *   - This method takes a channel name as input, converts it to lowercase for case-insensitive matching,
 *     and uses a `switch` statement to determine the corresponding CSS class string.
 *   - If the channel name matches specific cases like 'woocommerce', 'bizapp', or 'shopify', the
 *     method returns predefined CSS class strings.
 *   - If the channel name is not provided or does not match any predefined cases, the method
 *     returns a fallback default CSS class string ('store-default-class').
 *   - This ensures consistent styling across different store types and provides a fallback for unknown or
 *     missing channel names.
 */

  getStoreClass(channelName: string): string {
    if (!channelName) return '';
    const storeName = channelName.toLowerCase();
    switch (storeName) {
      case 'woocommerce':
        return 'store-woocommerce';
      case 'bizapp':
        return 'store-bizapp';
      case 'shopify':
        return 'store-shopify';
      default:
        return 'store-default-class'; // Fallback class
    }
  }

  proofActionEvent(tracking_id:any){
    this.isLoading = true;
    this.commonService
          .getProofOfDelivery(tracking_id)
          .subscribe({
            next: (detail:any) => {
              this.isLoading = false;
              if(detail?.data?.link){
                window.open(detail?.data?.link, '_blank');
              }
              else{
                this.commonService.openSnackBar(this.languageData.no_result_to_display, this.languageObj.error_handling.close);
              }
              this.cdr.markForCheck();
            },
            error: (err) => {
              this.isLoading = false;
              this.commonService.openSnackBar(err, this.languageObj.error_handling.close);
              this.cdr.markForCheck();

            },
          });
  }

  disableEditShipment(status: string): boolean {
    // activeTab='pending' is pending tab and 'pickup details' is view-by-pickup shipment page
    return (status !== 'pickup-requested' && status !== 'pickup-rescheduled' && status !== 'order-created') && 
      (this.activeTab === 'pending' || this.activeTab === 'pickup details');
  }
  

  disableCancelShipment(status: string | undefined, children?: any, trackingId?: string): boolean{
    if(this.fromMps){
      if(trackingId === this.checkParentMPS()){
          return false;
      }

      return (status !== 'pickup-requested' && status !== 'connote-assigned') || children?.length === 1;
    }

    return status !== 'pickup-requested' && status !== 'connote-assigned';
  }
  disableReschedulePickup(status: string, pickupStatus: string, shipmentStatuses: string[] = [], trackingEventReasonCode: string[] | string = []): boolean {
    // valid statuses for view by Order & by pickup number
    if(trackingEventReasonCode?.length > 0){
      if(typeof trackingEventReasonCode === 'string'){
        return this.notAllowedReasonCodes.includes(trackingEventReasonCode);
      }
      else{
        return trackingEventReasonCode.some((code, index) => this.notAllowedReasonCodes.includes(code) && (shipmentStatuses[index] === 'failed' || shipmentStatuses[index] === 'pickup-failed'));
      }
    }
    const shipmentStatusesValid = ['pickup-requested', 'failed', 'pickup-failed', 'failed'];
    const pickupStatusesValid = ['pickup-requested', 'partial-picked-up', 'pickup-failed', 'failed'];

    // Case 1: View by Order Tab
    if (shipmentStatuses.length === 0) {
      // In View by Order, checking the `status` and `pickup_status`
      const isShipmentValid = shipmentStatusesValid.includes(status); // Valid status check
      const isPickupValid = pickupStatusesValid.includes(pickupStatus); // Valid pickup status check
      return !(isShipmentValid && isPickupValid);
    }

    // Case 2: View by Pickup Number Tab
    // In View by Pickup Number, checking if at least one status in `shipment_statuses` is valid, and `pickup_status` is valid
    const isShipmentValid = shipmentStatuses.some(s => shipmentStatusesValid.includes(s));
    const isPickupValid = pickupStatusesValid.includes(pickupStatus);

    return !(isShipmentValid && isPickupValid);
  }

  disableClose(status: string): boolean{
    return status !== 'pickup-requested' && status !== 'pickup-assigned';
  }

  checkingPrint(data: any, activeTab: string): boolean{
    return data?.pickup_details?.pickup_status === 'pending-cancellation' || data?.pickup_details?.pickup_status === 'cancelled' || this.editActions(activeTab, 'print', data, data.channel_order);
  }

  handlePrint(data: any, statusPrint: boolean){
    if(!statusPrint){
      this.actionHandler(data, 'print');
    }
  }

  checkParentMPS(){
    const parentMPS = this.dataTable.data[0].tracking_id;
    return parentMPS;
  }

  getClass(platform: string): { [key: string]: boolean } {
    return {
      'pluginLogo': true,
      'WooCommerce': platform === 'WooCommerce',
      'Bizapp': platform ==='Bizapp',
      'Fighter': platform ==='Fighter',
      'Shopify': platform ==='Shopify',
    };
  }

}
