import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  BreadcrumbItem,
  IResponse,
} from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import {
  IOrderDetails,
  IDataShipment,
} from '@pos/ezisend/shipment/data-access/models';
import { environment } from '@pos/shared/environments';
import * as moment from 'moment';
import { Observable, Subject, finalize, map, of, takeUntil, tap } from 'rxjs';
import { bm } from '../../../../../../../assets/my';
import { en } from '../../../../../../../assets/en';
import { TranslationService } from '../../../../../../../shared-services/translate.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { MyShipmentTableComponent } from '@pos/ezisend/shipment/ui/my-shipment-table';
@Component({
  selector: 'pos-mps-details',
  templateUrl: './mps-details.component.html',
  styleUrls: ['./mps-details.component.scss'],
})
export class MpsDetailsComponent implements OnInit, OnDestroy {
  backData = {};
  trackingUrl = environment.trackingURL;
  protected _onDestroy = new Subject<void>();
  breadcrumbItems: BreadcrumbItem[] = [];
  detail: IOrderDetails | undefined;
  isLoading = false;
  //  MPS Details
  isMPS = false;
  mpsDetailsForm = this.fb.group({
    parentConsignmentNote: [{ value: '', disabled: true }],
    totalShipments: [{ value: '', disabled: true }],
    totalWeight: [{ value: '', disabled: true }],
  });
  selectedPickUpNumber: any;
  isSelectAllOrders = false;
  isDisplayPrintButton = true;
  isDisplayDownloadButton = true;
  isDisplayDeleteButton = false;
  selectedMultipleData: IDataShipment[] = [];
  selectedSingleData!: IDataShipment;
  shipment: any = [];
  shipment$: Observable<any> | undefined;
  columns = [
    'select',
    'trackingDetail',
    'status',
    'recipient',
    'deliveryDetail',
    'type',
    'action',
  ];
  totalShipmentRecords = 0;
  actions = ['print', 'edit', 'my_location', 'cancel'];
  totalBatchRequest = 0;
  currentBatchPageRequest = 0;
  batchProcessingIds: number[] = [];
  getPickUpNumber: any;
  viewBy: any;
  activeTab = 'request-pickup';
  isShowCommercialinvoiceButton = false;

  languageObj: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
    en.data;

  languageOrderDetail:any = this.languageObj.order_details;
  languageData: any = this.languageObj.myShipments.mps_details;

  @ViewChild(MyShipmentTableComponent) myShipmentTable!: MyShipmentTableComponent;

  constructor(
    public commonService: CommonService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private fb: UntypedFormBuilder,
    private translate: TranslationService,
    public dialog: MatDialog
  ) {
    this.route.queryParams.subscribe(params => {
      this.createBreadCrumbs(params)
    });
    this.updateActions();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.commonService
      .fetchList('shipments', `query?id=${this.route.snapshot.params['id']}`)
      .pipe(
        map((resp) => resp.data),
        map((detail) => this.buildUIFields(detail)),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next: (detail) => {
          this.detail = detail;
          this.mpsDetailsForm.patchValue({
            parentConsignmentNote: detail.tracking_id,
            totalShipments: detail?.children.length + 1,
            totalWeight: detail.parcel_details.total_mps_weight,
          });
          this.shipment = [
            {
              id: detail.id,
              tracking_id: detail.tracking_id,
              created_date: detail.created_date,
              tracking_details: {
                tracking_id: detail.tracking_id,
                category: detail.parcel_details.category,
              },
              status: detail.status,
              recipient: {
                name: detail.recipient_details.name,
                dialing_code: detail.recipient_details.dialing_code,
                phone_no: detail.recipient_details.phone_no,
                email: detail.recipient_details.email,
              },
              delivery_details: {
                from: detail.sender_details.city,
                to: detail.recipient_details.city,
              },
              sum_insured: detail.parcel_details.sum_insured,
              type: detail.parcel_details.type,
              is_cod: detail.parcel_details.is_cod,
              channel_order: {},
              routing_code: detail.routing_code,
            },
          ];

          const child = (detail.children || []).map((child: any) => {
            const childObj = {
              ...detail,
              id: child.id,
              created_date: child.created_date,
              tracking_details: {
                tracking_id: child.tracking_id,
                category: child.category,
              },
              status: detail.status,
              recipient: {
                name: detail.recipient_details.name,
                dialing_code: detail.recipient_details.dialing_code,
                phone_no: detail.recipient_details.phone_no,
                email: detail.recipient_details.email,
              },
              delivery_details: {
                from: detail.sender_details.city,
                to: detail.recipient_details.city,
              },
              sum_insured: child.sum_insured,
              type: detail.parcel_details.type,
              is_cod: detail.parcel_details.is_cod,
              routing_code: detail.routing_code,
            };
            return childObj;
          });
          this.shipment = this.shipment.concat(child);
          this.shipment$ = of({ data: { shipments: this.shipment } });
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.commonService.openCustomErrorDialog(err);
        },
      });

      this.assignLanguageLabel()
      this.translate.buttonClick$.subscribe(() => {
        if (localStorage.getItem("language") == "en") {
          this.languageData = en.data.myShipments.mps_details;
        }
        else if (localStorage.getItem("language") == "my") {
          this.languageData = bm.data.myShipments.mps_details;
        }
        this.assignLanguageLabel()
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
        title: this.languageData.my_shipment,
        routerLink: ['/my-shipment'],
        external: false,
        current: false,
      },
      {
        title: this.languageData.mps_details,
        external: false,
        current: true,
      },
    ];


    this.backData = {
      path: '/my-shipment',
      query: {t: this.activeTab},
      label: this.languageData.back_to_pickup,
    };
  }

  private createBreadCrumbs(params: Params){

    if (params && params['activeTab']) {
      const paramsData:any = {t: params['activeTab']};
      if(params['viewBy']){
        paramsData['viewBy'] = params['viewBy'];
        this.viewBy = params['viewBy'];
      }
      this.activeTab = params['activeTab'];
      const myShipmentsBreadcrumb = this.breadcrumbItems.find(item => item.title === 'My Shipments');

      if (myShipmentsBreadcrumb) {
        myShipmentsBreadcrumb.query = paramsData;
      }

      this.backData = {
        path: '/my-shipment',
        query: paramsData,
        label: this.languageData.back_to_pickup,
      };
    }
    if (params && params['pickUpNumber']) {
      const paramsData: any = { activeTab: params['activeTab'] };
      if (params['viewBy']) {
        paramsData['viewBy'] = params['viewBy'];
        this.viewBy = params['viewBy'];
      }
      this.getPickUpNumber = params['pickUpNumber'];
      this.breadcrumbItems[2] = {
        title: this.languageData.pickup_Details,
        routerLink: ['/my-shipment/parcel-details/' + params['pickUpNumber']],
        query: paramsData,
        external: false,
        current: false,
      };
      this.breadcrumbItems[3] = {
        title: this.languageData.mps_details,
        external: false,
        current: true,
      };
      this.backData = {
        path: '/my-shipment/parcel-details/' + params['pickUpNumber'],
        query: paramsData,
        label: this.languageData.back_to_pickup_detail,
      };
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateActions();
  }

  updateActions() {
    if (this.commonService.checkIfMobile()) {
      this.actions = ['edit', 'my_location', 'cancel'];
    } else {
      this.actions = ['print', 'edit', 'my_location', 'cancel'];
    }
  }
  private buildUIFields(detail: IOrderDetails) {
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
      children: detail.children && detail.children.length ? detail.children : [],
    };
  }

  onActionButtonIcon(event: string, isMultiple = false) {
    switch (event) {
      case 'connote':
      case 'tallysheet':
      case 'commercialinvoice':
      case 'print':
        this.onDownloadAsAndPrint(event, isMultiple);
        return;
      default:
        return;
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
    this.isShowCommercialinvoiceButton = this.selectedMultipleData.some(
      (order: IDataShipment) => order.type === 'INTERNATIONAL'
    );
  }

  onActionIconEvent(event: { data: IDataShipment; actionType: string }) {
    /* actions */
    this.selectedSingleData = event.data;
    const urlPathDetails ='my-shipment/order-details';

    const urlDetails = `${urlPathDetails}/${event.data.id}?activeTab=${this.activeTab}`;

    if (event.actionType === 'cancel'){
      this.cancelShipment(event.data?.tracking_details?.tracking_id);
      return;
    }

    if (event.actionType === 'order-details') {
      const params: any = {
        queryParams: {
          parentid: this.route.snapshot.params['id'],
          activeTab: this.activeTab,
        },
      };
      const urlDetails = `${urlPathDetails}/${event.data.id}?parentid=${this.route.snapshot.params['id']}&activeTab=${this.activeTab}`;
      if (this.getPickUpNumber) {
        params['queryParams']['pickUpNumber'] = this.getPickUpNumber;
      }
      if (this.viewBy) {
        params['queryParams']['viewBy'] = this.viewBy;
      }
      window.open(urlDetails)
    }
    if (event.actionType === 'print') {
      this.onDownloadAsAndPrint(event.actionType, false);
      return;
    }
    if (
      event.actionType === 'my_location' &&
      event.data.tracking_details.tracking_id
    ) {
      window.open(
        urlDetails,
        '_blank'
      );
    }
    if(event.actionType === 'edit'){

        this.commonService.fetchList('shipments', `query?id=${event.data.id}`)
        .pipe(
          map((response: { data: any; }) => response.data),
          takeUntil(this._onDestroy),
          finalize(() => this.cdr.detectChanges)
        )
        .subscribe({
          next:(data)=>{
            this.commonService.setSelectedShipmentData(data);
            if(data.sender_details.pickup_option_id) {
              const currentDomain = window.location.origin;
              window.open(`${currentDomain}/order-edit/${event.data.id}/${data.sender_details.pickup_option_id}/pending-pickup`, '_blank');
            }else{
              const currentDomain = window.location.origin;
              window.open(`${currentDomain}/order-edit/${event.data.id}/pending-pickup`, '_blank');
            }
          },
          error:()=>{
            this.commonService.openErrorDialog();
            this.cdr.detectChanges;
          }
        });
      return;
    }
  }

  onDownloadAsAndPrint(event: string, isMultiple = false) {
    let shipmentIds: number[] = [];
    /* if select all orders toggle */
    if (this.isSelectAllOrders) {
      shipmentIds = this.batchProcessingIds;
    } else if (isMultiple) {
      /* multiple checkbox tick */
      /* button print lable, download connote & tallysheet */
      /* just grab all shipment ids without filtering */
      // if (event === 'print') {
      //   shipmentIds = this.selectedMultipleData.map(
      //     (shipment: IDataShipment) => shipment.id
      //   );
      // }
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

          shipmentIds = this.selectedMultipleData.map(
            (shipment: IDataShipment) => shipment.id
          );

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

    this.commonService
      .submitData('shipments', query, {
        ids: shipmentIds,
        includeChildren: false
      })
      .pipe(
        tap((response: IResponse<{ link: string }>) => {
          window.open(
            `${this.commonService.SPPAPI.replace('/api/', '')}${
              response.data.link
            }`
          );
          if (this.isSelectAllOrders) {
            this.currentBatchPageRequest += 1;
            this.totalBatchRequest = this.totalBatchRequest - 1;
            const query = `list?pickup_no=${this.route.snapshot.params['id']}&page=${this.currentBatchPageRequest}&limit=100`;
            if (this.totalBatchRequest >= 1)
              this.fetchBatchShipments(event, query);
            else this.currentBatchPageRequest = 0;
          }
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        error: () => {
          this.commonService.openErrorDialog();
        },
      });
  }

  fetchBatchShipments(event: string, query: string) {
    this.commonService.isLoading(true);
    this.commonService
      .fetchList('shipments', query)
      .pipe(
        takeUntil(this._onDestroy),
        tap((response: IResponse<{ shipments: IDataShipment[] }>) => {
          if (
            event === 'print' ||
            event === 'connote' ||
            event === 'tallysheet'
          ) {
            this.batchProcessingIds = response.data.shipments.map(
              (shipment: IDataShipment) => +shipment.id
            );
          } else if (event === 'commercialinvoice') {
            const shipmentsInternational = response.data.shipments.filter(
              (shipment: IDataShipment) => shipment.type === 'INTERNATIONAL'
            );
            if (shipmentsInternational.length) {
              this.batchProcessingIds = shipmentsInternational.map(
                (shipment: IDataShipment) => +shipment.id
              );
            }
          } else if (event === 'delete') {
            const shipmentsWithoutTrackingID = response.data.shipments.filter(
              (shipment: IDataShipment) =>
                shipment.tracking_details.tracking_id === ''
            );
            if (shipmentsWithoutTrackingID.length) {
              this.batchProcessingIds = shipmentsWithoutTrackingID.map(
                (shipment: IDataShipment) => +shipment.id
              );
            }
          }

          this.onDownloadAsAndPrint(event);
        })
      )
      .subscribe({
        next: () => {
          this.commonService.isLoading(false);
        },
        error: () => {
          this.commonService.isLoading(false);
          this.commonService.openErrorDialog();
        },
      });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
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
  const title = id === this.myShipmentTable.checkParentMPS() ? this.languageOrderDetail.confirm_delete_mps : this.languageOrderDetail.confirm_delete_shipment;
  const dialogRef = this.dialog.open(DialogComponent, {
    data: {
      title: '',
      descriptions: title,
      icon: 'warning',
      confirmEvent: true,
      closeEvent: true,
      actionText: this.languageOrderDetail.confirm,
      cancelText: this.languageOrderDetail.cancel
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

disableCancelShipment(status: string | undefined): boolean{
  return status !== 'pickup-requested' && status !== 'connote-assigned';
}

private errorCancelShipment(err: string){
  this.isLoading = false;
  this.cdr.detectChanges();
  this.commonService.openSnackBar(err, this.languageObj.error_handling.close);
}

private successCancelShipment(message: string){
  this.commonService.openSnackBar(message, this.languageObj.error_handling.close);
  this.router.navigate(['/my-shipment'], {queryParams: {t: 'pending-pickup'}});
}
}
