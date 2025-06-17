import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output, ViewEncapsulation,OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { IsActiveMatchOptions, NavigationStart, Event as NavigationEvent, PRIMARY_OUTLET, Router, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';
import { LoginService } from '@pos/ezisend/auth/data-access/services';
import { IResponse } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { NavItem } from '@pos/ezisend/shell/data-access/models';
import { Observable, Subject, takeUntil } from 'rxjs';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';
import { LoginFacade } from '@pos/ezisend/auth/data-access/store';
@Component({
  selector: 'pos-nav-sidebar',
  templateUrl: './nav-sidebar-v2.component.html',
  styleUrls: ['./nav-sidebar-v2.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class NavSidebarComponent implements OnInit{
  @Input() slideState: Observable<boolean> | undefined;
  @Input() sidebarActive = false;
  @Output() navItemClicked = new EventEmitter<string>();
  @Output() collapseSidebar = new EventEmitter<boolean>();
  @Input() masterAccount = false;
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.menu :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.menu :
    en.data.menu;
  eventUrl = '';
  firstPathUrl = '';
  isExpandChildPanel = false;
  isbold = false;
  routerLinkActiveOptions: IsActiveMatchOptions = {
    matrixParams: 'ignored',
    queryParams: 'ignored',
    fragment: 'ignored',
    paths: 'exact'
  };
  navMenu: NavItem[] = [];
  protected _onDestroy = new Subject<void>();
  isMasterAccount = true;
  constructor(private router: Router, private cdr: ChangeDetectorRef,public commonService: CommonService, public loginService: LoginService,
    private translate: TranslationService, private loginFacade: LoginFacade) {
    this.assignMenuItems(); // initialize the menu items
    this.router.events
      .pipe(takeUntil(this._onDestroy))
      .subscribe((event: NavigationEvent) => {
        if(event instanceof NavigationStart) {
          this.eventUrl = event.url;
          this.firstPathOfUrl();
          this.updateActions();
        }
      });
    this.eventUrl = this.router.url.replace("/","");
    this.firstPathOfUrl();
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.menu;
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.menu
      }
      this.assignMenuItems();
    })
  }
  accountNumber: any;
  loggedInAccountNumber: any;
  assignMenuItems(){
    this.navMenu = [
      {
        displayName: this.languageData.home,  //'Home'
        routerLink: [''],
        iconName: 'home',
      },
      {
        displayName: this.languageData.shipments,  //'Shipments',
        iconName: 'local_shipping',
        children: [
          {
            displayName: this.languageData.single_shipment,  //'Single Shipment',
            routerLink: ['shipment'],
            iconName: 'fiber_manual_record',
          },
          {
            displayName: this.languageData.bulk_shipment,  //'Bulk Shipments',
            routerLink: ['bulk-shipment'],
            iconName: 'fiber_manual_record',
          },
          {
            displayName: this.languageData.my_shipment,  //'My Shipments',
            routerLink: ['my-shipment'],
            queryParam: { t: 'request-pickup'},
            iconName: 'fiber_manual_record',
          },
          {
            displayName: this.languageData.rate_calculator, //'Rate Calculator',
            routerLink: ['rate-calc'],
            iconName: 'fiber_manual_record',
          },
          {
            displayName: this.languageData.contact,  //'Contacts',
            routerLink: ['contact'],
            iconName: 'fiber_manual_record',
          },
        ],
      },
      {
        displayName: this.languageData.profile,  //'Profile',
        routerLink: ['profile'],
        iconName: 'person',
        children: [{
          displayName: this.languageData.user_profile, // 'User Profile',
          routerLink: ['profile'],
          iconName: 'fiber_manual_record',
        },{
          displayName: this.languageData.user_management, // 'User Management',
          routerLink: ['user'],
          iconName: 'fiber_manual_record',
        }]
      },
      {
        displayName: this.languageData.reports,  //'Reports',
        routerLink: ['report'],
        iconName: 'description',
      },
      {
        displayName: this.languageData.billing,  //'Billing',
        iconName: 'receipt_long',
        children: [
          {
            displayName: this.languageData.invoice,  //'Invoice',
            routerLink: ['billing/invoice'],
            iconName: 'fiber_manual_record',
          },
        ]
      },
     /** TEMP HIDE FOR PLUGINS
      {
        displayName: 'Billing',
        iconName: 'receipt_long',
        children: [
          {
            displayName: 'Invoice',
            routerLink: ['billing/invoice'],
            iconName: 'fiber_manual_record',
          },
        ]
      },
     /** TEMP HIDE FOR PLUGINS
      {
        displayName: 'Integration',
        iconName: 'dataset_linked',
        children: [
          {
            displayName: 'Add Store',
            routerLink: ['integration/add-store'],
            iconName: 'fiber_manual_record',
          },
          {
            displayName: 'My Store',
            routerLink: ['integration/my-store'],
            iconName: 'fiber_manual_record',
          },
        ]
      },
      */
      {
        displayName: this.languageData.logout,  //'Logout',
        iconName: 'exit_to_app'
      }
    ];
  }
  ngOnInit(){
    this.loginService.config().subscribe({
      next : (response:IResponse<any>) => {
        this.isMasterAccount =  response?.data?.account_config?.is_master;
        this.loggedInAccountNumber= response?.data.pusher_channels[1].split('-')[2];
        localStorage.setItem("loggedInAccountNumber",this.loggedInAccountNumber);
        localStorage.setItem("isMasterAccount",this.isMasterAccount.toString());
        this.cdr.detectChanges();
      }
    })
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateActions();
  }
  updateActions() {
    const bulkShipmentsItem = {
      displayName: this.languageData.bulk_shipment, // 'Bulk Shipments',
      routerLink: ['bulk-shipment'],
      iconName: 'fiber_manual_record',
    };
    const shipmentIndex:any = this.navMenu[1].children?.findIndex(item => item.displayName === this.languageData.bulk_shipment);
    if (!this.commonService.checkIfMobile()) {
      if (shipmentIndex === -1) {
        // If the "Bulk Shipments" item is not present, add it to the menu
        const singleShipmentIndex: any = this.navMenu[1].children?.findIndex(item => item.displayName === this.languageData.single_shipment);
        if (singleShipmentIndex !== -1) {
          // Insert "Bulk Shipments" item after "Single Shipment" item
          this.navMenu[1].children?.splice(singleShipmentIndex + 1, 0, bulkShipmentsItem);
        }
      }
    } else {
      // If it's a mobile screen, remove "Bulk Shipments" from the array
      if (shipmentIndex !== -1) {
        this.navMenu[1].children?.splice(shipmentIndex, 1);
      }
    }
    const billingIndex = this.navMenu.findIndex(item => item.displayName === this.languageData.billing);
  if (this.commonService.checkIfMobile()) {
    // If it's a mobile screen, remove "Billing" and "Invoice" from the array
    // if (billingIndex !== -1) {
    //   this.navMenu.splice(billingIndex, 1);
    // }
  } else {
    // If it's not a mobile screen, check if "Billing" exists and add it back if not present
    if (billingIndex === -1) {
      this.navMenu.push({
        displayName: this.languageData.billing,
        iconName: 'receipt_long',
        children: [
          {
            displayName: this.languageData.invoice,
            routerLink: ['billing/invoice'],
            iconName: 'fiber_manual_record',
          },
        ]
      });
    }
  }
  const integrationIndex = this.navMenu.findIndex(item => item.displayName === 'Integration');
  if (this.commonService.checkIfMobile()) {
    // If it's a mobile screen, remove "Integration" from the array
    // if (integrationIndex !== -1) {
    //   this.navMenu.splice(integrationIndex, 1);
    // }
  } else {
    // If it's not a mobile screen and "Integration" is not present, add it back along with its children
    // if (integrationIndex === -1) {
    //   this.navMenu.push({
    //     displayName: 'Integration',
    //     iconName: 'dataset_linked',
    //     children: [
    //       {
    //         displayName: 'Add Store',
    //         routerLink: ['integration/add-store'],
    //         iconName: 'fiber_manual_record',
    //       },
    //       {
    //         displayName: 'My Store',
    //         routerLink: ['integration/my-store'],
    //         iconName: 'fiber_manual_record',
    //       },
    //     ]
    //   });
    // }
  }
  const logoutIndex = this.navMenu.findIndex(item => item.iconName === 'exit_to_app');
  if(this.commonService.checkIfMobile()){
    if (logoutIndex !== -1) {
      this.navMenu.splice(logoutIndex, 1);
    }
  }else{
    if(logoutIndex === -1){
      this.navMenu.push(
        {
          displayName: this.languageData.logout,  //'Logout',
          iconName: 'exit_to_app'
        }
      )
    }
  }
  }
  checkMasterAccount(checkAccountNumber: string): boolean {
     return checkAccountNumber.startsWith("88");
  }
  private firstPathOfUrl() {
    const tree: UrlTree = this.router.parseUrl(this.eventUrl);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    if (g) {
      const s: UrlSegment[] = g.segments;
      s[0].path;
      s[0].parameters;
      this.firstPathUrl = s[0].path;
      localStorage.setItem("firstPathUrl",this.firstPathUrl)
    } else {
      this.firstPathUrl = '';
    }
  }
  logout(){
    this.commonService.googleEventPush({
      "event": "top_menu",
      "event_category": "SendParcel Pro - Menu",
      "event_action": "Click Top Menu",
      "event_label": "Log Out"
    });
    this.loginFacade.logout();
  }

  collapse() {
    this.collapseSidebar.emit(true);
  }
}
