import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, OnInit, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '@pos/ezisend/auth/data-access/services';
import { LoginFacade, MeResponse } from '@pos/ezisend/auth/data-access/store';
import { BreakpointService, languageList } from '@pos/ezisend/shell/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { Observable } from 'rxjs';
import {TranslationService} from '../../../../../shared-services/translate.service';
import { bm } from '../../../../../../../libs/ezisend/assets/my';
import { en } from '../../../../../../../libs/ezisend/assets/en';
import { MAT_SELECT_SCROLL_STRATEGY_PROVIDER } from '@angular/material/select';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER } from '@angular/material/datepicker';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { AccountAccessComponent } from '@pos/ezisend/user-management/ui/account-access-form';
@Component({
  selector: 'pos-nav-header',
  templateUrl: './nav-header.component.html',
  styleUrls: ['./nav-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
    FormGroupDirective,
    FormBuilder,
    MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER,
  ],
})
export class NavHeaderComponent implements OnInit{
  isSmallScreen: Observable<boolean>;
  userData$: Observable<MeResponse>;
  loggedIn$ = this.loginFacade.loggedIn$;
  @Output() menuToggled = new EventEmitter<void>();
  @Output() ItemsPageViewSizeChange = new EventEmitter<number>();
  search!: string;
  authToken: any;
  accountList: any;
  @Input() userProfileSvg = './assets/userProfile.svg'
  data: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
    (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
      en.data;
  shipmentStatusModel!: string;
  paymentTypeModel!: string;
  ProductModel!: string;
  showGlobalSearchBar = false;
  showSearch = false;
  start_date = '';
  end_date = '';
  isMasterAccount: any;
  pageSize = 100;
  languageList: languageList[] = [
    { value: "en", viewValue: "English", initial: "EN", imageUrl: './assets/flag-english.svg' },
    { value: "my", viewValue: "B. Malaysia", initial: "BM", imageUrl: './assets/flag-malaysia.svg' },
  ];

  selectedLanguage :any;

  @ViewChild('searchInput') myInputRef!: ElementRef;
  public searchStyle: {width?:string, left?:string} = {};

  constructor(
    breakpointService: BreakpointService,
    private translate : TranslationService,
    private loginService: LoginService,
    private loginFacade: LoginFacade,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    public dialog: MatDialog,
  ) {
    const storedLanguage = localStorage.getItem("language") ?? 'en'
    this.selectedLanguage = this.languageList.find(item => item.value === storedLanguage)

    this.assignLanguageLabel();
    this.isSmallScreen = breakpointService.isSmallScreen;
    this.userData$ = this.loginService.me();
    this.loginService.config().subscribe((data: any) => {
      this.isMasterAccount =  data?.data?.account_config?.is_master;
      this.loginService.setCodStatus(data['data']['feature_cod']);
    });
    setTimeout(() => {
      this.loginService.globalSearch.subscribe((data: any) => {
        this.search = data.keyword;
      });
    }, 1000 );
    this.updateActions();
  }
  shipmentStatus: any = [];
  paymentType: any = [
    { value: 'cod', viewValue: 'COD' },
    { value: 'non_cod', viewValue: 'NON COD' },
  ];
  product: any = [
    { value: 'Pos Laju', viewValue: 'Pos Laju' },
    { value: 'MPS', viewValue: 'MPS' },
    { value: 'Mel Plus', viewValue: 'Mel Plus' },
    { value: 'EMS', viewValue: 'Pos Laju International' },
    { value: 'Air Parcel', viewValue: 'Economy International (Air)' },
    { value: 'Surface Parcel', viewValue: 'Economy International (Surface)' },
  ];
  advanceSearchDateForm: FormGroup = this.fb.group({
    start_date: [new Date(), [Validators.required]],
    end_date: [new Date(), [Validators.required]],
  });

  advanceSearchForm: FormGroup = this.fb.group({
    shipment_status: [[]],
    payment_type: [[]],
    product_type: [[]],
    is_select_all: [false],
  });

  ngOnInit() {
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.data = en.data;
      }
      else if (localStorage.getItem("language") == "my") {
        this.data = bm.data;
      }
      this.assignLanguageLabel();
    })
    this.fetchLinkedAccountUser();
  }

  isMobile(): boolean {
    return this.commonService.checkIfMobile();
  }

  fetchLinkedAccountUser(){
    this.authToken= 'Bearer ' + localStorage.getItem('authToken');
    this.commonService.fetchLinkedAccountUser('account', 'list',this.authToken).subscribe({
      next:(res: any)=>{
  this.accountList=res?.data?.accounts
      }
    })
  }
  assignLanguageLabel(){
    this.shipmentStatus = [
      { value: 'pickup-requested', viewValue: this.data.report.pickup_requested },
      { value: 'pickup-rescheduled', viewValue: this.data.report.pickup_rescheduled },
      { value: 'droppedoff', viewValue: this.data.report.droppedoff },
      { value: 'picked-up', viewValue:  this.data.report.picked_up },
      { value: 'in-transit', viewValue: this.data.report.in_transit },
      { value: 'out-for-delivery', viewValue: this.data.report.out_for_delivery },
      { value: 'delivered', viewValue: this.data.report.delivered },
      { value: 'returned', viewValue: this.data.report.returned },
      { value: 'failed', viewValue: this.data.report.failed },
    ];
  };

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateActions();
    this.isMobile();

    if (this.myInputRef && this.showSearch) {
      this.getSearchPosition();
    }
  }

  getSearchPosition() {
    if (this.myInputRef) {
      const inputWidth = this.myInputRef.nativeElement.clientWidth;

      const myElement :any = document.getElementById("searchInput");
      const leftPosition = myElement.offsetLeft;

      this.searchStyle = {
        'width': (inputWidth-50) + 'px',
        'left': (leftPosition+18) + 'px',
      };
    }
  }

  selectAll(event: any) {
    if (event.checked) {
      this.advanceSearchForm.patchValue({
        shipment_status: this.shipmentStatus,
        payment_type: this.paymentType,
        product_type: this.product,
      });
    } else {
      this.advanceSearchForm.reset();
      this.advanceSearchDateForm.reset();
      this.advanceSearchDateForm.patchValue({
        start_date: new Date(),
        end_date: new Date(),
      });
    }
  }

  submit() {
    const obj = {
      start_date: this.start_date || this.formatDate(this.advanceSearchDateForm.getRawValue()?.start_date),
      end_date: this.end_date || this.formatDate(this.advanceSearchDateForm.getRawValue()?.end_date),
      shipment_status: this.getValuesFromForm('shipment_status'),
      payment_type: this.getValuesFromForm('payment_type'),
      product_type: this.getValuesFromForm('product_type'),
      is_select_all: this.advanceSearchForm.getRawValue()?.is_select_all,
    };
    const params = {
      start_date: this.start_date,
      end_date: this.end_date,
      payment_type: this.paymentType,
      shipment_status: this.shipmentStatus,
      product_type: this.product
    };
    // Update the global search parameters in CommonService
    this.commonService.updateGlobalSearchParams(params);
    this.showSearch = false;
    this.loginService.globalSearch.next(obj);
    this.advanceSearchForm.reset();
    this.advanceSearchDateForm.reset();
    this.start_date = ''
    this.end_date = ''
    this.advanceSearchDateForm.patchValue({
      start_date: new Date(),
      end_date: new Date(),
    });
    this.router.navigate(['my-shipment'], {
      queryParams: {
        t: 'all',
      },
    });
    this.commonService.resetPageSize();
    // this.commonService.pageSize$.subscribe((size) => {
    //   this.pageSize = size;
    // });
  }
  private formatDate(date: string) {
    return moment(date).format('yyyy-MM-DDTHH:mm:ss') + 'Z';
  }

  private getValuesFromForm(fieldName: string) {
    return (this.advanceSearchForm.getRawValue()?.[fieldName] || [])
      .map((x: any) => x.value)
      .toString();
  }
  reset() {
    this.advanceSearchForm.reset();
    this.start_date = '';
    this.end_date = '';
    this.advanceSearchDateForm.patchValue({
      start_date: new Date(),
      end_date: new Date(),
    });
  }

  onDateRangePickerFormChange(event: any) {
    if (event) {
      this.start_date = moment(event.start_date).startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      this.end_date = moment(event.end_date).endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
    } else {
      this.start_date = '';
      this.end_date = '';
    }
  }

  onSelectChange(value: any, control: any) {
    console.log(value, control);
  }

  updateActions() {
    this.showGlobalSearchBar = this.commonService.checkIfMobile();
  }

  onEnter(event: any) {
    if (event.target.value && event.target.value.length > 0) {
      this.loginService.globalSearch.next({ keyword: event.target.value });
    }
    this.router.navigate(['my-shipment'], {
      queryParams: {
        t: 'all',
      },
    });
    const eventDetails = {
      event: 'view_search_results',
      event_category: 'SendParcel Pro - My Shipments - All',
      event_action: 'View Search Results',
      event_label: `Search Results - ${this.search}`,
    };
    this.commonService.googleEventPush(eventDetails);
  }

  tracking() {
    this.commonService.googleEventPush({
      event: 'go_to_home',
      event_category: 'SendParcel Pro - Dashboard',
      event_action: 'Go To Home',
      event_label: 'Home - Dashboard',
    });
  }

  trackingSearch() {
    this.commonService.googleEventPush({
      event: 'begin_search',
      event_category: 'SendParcel Pro - Dashboard',
      event_action: 'Begin Search',
      event_label: 'Search',
    });
  }

  trackingProfile() {
    this.commonService.googleEventPush({
      "event": "top_menu",
      "event_category": "SendParcel Pro - Menu",
      "event_action": "Click Top Menu",
      "event_label": "My Profile"
      });
  }

  handleLogout() {
    this.commonService.googleEventPush({
      "event": "top_menu",
      "event_category": "SendParcel Pro - Menu",
      "event_action": "Click Top Menu",
      "event_label": "Log Out"
    });

    // get sidebar active status from local storage
    const sidebarActive = localStorage.getItem('sidebarActive') ?? 'false';

    this.commonService.logout().subscribe({
      next: (resp:any) => {
        localStorage.clear();
        // set sidebar active status to local storage
        localStorage.setItem('sidebarActive', sidebarActive);
        this.loginFacade.logout();
        this.router.navigate(['auth', 'login']);
      },
      error: (err:any) => {
        localStorage.clear();
        // set sidebar active status to local storage
        localStorage.setItem('sidebarActive', sidebarActive);
        this.loginFacade.logout();
        this.router.navigate(['auth', 'login']);
      },
    });
  }
  openDialog(): void {
    this.dialog.open(AccountAccessComponent, {
      minWidth: '40%',
      height:'390px',
      data: { accounts:this.accountList, showViewAccountButton: true  }
    });
  }

  changeLanguage(){
    localStorage.setItem("language",this.selectedLanguage.value)
    this.translate.emitButtonClick();
  }
}
