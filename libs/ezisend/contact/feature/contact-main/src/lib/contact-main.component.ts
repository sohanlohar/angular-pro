import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ViewChild } from '@angular/core';
import { IContact } from '@pos/ezisend/contact/data-access/models';
import { ContactService } from '@pos/ezisend/contact/data-access/services';
import {
  ActionColor,
  DashboardTileAction,
} from '@pos/ezisend/dashboard/data-access/models';
import {
  BreadcrumbItem,
  IResponse,
} from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';
import { ContactTableComponent } from 'libs/ezisend/contact/ui/contact-table/src/lib/contact-table.component';

@Component({
  selector: 'pos-contact-main',
  templateUrl: './contact-main.component.html',
  styleUrls: ['./contact-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ContactMainComponent implements OnInit, OnDestroy {
  @ViewChild(ContactTableComponent) contactTable:any;
  totalContacts = 0;
  pageSize = 10;
  currentPage = 1;
  hasChange = true;
  data: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.contact :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.contact :
    en.data.contact;
  searchValue = '';
  protected _onDestroy = new Subject<void>();

  contactList$: Observable<IResponse<IContact>> | undefined;

  actionTiles: DashboardTileAction = {
    mainTitle: this.data.create_contact,
    title: this.data.sort_all_contact,
    copy: '',
    actions: [
      {
        title: this.data.create_new_contact,
        routerLink: ['/contact/create'],
        color: ActionColor.PRIMARY,
      },
      {
        title: 'Bulk Upload',
        routerLink: ['/contact/bulk-upload'],
        color: ActionColor.NONE,
      },
    ],
    size: 'l',
  };
  

  breadcrumbItems: BreadcrumbItem[] = [
    {
      title: this.data.home,
      routerLink: [''],
      external: false,
      current: false,
    },
    {
      title: this.data.contact,
      external: false,
      current: true,
    },
  ];
  
  constructor(
    private _contactServices: ContactService,
    private commonService: CommonService,
    private translate: TranslationService
  ) {
    this.assignLanguageLabel();
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.data = en.data.contact
      }
      else if (localStorage.getItem("language") == "my") {
        this.data = bm.data.contact
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
        title: this.data.contact,
        external: false,
        current: true,
      },
    ];

    this.actionTiles = {
      mainTitle: this.data.create_contact,
      title: this.data.sort_all_contact,
      copy: '',
      actions: [
        {
          title: this.data.create_new_contact,
          routerLink: ['/contact/create'],
          color: ActionColor.PRIMARY,
        },
        {
          title: this.data.bulk_upload,
          routerLink: ['/contact/bulk-upload'],
          color: ActionColor.NONE,
        },
      ],
      size: 'l',
    };

    // this.breadcrumbItems[0].title = this.data.home;
    // this.breadcrumbItems[1].title = this.data.contact;
    // this.actionTiles.actions[0].title = this.data.create_new_contact;
    // this.actionTiles.mainTitle = this.data.create_contact;
    // this.actionTiles.title = this.data.sort_all_contact;
  }

  ngOnInit(): void {
    this.getContacts();
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  getContacts() {
    
    this.contactList$ = this._contactServices.fetchContacts(
      this.currentPage,
      this.pageSize,
      this.searchValue
    );
  }

  onSearchEvent(search: string) {
    this.commonService.googleEventPush({
      "event": "search_contact",
      "event_category": "SendParcel Pro - Contact",
      "event_action": "Search Contact",
      "event_label": "Contact - "+search
    });

    if (search && search === '') {
      this.getContacts();
      return;
    }

    this.searchValue = search;
    this.currentPage = 1;
    this.getContacts();
  }

  onDeleteIdsEvent(ids: number[]) {
    this.commonService.isLoading(true);
    this._contactServices
      .deleteContacts(ids)
      .pipe(
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next:() => {
          this.commonService.isLoading(true);
          this.contactList$?.pipe(takeUntil(this._onDestroy)).subscribe((data) => {
            this.contactTable.dataTable.data = data.data.contacts;
            this.contactTable.total = data.data.total;
            this.commonService.isLoading(false);
          });
        },
        error:()=>{
          this.commonService.isLoading(false);
          this.commonService.openErrorDialog();
        }
      });
  }

  onPageEvent(event: { currentPage: number; pageSize: number }) {
    
    this.currentPage = event.currentPage;
    this.pageSize = event.pageSize;
    this.getContacts();
  }
}
