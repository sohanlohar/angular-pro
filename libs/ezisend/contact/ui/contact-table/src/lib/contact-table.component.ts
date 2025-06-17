import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxChange, MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/checkbox';
import { catchError, Observable, Subject, takeUntil, tap, throwError } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Contact, IContact } from '@pos/ezisend/contact/data-access/models';
import { IResponse } from '@pos/ezisend/shared/data-access/models';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-contact-table',
  templateUrl: './contact-table.component.html',
  styleUrls: ['./contact-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    {
      provide: MAT_CHECKBOX_DEFAULT_OPTIONS,
      useValue: { color: 'primary' },
    },
  ],
})
export class ContactTableComponent implements OnChanges, OnDestroy {
  isListingLoading = false;
  searchContactStatus = false;
  isDisabledDeleteButton = true;
  searchContact = '';
  keyword = '';
  total = 0;

  @Input() contacts$: Observable<IResponse<IContact>> | undefined;
  @Input() pageSize = 100;
  @Input() currentPage = 1;
  @Output() searchEvent = new EventEmitter<string>();
  @Output() deleteIdsEvent = new EventEmitter<number[]>();
  @Output() pageEvent = new EventEmitter<{
    currentPage: number;
    pageSize: number;
  }>();

  // table definition
  // pageSizeOptions = [10, 20, 50, 100, 150, 200]; ASAL
  pageSizeOptions = [10, 20, 50, 100];
  columnsToDisplay = [
    'select',
    'contactPerson',
    'mobile',
    'email',
    'address',
    'companyName',
  ];
  dataTable = new MatTableDataSource<Contact>([]);
  selection = new SelectionModel<number>(true, []);

  contactList$: Observable<IResponse<IContact>> | undefined;
  protected _onDestroy = new Subject<void>();
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.contact :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.contact :
    en.data.contact;
  constructor(
    private commonService: CommonService,
    public dialog: MatDialog,
    private translate: TranslationService,
    private cdr: ChangeDetectorRef,) {
      this.translate.buttonClick$.subscribe(() => {
        if (localStorage.getItem("language") == "en") {
          this.languageData = en.data.contact
        }
        else if (localStorage.getItem("language") == "my") {
          this.languageData = bm.data.contact
        }
      })
    }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['contacts$']) {
      this.isListingLoading = true;
      this.contactList$ = changes['contacts$'].currentValue.pipe(
        takeUntil(this._onDestroy),
        tap((res: IResponse<IContact>) => {
          this.dataTable.data = res.data.contacts;
          this.dataTable.data.forEach((dataItem)=>{
            if(dataItem.mobile.includes('+')){
              dataItem.dialing_code="";
              dataItem.mobile=dataItem.mobile;
            }
          })
          this.total = res.data.total;
          this.isListingLoading = false;
          this.cdr.detectChanges();
        }),
          catchError((err) => {
            this.isListingLoading = false;
            this.cdr.detectChanges();
            this.dataTable.data = [];
            this.total = 0;
            return throwError(err);
          })
        )
        .subscribe({
          error:() => {
            this.commonService.openErrorDialog();
          }
        });
    }
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  searchFieldChange(event: any) {
    this.searchContact = event.target.value;
  }

  onSearchEvent(search: string) {
    this.keyword = search.trim();
    this.searchEvent.emit(this.keyword);
  }

  deleteContact() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        descriptions: `${this.languageData.would_like_to_delete} ${this.selection.selected.length} contact${this.selection.selected.length > 1? '(s)' : ''}?`,
        icon: 'warning',
        confirmEvent: true,
      },
    });

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe((result) => {
        if (result) this.onDeleteContact();
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
  }

  onDeleteContact() {
    const ids: number[] = this.selection.selected;

    this.dataTable.data = this.dataTable.data.filter(
      (contact: Contact) => !ids.includes(contact.id)
    );
    this.selection.clear();
    this.deleteIdsEvent.emit(ids);
  }

  downloadAllContact() {
    this.isListingLoading = true;
    this.commonService
      .submitData('contacts', 'download', null)
      .pipe(
        tap((response: IResponse<{ link: string }>) => {
          window.open(
            `${this.commonService.SPPAPI.replace('/api/', '')}${
              response.data.link
            }`
          )
          this.isListingLoading = false;
          this.cdr.detectChanges();
        }
        ),
        catchError((err) => {
          this.isListingLoading = false;
          this.cdr.detectChanges();
          this.dataTable.data = [];
          return throwError(err);
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        error:()=>{
          this.isListingLoading = false;
          this.cdr.detectChanges();
          this.commonService.openErrorDialog();
        }
      });
  }

  onPageEvent(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;

    this.pageEvent.emit({
      currentPage: this.currentPage,
      pageSize: this.pageSize,
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const dataTableIds = this.dataTable.data.map((data: Contact) => data.id);
    let isAllSelected = true;
    for (const id of dataTableIds) {
      if (!this.selection.selected.includes(id)) {
        isAllSelected = false;
        break;
      }
    }

    return isAllSelected;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    const dataTableIds = this.dataTable.data.map((data: Contact) => data.id);

    if (this.isAllSelected()) {
      this.selection.deselect(...dataTableIds);
      this.isDisabledDeleteButton = this.selection.selected.length
        ? false
        : true;
      return;
    }

    this.selection.select(...dataTableIds);
    this.isDisabledDeleteButton = false;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Contact): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }

    return `${this.selection.isSelected(row['id']) ? 'deselect' : 'select'} row `;
  }

  isChecked(row?: Contact) {
    if (!row) {
      return false;
    }

    return this.selection.selected.find((id) => id === row.id);
  }

  focusFunction() {
    this.searchContactStatus = true;
  }

  focusOutFunction() {
    this.searchContactStatus = false;
  }

  isListingEmpty() {
    return this.dataTable.data.length === 0 && !this.isListingLoading;
  }

  onSelectRow(event: MatCheckboxChange, row: Contact) {
    if (!event) {
      return;
    }
    this.selection.toggle(row['id']);
    this.isDisabledDeleteButton = this.selection.selected.length ? false : true;
  }
  onContactPersonClick(contactPersonName: string) {
    const eventDetails = {
      event: "view_contact_details",
      event_category: "SendParcel Pro - Contact",
      event_action: "View Contact Details",
      event_label: "Contact Person - " + contactPersonName
    };
    // Call Google Analytics event tracking method
    this.commonService.googleEventPush(eventDetails);
  }
  
}
