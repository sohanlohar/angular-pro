import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbItem, IResponse } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { IOrderDetails } from '@pos/ezisend/shipment/data-access/models';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { map, Subject, takeUntil, tap } from 'rxjs';
import { environment } from '@pos/shared/environments';
import { HttpClient } from '@angular/common/http';
import { bm } from '../../../../../../../assets/my';
import { en } from '../../../../../../../assets/en';
import { TranslationService } from '../../../../../../../shared-services/translate.service';
@Component({
  selector: 'pos-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  backData = {};
  trackingUrl = environment.trackingURL;
  protected _onDestroy = new Subject<void>();
  @Input() shopifySvgPath = './assets/shopify-logo.svg';
  @Input() wooSvgPath = './assets/wooCommerce.svg';
  detail: IOrderDetails | undefined;
  isLoading = false;
  dataBody: any;
  connoteDetails: any | undefined;
  trackingData: any;
  imgUrl: any;
  showPODImage: any;
  currentTrackingDate: any;
  groupedTrackingData: any;
  panelOpenState = false;
  trackingDetailDate: any;
  oms_img = environment.oms_stores.bizapp
  easystore = environment.oms_stores.easystore
  pluginList = [
    {
      name: 'woocommerce',
      imgUrl: 'https://s.uat-pos.com/i/assets/wooCommerce.svg'
    },
    {
      name: 'shopify',
      imgUrl: this.shopifySvgPath
    },
    {
      name: 'bizapp',
      imgUrl: 'https://s.uat-pos.com/i/assets/bizapp.svg'
    },
    {
      name: 'fighter',
      imgUrl: 'https://s.uat-pos.com/i/assets/fighter.svg'
    },
    {
      name: this.easystore,
      imgUrl: 'https://s.uat-pos.com/i/assets/easystore.svg'
    },
    {
      name: 'firesell',
      imgUrl: 'https://s.uat-pos.com/i/assets/firesell.svg'
    },
    {
      name: 'onpay',
      imgUrl: 'https://s.uat-pos.com/i/assets/onpay.svg'
    },
    {
      name: 'ordela.my',
      imgUrl: 'https://s.uat-pos.com/i/assets/ordela.svg'
    },
    {
      name: 'sitegiant',
      imgUrl: 'https://s.uat-pos.com/i/assets/sitegiant.svg'
    },
    {
      name: 'squarelet',
      imgUrl: 'https://s.uat-pos.com/i/assets/squarelet.svg'
    },
    {
      name: 'vinasia',
      imgUrl: 'https://s.uat-pos.com/i/assets/vinasia.svg'
    },
    {
      name: 'webspert',
      imgUrl: 'https://s.uat-pos.com/i/assets/webspert.svg'
    },
  ];
  orderId: any;
  activeTabRoute: any;
  isDisable: any;

  languageObj: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
    en.data;

  languageData:any = this.languageObj.order_details

  breadcrumbItems: BreadcrumbItem[]  = [];
  routeParams:any;
  pickupId: any;

  isDownloadSubmitting: boolean = false;
  constructor(
    public commonService: CommonService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    public router: Router,
    private translate: TranslationService,
    public dialog: MatDialog
  )

  {

    this.assignLanguageLabel()
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageObj = en.data
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageObj = bm.data
      }
      this.languageData = this.languageObj.order_details
      this.assignLanguageLabel()
      this.RouteParams();
      this.cdr.detectChanges();
    })
  }

  assignLanguageLabel(){

    this.breadcrumbItems = [
      {
        title: this.languageData.home,
        routerLink: [''],
        external: false,
        current: false,
      },
      {
        title: this.languageData.my_shipments,
        routerLink: ['/my-shipment'],
        external: false,
        current: false,
      },
      {
        title: this.languageData.order_details,
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

  RouteParams(){
    const paramsData:any = {t: this.routeParams['activeTab']};
    if (this.routeParams && this.routeParams['parentid']) {
      if (this.routeParams['viewBy']) {
        paramsData['viewBy'] = this.routeParams['viewBy'];
      }
      if (this.routeParams['pickUpNumber']) {
        this.breadcrumbItems[2] = {
          title: this.languageData.pickup_detail,
          routerLink: ['/my-shipment/parcel-details/' + this.routeParams['pickUpNumber']],
          external: false,
          current: false,
        };
        this.breadcrumbItems[3] = {
          title: this.languageData.mps_detail,
          routerLink: ['/my-shipment/mps-details/' + this.routeParams['parentid']],
          query: {pickUpNumber : this.routeParams['pickUpNumber'], activeTab: this.routeParams['activeTab']},
          external: false,
          current: false,
        };
        this.breadcrumbItems[4] = {
          title: this.languageData.order_details,
          external: false,
          current: true,
        };
      } else {
        const paramsData: any = { activeTab: this.routeParams['activeTab'] };
        if (this.routeParams['viewBy']) {
          paramsData['viewBy'] = this.routeParams['viewBy'];
        }
        this.breadcrumbItems[2] = {
          title: this.languageData.mps_detail,
          routerLink: ['/my-shipment/mps-details/' + this.routeParams['parentid']],
          query: paramsData,
          external: false,
          current: false,
        };
        this.breadcrumbItems[3] = {
          title: this.languageData.order_details,
          external: false,
          current: true,
        };
      }
      const myShipmentsBreadcrumb = this.breadcrumbItems.find(item => item.title === 'My Shipments');
      if (myShipmentsBreadcrumb) {
        if (this.routeParams['viewBy']) {
          paramsData['viewBy'] = this.routeParams['viewBy'];
        }
        myShipmentsBreadcrumb.query = paramsData;
      }
      this.backData = {
        path: '/my-shipment/mps-details/' + this.routeParams['parentid'],
        query: {pickUpNumber : this.routeParams['pickUpNumber'], activeTab: this.routeParams['activeTab'],...paramsData},
        label: this.languageData.back_to_MPS_details,
      };
    } else {
      if (this.routeParams['viewBy']) {
        paramsData['viewBy'] = this.routeParams['viewBy'];
      }
      if (this.routeParams['pickUpNumber']) {
        this.breadcrumbItems[2] = {
          title: this.languageData.pickup_detail,
          routerLink: [
            '/my-shipment/parcel-details/' + this.routeParams['pickUpNumber'],
          ],
          external: false,
          current: false,
        };
        this.breadcrumbItems[3] = {
          title: this.languageData.order_details,
          external: false,
          current: true,
        };
        this.backData = {
          path: '/my-shipment/parcel-details/' + this.routeParams['pickUpNumber'],
          query: {activeTab: this.routeParams['activeTab'],...paramsData},
          label: this.languageData.back_data_detail,
        };
      } else {
        const myShipmentsBreadcrumb = this.breadcrumbItems.find(item => item.title === 'My Shipments');
        if (this.routeParams['viewBy']) {
          paramsData['viewBy'] = this.routeParams['viewBy']
        }
        if (myShipmentsBreadcrumb) {
          myShipmentsBreadcrumb.query = paramsData;
        }
        this.backData = {
          path: '/my-shipment',
          query: paramsData,
          label: this.languageData.back_data,
        };
      }
    }
  }

  ngOnInit(): void {
    this.renderOrderDetails();
  }
  renderOrderDetails(){
    this.isLoading = true;
    this.route.queryParams.subscribe(params => {
      this.activeTabRoute= params['activeTab']
      this.routeParams = params;
      // Access query parameters here

      this.RouteParams();
    });
    this.orderId = this.route.snapshot.params['id'];
    this.commonService
      .fetchList('shipments', `query?id=${this.route.snapshot.params['id']}`)
      .pipe(
        map((resp) => resp.data),
        map((detail) => this.buildUIFields(detail)),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next: (detail:any) => {
          const trackingData =  detail?.tracking_detail?.tracking_data;
          this.detail = detail;
          this.pickupId= detail.sender_details.pickup_option_id
          this.isLoading = false;
          this.cdr.markForCheck();

          this.connoteDetails = trackingData !== null ? detail?.tracking_detail?.tracking_data[0] : trackingData;
          this.trackingData = this.extractTrackingDetailsData(this.detail);
          this.imgUrl = trackingData !== null ? detail?.tracking_detail?.tracking_data[0]?.epod : trackingData;

          this.trackingDetailDate = trackingData !== null ? detail?.tracking_detail?.tracking_data[0]?.date : trackingData;
          this.extractTrackingDate(this.trackingDetailDate);
          this.changeProductLabel();

        },
        error: (err) => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.commonService.openCustomErrorDialog(err);
        },
      });
  }
  changeProductLabel(): void {
    if (this.detail && this.detail?.parcel_details) {
      const product = this.detail?.parcel_details.product;

      switch (product) {
        case 'EMS':
          this.detail.parcel_details.product = 'Pos Laju International';
          break;
        case 'Air Parcel':
          this.detail.parcel_details.product = 'Economy International (Air)';
          break;
        case 'Surface Parcel':
          this.detail.parcel_details.product = 'Economy International (Surface)';
          break;
        default:
          break;
      }
    }
  }
  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  isDisabled(): any {
    if (!this.detail?.channel_order || Object.keys(this.detail?.channel_order).length> 0 || (this.activeTabRoute !== 'delivered' && this.activeTabRoute !== 'all') || (this.detail?.parcel_details?.category === 'MPS' || this.detail?.parcel_details?.category === 'Ubat' || this.detail?.parcel_details?.category === 'MelPlus' || this.detail?.parcel_details?.type === 'INTERNATIONAL')) {
      return true;
    }
    return false;
  }
  getLogo(name:any) {
    return this.pluginList.find((x:any)=> x.name === name.toLowerCase())?.imgUrl
  }

  downloadOrder() {
    this.isDownloadSubmitting = true;
    const orderId = +this.route.snapshot.params['id'];

    this.commonService
      .submitData('shipments', 'tallysheet/download', {
        ids: [orderId],
      })
      .subscribe({
        next: (res) => {
          this.isDownloadSubmitting = false;
          window.open(
            `${this.commonService.SPPAPI.replace('/api/', '')}${res.data.link}`
          );
        },
        error: (err) => {
          this.isDownloadSubmitting = false;
          this.openSnackBar(this.languageData.error_note1, this.languageData.close);
        },
      });
  }

  onDownloadAsAndPrintButton(shipmentId:number | undefined) {
    let shipmentIds = [shipmentId];
    const query = `connote/print`;

    this.commonService.isLoading(true);
    this.commonService
      .submitData('shipments', query, {
        ids: shipmentIds,
        includeChildren: false
      })
      .pipe(
        tap((response: IResponse<{ link: string }>) => {
          this.commonService.isLoading(false);
          window.open(
            `${this.commonService.SPPAPI.replace(
              '/api/',
              ''
            )}${response.data.link}`
          );
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next: () => {
          this.commonService.isLoading(false);
        },
        error: () => {
          this.cdr.detectChanges();
          this.commonService.isLoading(false);
          this.commonService.openErrorDialog();
        },
        complete: () => {
          this.cdr.detectChanges();
          this.commonService.isLoading(false);
        },
      });
  }

  private buildUIFields(detail: IOrderDetails) {
    this.dataBody = {
      connote_ids: [detail?.tracking_id],
      culture: 'en',
    };
    return {
      ...detail,
      uiOrderDate: detail.created_date
        ? moment(detail.created_date).format('DD MMM YY')
        : undefined,
      uiOrderTime: detail.created_date
        ? moment(detail.created_date).format('hh:mm A')
        : undefined,
      uiSenderPhoneNumber:
        detail.sender_details.dialing_code + detail.sender_details.phone_no,
      uiRecipientPhoneNumber:
        detail.recipient_details.dialing_code +
        detail.recipient_details.phone_no,
      uiParcelDimension: `${detail.parcel_details.width}w x ${detail.parcel_details.height}h x ${detail.parcel_details.length}l`,
      children : detail.children && detail.children.length ? detail.children : []
    };
  }

  // toggleImage() {
  //   this.imgUrl = this.dataSource?.data[0]?.tracking_data[0]?.epod;
  //   this.showPODImage = !this.showPODImage;
  // }
  onDownloadAsAndPrint(event: string, isMultiple = false) {
    let shipmentIds: any = [];
    if (!isMultiple) {
      shipmentIds.push(this.detail?.id);
    }

    const query =
      event === 'commercialinvoice'
        ? `${event}/print`
        : event === 'print'
        ? `connote/print`
        : event === 'connote';

    /* above condition for print label and connote has changed */
    /* previous */
    /*
      if (event === 'print') query = 'thermal/prn
      if (event === connote') query = `${event}/print`
    */

    this.commonService.isLoading(true);
    this.commonService
      .submitData('shipments', query, {
        ids: shipmentIds,
        includeChildren: true
      })
      .pipe(
        tap((response: IResponse<{ link: string }>) => {
          this.commonService.isLoading(false);
          window.open(
            `${this.commonService.SPPAPI.replace(
              '/api/',
              ''
            )}${response.data.link}`
          );
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next: () => {
          this.commonService.isLoading(false);
        },
        error: () => {
          this.cdr.detectChanges();
          this.commonService.isLoading(false);
          this.commonService.openErrorDialog();
        },
        complete: () => {
          this.cdr.detectChanges();
          this.commonService.isLoading(false);
        },
      });
  }

  getStatusColor() {
    const statusColors:any = {
      // Creation ~ #979797 || #2DCCCC
      'cancelled': '#979797',

      'order created': '#2DCCCC',

      // Pending ~ #7367C8
      'pickup assigned': '#7367C8',
      'pickup schedule': '#7367C8',
      'parcel_return_initiated': '#7367C8',

      // Transit ~ #006ED3 || #FF9C00
      'to-collect': '#006ED3',

      'picked up': '#FF9C00',
      'in-transit': '#FF9C00',
      'droppedoff': '#FF9C00',
      'on its way ': '#FF9C00',
      'OUT FOR DELIVERY': '#FF9C00',

      // Successful ~ #01B248
      'returned': '#01B248',
      'delivered': '#01B248',
      'collected': '#000000',
      // UnSuccessful ~ #FF1A1A
      'failed': '#FF1A1A',
      'PICKUP FAILED' : '#FF1A1A',

    };

    const status:any = this.detail?.tracking_detail?.process_status.toLowerCase();
    return statusColors[status] || '#000'; // Default color or any other color you want
  }

  extractTrackingDate(inputDate: string): string {
      const date = new Date(inputDate);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      };
      this.currentTrackingDate= `${date.toLocaleDateString('en-US', options)}`;
      return `${date.toLocaleDateString('en-US', options)}`;
    }
    private extractTrackingDetailsData(dataSource: any): any[] {
    this.groupedTrackingData = [];

    dataSource?.tracking_detail?.tracking_data?.forEach((entry: any) => {
      const dateParts = entry.date.split(', ');
      const formattedDate = dateParts[0];
      const formattedTime = this.formatTime(entry.date);

      // Check if the date is already in the groupedTrackingData
      const existingDate:any = this.groupedTrackingData.find((group: { date: any, time:any, title:any,descriptions:any,epodLink:any, office:any}) => group.date === formattedDate);

      if (existingDate) {
        // Date already exists, add the current entry to its items array
        existingDate.items.push({
          time: formattedTime,
          title: entry.process_summary,
          descriptions: [entry.process, `(${entry.office})`],
          epodLink: entry.epod,
          office: entry.office,
          reason: entry.reason,
        });
      } else {
        // Date doesn't exist, create a new entry in the groupedTrackingData
        const formattedEntry:any = {
          date: formattedDate,
          items: [
            {
              time: formattedTime,
              title: entry.process_summary,
              descriptions: [entry.process, `(${entry.office})`],
              epodLink: entry.epod,
              office: entry.office,
              reason: entry.reason,
            },
          ],
        };

        this.groupedTrackingData.push(formattedEntry);
      }
    });
    return this.groupedTrackingData;
  }
  private formatTime(dateTime: string): string {
    const date = new Date(dateTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const amPm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedHours}:${formattedMinutes} ${amPm}`;
  }
  private openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }
  navigateToReturn(){
    if(this.pickupId){
      this.router.navigate(['return-order',this.orderId, this.pickupId])
    }
 else{
  this.router.navigate(['/return-order/'+this.orderId]);
 }

  }

  proofActionEvent(){
    this.commonService.googleEventPush({
      "event": "view_proof_of_delivery",
      "event_category": "Track Order",
      "event_action": "View Proof Of Delivery",
      "event_label": "Proof Of Delivery - "+ this.detail?.tracking_id
    });
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
   * Method Name: confirmConvertToNonCOD
   *
   * Input Parameters: None
   *
   * Output Parameters: None
   *
   * Purpose:
   * - To open a confirmation dialog for changing the COD amount to Non-COD,
   *   submit the conversion request to the backend, and handle the response accordingly.
   *
   * Author:
   * - Saepul Latif
   *
   * Description:
   * - This method initiates a confirmation dialog to verify if the user wants to change
   *   the COD amount to Non-COD. If confirmed, it submits a request to update the payment
   *   mode for the specified tracking ID. It handles the success response by calling
   *   the success method, and error responses by determining the specific error code
   *   and calling the error handling method. Additionally, it ensures the dialog is closed
   *   and unsubscribes from the confirmation event subscription.
   */
  confirmConvertToNonCOD(){
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: '',
        descriptions: `${this.languageData.message_convert_to_non_cod} <span class="font-bold">RM ${this.detail?.parcel_details?.cod_amount.toFixed(2)}</span> ${this.languageData.to_non_cod}`,
        successCount: '1',
        icon: 'warning',
        confirmEvent: true,
        closeEvent: true,
        actionText: this.languageData.confirm_convert_to_non_cod,
        cancelText: this.languageData.cancel_button_to_non_cod
      },
    });

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe(() => {
        this.isLoading = true;
        this.cdr.detectChanges();
        this.commonService
        .submitData('shipments', 'paymentmode/update', {
          connote_id: this.detail?.tracking_id,
        }).subscribe({
          next: (res) => {
            this.successConvertToNonCOD(res.message);
          },
          error: (err) => {
            this.errorConvertToNonCOD(err.error.status);
          }
        });
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });

      dialogRef.afterClosed().subscribe(() => {
        console.log('modal closed')
      });
  }

/**
 * Method Name: successConvertToNonCOD
 *
 * Input Parameters:
 * - message: string - The message to be displayed in the Snackbar notification.
 *
 * Output Parameters: None
 *
 * Purpose:
 * - To display a success message to the user when the COD amount is successfully converted to Non-COD,
 *   update the loading state, and refresh the order details.
 *
 * Author:
 * - Saepul Latif
 *
 * Description:
 * - This method takes a success message as an input, opens a Snackbar to notify the user of the successful
 *   conversion, sets the loading state to true, triggers change detection to update the UI,
 *   and calls the method to render the order details. This ensures the user receives immediate feedback
 *   and the interface reflects the latest data.
 */
  private successConvertToNonCOD(message: string){
    this.commonService.openSnackBar(message, this.languageObj.error_handling.close);
    this.isLoading = true;
    this.cdr.detectChanges();
    this.renderOrderDetails();
  }

/**
 * Method Name: errorConvertToNonCOD
 *
 * Input Parameters:
 * - message: string - The error message to be displayed in the dialog.
 *
 * Output Parameters: None
 *
 * Purpose:
 * - To display an error message in a confirmation dialog when the conversion to Non-COD fails,
 *   allowing the user to acknowledge the error.
 *
 * Author:
 * - Saepul Latif
 *
 * Description:
 * - This method takes an error message as input and opens a dialog to notify the user of the
 *   failure to convert to Non-COD. It formats the message for display and includes buttons for
 *   user acknowledgment. The method subscribes to the confirmation event, which closes the dialog
 *   when the user acknowledges the message. It also logs a message to the console when the dialog is closed.
 */
  private errorConvertToNonCOD(status: number){
    this.isLoading = false;
    this.cdr.detectChanges();
    this.commonService.openSnackBar(status === 403 ? this.languageData.failed_to_convert_to_not_available : this.languageData.failed_to_convert_to_non_cod, this.languageObj.error_handling.close);
  }

/**
 * Method Name: statusButtonConvertToNonCOD
 *
 * Input Parameters:
 * - value: string - The status value to be checked against the allowed list for conversion to Non-COD.
 *
 * Output Parameters:
 * - Returns: boolean - Indicates whether the given status value is allowed for conversion to Non-COD.
 *
 * Purpose:
 * - To determine if the button status of a shipment allows for conversion to Non-COD.
 *
 * Author:
 * - Saepul Latif
 *
 * Description:
 * - This method checks if the provided status value is included in an allow list of statuses
 *   that permit conversion to Non-COD. The method converts the input value to lowercase to ensure
 *   the check is case-insensitive. It returns `true` if the value is found in the allow list
 *   and `false` otherwise.
 */
  statusButtonConvertToNonCOD(value: string){
    const allowList: string[] = ['pending-dropoff', 'pickup-requested', 'pickup-assigned', 'picked-up', 'droppedoff', 'in-transit', 'failed', 'to-collect'];
    return allowList.includes(value.toLowerCase());
  }

  /**
 * Method Name: formatMessage
 *
 * Input Parameters:
 * - message: string - The message to be formatted by wrapping specific text in a <span> element.
 *
 * Output Parameters:
 * - Returns: string - The formatted message with specified text wrapped in a <span> if applicable.
 *
 * Purpose:
 * - To format a given message by highlighting specific phrases related to conversion to Non-COD.
 *
 * Author:
 * - Saepul Latif
 *
 * Description:
 * - This method checks if the input message contains the phrases "Convert to Non COD"
 *   or "Non-COD". If found, it wraps the corresponding phrase in a <span> element with
 *   the class 'convert' to allow for specific styling in the UI. The method returns
 *   the modified message with the formatting applied, or the original message if neither
 *   phrase is present.
 */
  private formatMessage(message: string): string {
    const convertText = "Convert to Non COD";
    const nonCodText = "Non-COD";

    if (message.includes(convertText)) {
      return message.replace(convertText, `<span class='convert'>${convertText}</span>`);
    } else if (message.includes(nonCodText)) {
      return message.replace(nonCodText, `<span class='convert'>${nonCodText}</span>`);
    }

    return message;
  }

  getStringLength(sentence:any){
    return sentence && sentence.length > 10;
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
  cancelShipment(id: any){
    const titleDialog = this.detail?.parcel_details?.category.toLowerCase() === 'mps' ? this.languageData.confirm_delete_shipment : this.languageData.confirm_cancel_shipment;
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: '',
        descriptions: titleDialog,
        icon: 'warning',
        confirmEvent: true,
        closeEvent: true,
        actionText: this.languageData.confirm,
        cancelText: this.languageData.cancel
      },
    });

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe(() => {
        this.isLoading = true;
        this.cdr.detectChanges();
        this.commonService
        .submitData('shipments', 'cancel', {
          tracking_no: id,
        }).subscribe({
          next: (res) => {
            this.successCancelShipment(res.message);
          },
          error: (err) => {
            const msg = err?.error?.error?.message || this.languageData.failed_cancel_shipment;
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

  disableCancelShipment(status: string | undefined): boolean {
    const isMPS = this.detail?.parcel_details?.category.toLowerCase() === 'mps';
    const isPickupOrConnote = status === 'pickup-requested' || status === 'connote-assigned';
    const totalChildShipments = this.detail?.total_child_shipments || 0;

    //checking is mps and not parent mps
    if (isMPS && !this.checkingParentMPS()) {
      //checking is pickup or connote and total child shipments is more than 2
      if (!isPickupOrConnote || totalChildShipments  < 2) {
        return true;
      }

      //return true if not pickup or connote
      return !isPickupOrConnote;
    }

    //return true if not pickup or connote
    return !isPickupOrConnote;
  }


  private errorCancelShipment(err: string){
    this.isLoading = false;
    this.cdr.detectChanges();
    this.commonService.openSnackBar(err, this.languageObj.error_handling.close);
  }

  private successCancelShipment(message: string){
    this.commonService.openSnackBar(message, this.languageObj.error_handling.close);

    if(this.detail?.parcel_details?.category.toLowerCase() === 'mps'){
      this.router.navigate(['/my-shipment'], {queryParams: {t: 'pending-pickup'}});
    }else{
      const lastVisitedRoute = sessionStorage.getItem('lastVisitedRoute');
      const decodedUrl = decodeURIComponent(lastVisitedRoute || '/');
      location.replace(decodedUrl || '/');
    }
  }

  checkingParentMPS(){
    if(this.detail?.children === undefined){
      return true;
    }

    return this.detail?.children?.length > 0;
  }
}
