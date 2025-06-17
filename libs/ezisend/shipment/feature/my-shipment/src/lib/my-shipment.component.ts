import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BreadcrumbItem,
  IResponse,
} from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { IShipment, IShipmentSummaryTotal } from '@pos/ezisend/shipment/data-access/models';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-my-shipment',
  templateUrl: './my-shipment.component.html',
  styleUrls: ['./my-shipment.component.scss'],
})
export class MyShipmentComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  pageType = 'request-pickup';
  pageQuery = '';
  selectedIndex = 0;
  shipment$: Observable<IResponse<IShipment>> | undefined;
  shipmentSummaryTotal?: IShipmentSummaryTotal;
  data: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.myShipments :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.myShipments :
    en.data.myShipments;

  breadcrumbItems: BreadcrumbItem[] = [];

  protected _onDestroy = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private translate: TranslationService
    ) {
      this.assignLanguageLabel();
      this.translate.buttonClick$.subscribe(() => {
        if (localStorage.getItem("language") == "en") {
          this.data = en.data.myShipments
        }
        else if (localStorage.getItem("language") == "my") {
          this.data = bm.data.myShipments
        }
        this.assignLanguageLabel();
      })
  }

  assignLanguageLabel(){
    this.breadcrumbItems = [
        {
          title: this.data.home,
          routerLink: [''],
          external: false,
          current: false,
        },
        {
          title: this.data.my_shipments,
          external: false,
          current: true,
        },
      ];
      
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((res: any) => {
      this.pageType = res.t;
      this.pageQuery = res.q;
    });
    this.tabSelection();
    // this.fetchShipmentSummary()
  }

  ngAfterViewInit() {
    this.selectTab(null, false);
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  // fetchShipmentSummary() {
  //   this.commonService.fetchList('dashboard', 'summary')
  //   .pipe(
  //     takeUntil(this._onDestroy),
  //     tap((response: IResponse<IShipmentSummaryTotal>) => (this.shipmentSummaryTotal = response.data))
  //   )
  //   .subscribe({
  //     error:()=>{
  //       this.commonService.openErrorDialog();
  //     }
  //   })
  // }

  selectTab(tabChangeEvent: MatTabChangeEvent | null, reset = true) {
    this.commonService.updateGlobalSearchParams({});
    const Index = !tabChangeEvent
      ? this.stepper.selectedIndex
      : tabChangeEvent.index;

    this.pageType =
      Index == 0
      ? 'request-pickup'
      : Index  == 1
      ? 'pending-pickup'
      : Index  == 2
      ? 'live-shipment'
      : Index  == 3
      ? 'delivered'
      : Index  == 4
      ? 'fail-delivered'
      : Index  == 5
      ? 'return'
      : 'all';

    const queryParams = reset
      ? { t: this.pageType }
      : { t: this.pageType, q: this.pageQuery };

    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: queryParams,
    });
  }

  tabSelection() {
    this.route.queryParams.subscribe((data) => {
      if(data['t']) {
        if(data['t'] === 'request-pickup') {
          this.selectedIndex = 0;
        } else if(data['t'] === 'pending-pickup') {
          this.selectedIndex = 1;
        } else if(data['t'] === 'live-shipment') {
          this.selectedIndex = 2;
        } else if(data['t'] === 'delivered') {
          this.selectedIndex = 3;
        } else if(data['t'] === 'fail-delivered') {
          this.selectedIndex = 4;
        } else if(data['t'] === 'return') {
          this.selectedIndex = 5;
        } else if(data['t'] === 'all') {
          this.selectedIndex = 6;
        }
      }
    })
  }

  handleDataFromChild(tab:number) {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams:  { t: 'pending-pickup' },
    });
  }
}
