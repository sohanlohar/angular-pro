import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import {
  BreadcrumbItem,
  IResponse,
} from '@pos/ezisend/shared/data-access/models';
import { map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Contact } from '@pos/ezisend/contact/data-access/models';
import { FormControl } from '@angular/forms';
import { ContactService } from '@pos/ezisend/contact/data-access/services';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { CommonService } from '@pos/ezisend/shared/data-access/services';

@Component({
  selector: 'pos-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDetailsComponent implements OnDestroy, AfterViewInit {
  isButtonDisabled = true;
  contactDetails!: Contact;
  protected _onDestroy = new Subject<void>();
  contactId$ = this.activatedRoute.queryParams.pipe(
    map((param: any) => param['id'])
  );

  breadcrumbItems: BreadcrumbItem[] = [
    {
      title: 'Shipments',
      routerLink: ['/contact'],
      external: false,
      current: false,
    },
    {
      title: 'Contact',
      routerLink: ['/contact'],
      external: false,
      current: false,
    },
    {
      title: 'Contact Details',
      external: false,
      current: true,
    },
  ];

  constructor(
    public dialog: MatDialog,
    private _contactService: ContactService,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private router: Router
  ) {}

  ngAfterViewInit() {
    this.fetchSelectedContact();
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  fetchSelectedContact() {
    this.commonService.isLoading(true);
    this.contactId$
      .pipe(
        switchMap((id: number) => this._contactService.fetchContactDetail(id)),
        tap((response) => 
        {if(response){this.contactDetails = response.data.contact;}}),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next:() => {
          if(this.contactDetails){
            setTimeout(async()=>{
              await this.commonService.isLoading(false)
            },2000);
          }
        },
        error:() => {
          this.commonService.isLoading(false);
          this.commonService.openErrorDialog();
        }
      });
  }

  onContactFormSubmit(contact: Partial<Contact>) {
    const {
      person,
      email,
      company_name,
      address,
      country,
      state,
      city,
      mobile,
      postcode,
    } = contact;
    const data = {
      id: this.contactDetails.id,
      person,
      company_name,
      mobile: mobile.phone,
      dialing_code: mobile.dialCode.calling_code,
      email: email?.toLowerCase(),
      address,
      postcode,
      city: city.city_name ?? city,
      state: state.state_name ?? state,
      country: country.name.code,
    };

    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        descriptions: `Are you sure you want to make these changes?`,
        icon: 'warning',
        confirmEvent: true,
        information: 'Press Save to confirm your changes or <br> press cancel to return to the previous screen.',
        actionText: 'Save'
      },
    });

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe((result) => {
        if (result) this.onSubmit(data);
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
  }

  onSubmit(data: any) {
    this.commonService.isLoading(true);
    this._contactService
      .saveContact(data, 'edit')
      .pipe(
        takeUntil(this._onDestroy),
        tap((success: IResponse<{ id: number }>) => {
          this.router.navigate(['/contact']);
        })
      )
      .subscribe({
        next:() => {
          this.commonService.isLoading(false);
        },
        error:(err)=>{
          this.commonService.isLoading(false);
          this.commonService.openErrorDialog("",err?.error?.error?.data?.errors[0]?.message);
        }
      });
  }

  onContactFormStatus(contactFormData: FormControl<Contact>) {
    this.isButtonDisabled =
      !contactFormData.valid ||
      JSON.stringify(this.contactDetails) ===
        JSON.stringify(contactFormData.value);
  }
}
