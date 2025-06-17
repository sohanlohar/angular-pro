import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SummaryTile } from '@pos/ezisend/dashboard/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import * as moment from 'moment';
import { BehaviorSubject, Observable, Subject, Subscription, finalize, forkJoin, map, of, take, takeUntil } from 'rxjs';
import { en } from 'libs/ezisend/assets/en';
import { bm } from 'libs/ezisend/assets/my';
import { TranslationService } from 'libs/ezisend/shared-services/translate.service';
@Component({
  selector: 'pos-shipment-summary',
  templateUrl: './shipment-summary.component.html',
  styleUrls: ['./shipment-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ShipmentSummaryComponent implements OnInit, OnDestroy {

  idleDays = 30;
  $total_cod: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  $total_failed: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  $total_pending: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  currentDate = new Date();
  start_date = '';
  end_date = '';
  boxHeight = 'auto';
  protected _onDestroy = new Subject<void>();

  statusList = ["request-pickup","pending-pickup", "live","delivered","failed-delivery","returned"];

  isLoadingStatus: { [key: string]: boolean } = {
    'request-pickup': false,
    'live': false,
    'delivered': false,
    'failed-delivery': false,
    'returned': false
  }

  private subscription: Subscription | undefined;

  data: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
    (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
      en.data

  summaryTiles: SummaryTile[] = [{
    image: 'update',
    title: this.data?.dashboard?.pending_pickup,
    count: 0,
    link: 'pending-pickup',
    color: 'purple-theme-color',
  },
  {
    image: 'local_shipping',
    title: this.data?.dashboard?.live_shipments,
    link: 'live-shipment',
    count: 0,
    color: 'yellow-theme-color',
  },
  {
    image: 'how_to_reg',
    title: this.data?.dashboard?.delivered,
    link: 'delivered',
    count: 0,
    color: 'green-theme-color',
  },
  {
    image: 'close',
    title: this.data?.dashboard?.failed_deliveries,
    link: 'fail-delivered',
    count: 0,
    color: 'red-theme-color',
  },
  {
    image: 'front_hand',
    title: this.data?.dashboard?.returns,
    link: 'return',
    count: 0,
    color: 'gray-theme-color',
  }];

  @HostListener("window:resize", []) updateMode() {
    this.boxHeight = window.innerWidth <= 1084 ? '130px' : 'auto';
  }

  constructor(
    public commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private translate: TranslationService
    ) {

  }

   // Date Range
   dateRangePickerForm: FormGroup = this.fb.group({
    start_date: [moment().subtract(1, 'month')],
    end_date: [moment()],
  });

  ngOnInit() {
    this.fetchConfig();
    this.fetchDashboardSummary(
      moment(this.dateRangePickerForm.value.start_date).startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
    moment(this.dateRangePickerForm.value.end_date).endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
    );
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.data = en.data
      }
      else if (localStorage.getItem("language") == "my") {
        this.data = bm.data
      }
      this.fetchDashboardSummary(
        moment(this.dateRangePickerForm.value.start_date).startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
    moment(this.dateRangePickerForm.value.end_date).endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
      );
    })
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  fetchConfig() {
    this.commonService.fetchList('user', 'config')
    .pipe(
      takeUntil(this._onDestroy)
    )
    .subscribe({
      next:(data)=>{
        this.commonService.isCOD.next(data.data?.feature_cod);
        this.commonService.isCODUbat.next(data.data?.feature_codubat);
        this.commonService.isMelPlus.next(data.data?.feature_melplus);
        this.commonService.isMPS.next(data.data?.feature_mps);
        const firstNum = data.data.pusher_channels[1].split('-')[2].charAt(0)
        if( firstNum === '8'){
          this.commonService.masterAccount.next(true);
        } else {
          this.commonService.masterAccount.next(false)
        }
      },
      error:()=>{
        this.commonService.openErrorDialog();
      }
    });
  }

  onDateRangePickerFormChange(event: any) {
    if (event) {
    this.start_date = moment(event.start_date).startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
    this.end_date = moment(event.end_date).endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
     this.commonService.googleEventPush({
        event: 'filter_section',
        event_category: 'SendParcel Pro - Dashboard',
        event_action: 'Filter Section',
        event_label:  this.start_date +" - "+ this.end_date
      });
  } else {
    this.start_date = '';
    this.end_date = '';
  }
  this.fetchDashboardSummary(this.start_date, this.end_date);
}

  fetchDashboardSummary(startDate?:string, endDate?:string) {

    // create observable for all status
    const query = `count-shipments?status=`;
    const date = (startDate !== '') ? `&start_date=${startDate}&end_date=${endDate}` : '';
    const requests$: Observable<any>[] = this.statusList.map(el => {
      this.isLoadingStatus[el] = true;
      const newQuery = query + el;
      return this.commonService.fetchList('dashboard', newQuery + date).pipe(
        map(response => ({
          status: el,
          count: response.data.count,
          sum_cod: response.data.sum_cod
        })),
        finalize(() => {
          this.isLoadingStatus[el] = false;
        }),
        takeUntil(this._onDestroy),
      );
    });

    //join all observable status and subscribe once
    forkJoin(requests$).subscribe({
      next: (responses) => {
        responses.forEach((res: any) => {
          this.mappingDataStatus(res);
        });

        if(this.commonService.isCOD.getValue()) {
          this.commonService.isCOD
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {

            const pendingPickup = responses.find(el => el.status === "delivered");
            const findTotalFailed = responses.find(el => el.status === "failed-delivery");
            const findTotalPending = responses.find(el => el.status === "live");

            if(pendingPickup){
              this.$total_cod.next(pendingPickup.sum_cod);
            }

            if(findTotalFailed){
              this.$total_failed.next(findTotalFailed.sum_cod);
            }

            if(findTotalPending){
              this.$total_pending.next(findTotalPending.sum_cod);
            }
          });
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.commonService.openErrorDialog();
        this.cdr.detectChanges();
      }
    });
  }

  // create mapping data for result subscribe
  private mappingDataStatus(res: {count: number, sum: number, status: string}){
    switch (res.status) {
      case "pending-pickup":
        this.summaryTiles[0].count = res.count;
        this.summaryTiles[0].title = this.data.dashboard?.pending_pickup;
        break;

      case "live":
        this.summaryTiles[1].count = res.count;
        this.summaryTiles[1].title = this.data.dashboard?.live_shipments;
        break;

      case "delivered":
        this.summaryTiles[2].count = res.count;
        this.summaryTiles[2].title = this.data.dashboard?.delivered;
        break;

      case "failed-delivery":
        this.summaryTiles[3].count = res.count;
        this.summaryTiles[3].title = this.data.dashboard?.failed_deliveries;
        break;

      case "returned":
        this.summaryTiles[4].count = res.count;
        this.summaryTiles[4].title = this.data.dashboard?.returns;
        break;

      default:
        console.log(`Unexpected status: ${res.status}`);
    }
  }

  allStatusLoadingState(): boolean {
    return Object.values(this.isLoadingStatus).every(value => value === false);
  }

}
