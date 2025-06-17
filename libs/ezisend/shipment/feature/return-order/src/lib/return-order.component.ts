import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subject, finalize, map, takeUntil } from 'rxjs';
import { BreadcrumbItem } from '@pos/ezisend/shared/data-access/models';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
@Component({
  selector: 'pos-return-order',
  templateUrl: './return-order.component.html',
  styleUrls: ['./return-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnOrderComponent implements OnInit {
  constructor(
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute) {
      router.events
      .subscribe((event:any) => {
        if (event.navigationTrigger === 'popstate') {
          this.commonService.redirectTo('/my-shipment', { t: 'request-pickup' });
        }
      });
    }

  protected _onDestroy = new Subject<void>();
  shipmentData: any = [];
  isLoading = false;
  breadcrumbItems: BreadcrumbItem[] = [
    {
      title: 'Home',
      routerLink: [''],
      external: false,
      current: false,
    },
    {
      title: 'My Shipments',
      routerLink: ['/my-shipment'],
      external: false,
      current: false,
    },
    {
      title: 'Edit Order',
      external: false,
      current: true,
    },
  ]

  ngOnInit(): void {
    this.isLoading = true;
    this.commonService
      .fetchList('shipments',`details-for-rts/${this.route.snapshot.params['id']}`)
      .pipe(
        map((response:any) => response.data),
        takeUntil(this._onDestroy),
        finalize(() => this.cdr.detectChanges)
      )
      .subscribe({
        next:(data:any)=>{
          this.commonService.setParcelDetail(data?.parcel_details);
          this.commonService.setRecipientDetail(data?.sender_details);
          if(data.sender_details.pickup_option_id) {
            this.commonService.setSenderAddress('');
            this.commonService.setSelectedShipmentData(data)
            this.router.navigate(['order-edit', this.route.snapshot.params['id'], data.sender_details.pickup_option_id]);
          } else {
            this.commonService.setSenderAddress(data.recipient_details);
          }
          this.shipmentData = data;
          this.isLoading = false;
          this.extractCustomDetails();
          this.cdr.detectChanges;
          localStorage.setItem('parcel_details.is_cod', data.parcel_details.is_cod);
        },
        error:()=>{
          this.commonService.openErrorDialog();
          this.isLoading = false;
          this.cdr.detectChanges;
        }
      });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  extractCustomDetails() {
    if (!this.shipmentData.custom_details) {
      return;
    }
    this.commonService.setCustomDetail(this.shipmentData.custom_details);
  }
}
