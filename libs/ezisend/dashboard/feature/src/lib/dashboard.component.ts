import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {
  ActionColor,
  DashboardTileAction,
} from '@pos/ezisend/dashboard/data-access/models';
import { BreadcrumbItem } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { bm } from '../../../../assets/my';
import { en } from '../../../../assets/en';
import { TranslationService } from '../../../../shared-services/translate.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'pos-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DashboardComponent implements OnInit, OnDestroy {


  
  data: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.dashboard :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.dashboard :
    en.data.dashboard;
  
  breadcrumbItems: BreadcrumbItem[] = [
    {
      title: this.data.home,
      routerLink: [''],
      external: false,
      current: false,
    }
  ];
  bannerObj:any;
  protected _onDestroy = new Subject<void>();

  constructor(
    private translate: TranslationService,
    public commonService : CommonService,
    private cdr: ChangeDetectorRef
  ){
    this.assignLanguageLabel();
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.data = en.data.dashboard
      }
      else if (localStorage.getItem("language") == "my") {
        this.data = bm.data.dashboard
      }
      this.assignLanguageLabel();
    })
  }

  ngOnInit(): void {
    this.commonService.fetchList('user', 'config')
    .pipe(takeUntil(this._onDestroy))
    .subscribe((res) => {
      if(res?.data?.promo_desktop_banner_link){
        this.bannerObj = {
          desktop:{
            src:res?.data?.promo_desktop_banner_link?.src,
            target:res?.data?.promo_desktop_banner_link?.target,
            height:"136"
          }
        }
      }

      if(res?.data?.promo_mobile_banner_link){
        this.bannerObj = {...this.bannerObj,
          mobile:{
            src:res?.data?.promo_mobile_banner_link?.src,
            target:res?.data?.promo_mobile_banner_link?.target,
            height:"165"
          }
        }
      }
      this.cdr.detectChanges();
    })
  }
  
  assignLanguageLabel(){
    this.breadcrumbItems = [
      {
        title: this.data.home,
        external: false,
        current: true,
      }
    ];
  };

  actionTiles: DashboardTileAction[] = [
    {
      mainTitle: 'CREATE ORDER',
      title: '',
      copy: 'Would you like to send something today?',
      actions: [
        {
          title: 'Single shipment',
          routerLink: ['shipment'],
          color: ActionColor.PRIMARY,
        },
        {
          title: 'Bulk shipment',
          routerLink: ['bulk-shipment'],
          color: ActionColor.PRIMARY,
        },
      ],
      size: 'm',
    },
    {
      mainTitle: 'PICK UP',
      title: `You have <span class='highlight'>0 order(s)</span> for pick up`,
      actions: [
        {
          title: 'Request for a Pick Up',
          routerLink: [],
          color: ActionColor.PRIMARY,
        },
      ],
      size: 's',
    },
  ];

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
