import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Contact } from '@pos/ezisend/contact/data-access/models';
import { ContactService } from '@pos/ezisend/contact/data-access/services';
import {
  BreadcrumbItem,
  IResponse,
} from '@pos/ezisend/shared/data-access/models';
import { Subject, takeUntil, tap } from 'rxjs';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-contact-create',
  templateUrl: './contact-create.component.html',
  styleUrls: ['./contact-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactCreateComponent implements OnDestroy {
  protected _onDestroy = new Subject<void>();
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.contact :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.contact :
    en.data.contact;

  breadcrumbItems: BreadcrumbItem[] = [];

  hasChange = true;
  isSubmitting = false;

  constructor(
    public dialog: MatDialog,
    private contactService: ContactService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private translate: TranslationService,
  ) {
    this.assignLanguageLabel();

    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.contact
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.contact
      }
      this.assignLanguageLabel();
      this.cdr.detectChanges();
    })
  }

  assignLanguageLabel(){
    this.breadcrumbItems = [
      {
        title: this.languageData.shipments,
        routerLink: ['/contact'],
        external: false,
        current: false,
      },
      {
        title: this.languageData.contact,
        routerLink: ['/contact'],
        external: false,
        current: false,
      },
      {
        title: this.languageData.create__contact,
        external: false,
        current: true,  
      },
    ];
  }

  onContactFormStatus(contactFormData: FormControl<Contact>) {
    this.hasChange = !contactFormData.valid;
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
        descriptions: this.languageData.add_contact_note,
        icon: 'warning',
        confirmEvent: true,
      },
    });

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe(async (result) => {
        // Hash phone and email values
        const hashedPhone = await this.commonService.convertToHashSHA256(data.mobile || '');
        const hashedEmail = await this.commonService.convertToHashSHA256(data.email || '');
         // Replace 'my' with 'Malaysia' in country field
            const changeCountryName = 
          typeof data?.country === 'string' && data?.country.toLowerCase() === 'my' 
            ? 'Malaysia' 
            : data?.country;
        const eventDetails = {
          "event": "save_new_contact",
          "event_category": "SendParcel Pro - Contact",
          "event_action": "Save New Contact",
          "event_label": "New Contact",
          "hash_phone": hashedPhone,
          "hash_email": hashedEmail,
          "postcode": data.postcode,
          "city": data.city,
          "country": changeCountryName,          
        };
        this.commonService.googleEventPush(eventDetails)
        
        if (result) this.onSubmit(data);
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
  }

  onSubmit(data: any) {
    this.commonService.isLoading(true);
    this.isSubmitting = true;
    this.contactService
      .saveContact(data, 'add')
      .pipe(
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next:async (success: IResponse<{ id: number }>) => {
          this.commonService.isLoading(false);
          // Hash phone and email values
        const hashedPhone = await this.commonService.convertToHashSHA256(data.mobile || '');
        const hashedEmail = await this.commonService.convertToHashSHA256(data.email || '');
        // Replace 'my' with 'Malaysia' in country field
        const changeCountryName = 
        typeof data?.country === 'string' && data?.country.toLowerCase() === 'my' 
          ? 'Malaysia' 
          : data?.country;
          this.commonService.googleEventPush({
            "event": "save_new_contact_success", 
            "event_category": "SendParcel Pro - Contact", 
            "event_action": "Save New Contact Success", 
            "event_label": "Success",
            "hash_phone": hashedPhone,
            "hash_email": hashedEmail,
            "postcode": data.postcode,
            "city": data.city,
            "country": changeCountryName,          
          });

          this.commonService.redirectTo('/contact');
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error:() => {
          this.commonService.isLoading(false);
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.commonService.openErrorDialog();
        }
      });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
