import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  NG_VALIDATORS,
  AbstractControl,
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  filter,
  finalize,
  interval,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { validatePostcode } from '@pos/ezisend/shipment/data-access/helper/my-shipment-helper';
import { FormControlValidators } from '@pos/ezisend/shared/data-access/validators/form-control-validators';
import { MatTabGroup } from '@angular/material/tabs';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';

export interface User {
  name: string;
}
@Component({
  selector: 'pos-recipient-detail-form',
  templateUrl: './recipient-detail-form.component.html',
  styleUrls: ['./recipient-detail-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RecipientDetailFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RecipientDetailFormComponent),
      multi: true,
    },
  ],
})

export class RecipientDetailFormComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @Output() rtsSenderDataChange = new EventEmitter<any>(); // New Output for RTS sender data
  @Output() nextClicked: EventEmitter<any> = new EventEmitter();
  @Output() ChangeStepEvent = new EventEmitter<boolean>();
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  @Input() isEditOrder = false;
    protected _onDestroy = new Subject<void>();
  countryList$!: Observable<any>;
  getState: any;
  getCities: any;
  getState$!: Observable<any>;
  getCity$!: Observable<any>;
  getCitiesByPostcode$!: Observable<any>;
  isLoading = false;
  filteredContacts: any = [];
  filteredOptions: string[] = [];
@Input() isReturnOrder =  false;
  errorMsg: string | undefined;
  recipientForm: FormGroup = this.fb.group({
    searchContacts: [''],
    recipientName: ['', Validators.required],
    tel: ['', Validators.required],
    companyName: [''],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    country: ['', Validators.required],
    postcode: ['', [Validators.required]],
    email: [
      '',
      [Validators.pattern(this.commonService.emailOnly)],
    ],
    saveAsContacts: [''],
  });
  recipientDetail: any;
  isPopulatingStateCity = false;
  phonePatchFromSmartInput = false;
  private inputSubject: Subject<string> = new Subject<string>();

  languageObj: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
    en.data;

  languageData: any;
  languageForm: any;

  isSingleState: boolean = true;
  
  constructor(
    private fb: FormBuilder,
    public commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private translate: TranslationService,
    private snackBar: MatSnackBar
  ) {
    this.assignLanguageLabels();
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageObj = en.data
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageObj = bm.data
      }
      this.assignLanguageLabels();
    })
    
    this.inputSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((inputValue: string) => { 
        return inputValue.length >= 3
         ? this.commonService.fetchList('contacts',`address/search?query=${inputValue}`)
         : of();
    }) 
    ).subscribe(data => {
      this.cdr.markForCheck();
      this.filteredOptions = data.data;
    });
  }

  assignLanguageLabels() {
    this.languageData = this.languageObj['recipientDetail'];
    this.languageForm = this.languageObj['form_data'];
  }

  pinCode: any 
  ngOnInit() {
    this.handleInputField()

    // Adjust debounce duration based on context
    const debounceDuration = this.isReturnOrder ? 100 : 500;

    // any time the inner form changes update the parent of any change
    this.recipientForm.valueChanges
      .pipe(takeUntil(this._onDestroy), debounceTime(debounceDuration))
      .subscribe((value) => {
        this.onChange(value);
        this.onTouched();
        this.moveToRecipient();
        if (this.isEditOrder || this.isReturnOrder) {
          this.saveRecipient();
        }
      });

    this.countryList$ = this.commonService.countryList$;
    this.getState$ = this.commonService.getAPI('states', 'query?country=MY', 0);
    this.resetTypeFormFieldCuntryCityState();
    
    this.getState$
      .pipe(
        takeUntil(this._onDestroy),
              tap((val) => {this.getState = val.data;}),
        exhaustMap(() => this.commonService.getRecipientDetail$.pipe(takeUntil(this._onDestroy)))
      )
      .subscribe((recipientDetail) => {
        if ((this.isEditOrder || this.isReturnOrder)  && recipientDetail) {
          this.patchRecipientForm(recipientDetail);
          this.recipientDetail = recipientDetail;
          this.pinCode = this.recipientDetail?.postcode;
        }
      });

    this.recipientForm.statusChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => this.commonService.recipientForm.next(this.recipientForm.valid));

    this.commonService.getCurrentCountry$
      .pipe(
        takeUntil(this._onDestroy),
        tap((data:any) => {
                    if (data.isParcel !== true) {
              if (data.data === this.commonService.defaultCountry) {
              this.commonService.getCountryIsMY(true);
                          } else {
              this.commonService.getCountryIsMY(false);
              if (this.isEditOrder || this.isReturnOrder) {
                return;
              }
              this.recipientForm.controls['state'].setValue(null);
              this.recipientForm.controls['postcode'].setValue(null);
              this.recipientForm.controls['city'].setValue(null);
            }
          }
        })
      )
      .subscribe();

    this.recipientForm.controls['searchContacts'].valueChanges
      .pipe(
        takeUntil(this._onDestroy),
        startWith(''),
        map((value) =>
          typeof value === 'string' ? value : value?.company_name
        ),
        distinctUntilChanged(),
        tap(() => {
          this.errorMsg = '';
          this.filteredContacts = [];
        }),
        filter((value) => value.length >= 3),
        tap(() => (this.isLoading = true)),
        // debounceTime(500),
        switchMap((value) =>
          this.filterRecipients(value).pipe(
            takeUntil(this._onDestroy),
            finalize(() => this.cdr.markForCheck())
          )
        )
      )
      .subscribe({
        next: (contacts) => {
          this.filteredContacts = contacts ?? [];
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMsg = error?.error?.message || this.languageData.search_contact_error_message;
          this.isLoading = false;
        },
      });

      this.commonService.getCurrentIsCountryMY$.subscribe((isMY:boolean) => {
        /* to reset custom postcode field validator */
        if(isMY) {
          this.recipientForm.get('postcode')?.setValidators(null);
          this.recipientForm.get('postcode')?.setValidators([Validators.required, Validators.pattern(this.commonService.numericOnly)]);
        } else {
          this.recipientForm.get('postcode')?.setValidators(null);
          this.recipientForm.get('postcode')?.setValidators([Validators.required, Validators.pattern(this.commonService.alphaOnly)]);
        }
        this.recipientForm.get('postcode')?.updateValueAndValidity();
        return isMY;
      })
        }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  handleInputField() {
    if (this.isReturnOrder) {
      const controlNames = ['recipientName', 'email', 'address', 'postcode', 'city'];
      controlNames.forEach(controlName => {
        const control = this.recipientForm.get(controlName);
        if (control && (typeof control.value !== 'string' || !control.value.trim())) {
          control?.markAsTouched();
        }
      });
    }
  }
  
  private patchRecipientForm(recipientDetail: any) {
    // Ensure recipientDetail is not null or undefined before proceeding
    if (!recipientDetail) {
      console.warn('[RecipientDetailFormComponent] patchRecipientForm called with null or undefined recipientDetail.');
      return;
    }

    if (recipientDetail.country === 'MY' && !this.isEditOrder && !this.isReturnOrder) { // Keep this condition if it's specific to non-edit/non-return MY scenarios
            this.getValidPostcode(recipientDetail.postcode);
    }
    const existingData = {
      recipientName: recipientDetail.name,
      companyName: recipientDetail.company_name,
      email: recipientDetail.email?.toLowerCase(),
      address: recipientDetail.address,
      postcode: recipientDetail.postcode,
      state: recipientDetail.state,
      city: recipientDetail.city,
    };
    this.recipientForm.patchValue(existingData);
    this.cdr.markForCheck();
  } // Ensure this method is closed correctly

  onInputChange(event: any) {
    const inputValue = event.target.value;
    // Emit the input value to the inputSubject
    this.inputSubject.next(inputValue);
  }

  private filterRecipients(value: string) {
    if(value.includes(' ')) value = value.split(' ').join('%20')

    return this.commonService
      .fetchList('contacts', 'search?page=1&limit=10&keyword=' + value)
      .pipe(
        map((response) => response.data),
        map((data) => data.contacts)
      );
  }

  displayContact(contact: any) {
    return contact && contact.company_name ? contact.company_name : '';
  }


  onClickNextButton() {
    // When the "Next" button is clicked, emit the event to move to the "Recipient" tab
    this.nextClicked.emit();
    // next()
  }
  getSearchTerm() {
    let searchTerm = '';
    const searchControl = this.recipientForm.get('searchContacts');
    if (searchControl) {
      searchTerm =
        typeof searchControl.value === 'string'
          ? searchControl.value
          : searchControl.value?.company_name;
    }
    return searchTerm ? searchTerm?.trim() : '';
  }

  resetTypeFormFieldCuntryCityState() {
    this.commonService.isLocalCountryMY
      ? this.commonService.getCountryValue({
          data: 'Malaysia',
          isParcel: false,
        })
      : this.commonService.getCountryValue({ data: '', isParcel: false });
  }

  getCitiesByState(val: any, isCity?: any) {
        this.getCity$ = this.commonService.getAPI(
      'cities',
      'query?country=MY&state=' + val.state_code,
      0
    );
    this.getCity$
    .pipe(takeUntil(this._onDestroy))
    .subscribe((val) => {
this.getCities = val.data;
      this.cdr.markForCheck();
          });
  }

  getValidPostcode(postcode: any) {
        if(postcode == null || !postcode){
      postcode = this.pinCode
    }
    postcode = FormControlValidators.trimDomesticPostcode(postcode)
    if (!this.isEditOrder && !this.isReturnOrder) {
      if (this.recipientForm.get('country')?.value?.name?.code !== 'MY') return;
      if (
        this.recipientForm.get('country')?.value?.name?.code === 'MY' &&
        postcode?.length > 5
      ) {
        this.recipientForm
          .get('postcode')
          ?.setValidators([
            Validators.required,
            Validators.maxLength(5),
            Validators.pattern(this.commonService.numericOnly),
          ]);
        return;
      }
    }
    if (postcode?.length >= 5) {
      this.isPopulatingStateCity = true;
      this.getCitiesByPostcode$ = this.commonService.getAPI(
        'cities',
        'querybypostcode?country=MY&postcode=' + postcode
      );
      this.getCitiesByPostcode$
        .pipe(
          takeUntil(this._onDestroy),
          finalize(() => this.cdr.markForCheck())
        )
        .subscribe({
          next: (val) => {
            if (val?.data?.length) {
              this.isSingleState = val?.data?.length > 1 ? false : true;
              const state_index = this.getState
                .map((e: any) => e.state_code)
                .indexOf(val?.data[0]?.state_code);
              this.recipientForm.controls['state'].setValue(
                this.getState[state_index]
              );
              this.getCitiesByState(this.getState[state_index]);
              this.selectCity(val);
              this.recipientForm.get('postcode')?.setValidators(null);
              this.recipientForm.get('postcode')?.setValidators([
                Validators.required,
                Validators.minLength(5),
                Validators.pattern(this.commonService.numericOnly)
              ]);
            } else {
              this.isPopulatingStateCity = false;
              this.recipientForm.controls['state'].setValue(null);
              this.recipientForm.controls['city'].setValue(null);
              this.recipientForm.get('postcode')?.setValidators(null);
              this.recipientForm.get('postcode')?.setValidators([
                Validators.required,
                Validators.minLength(5),
                Validators.pattern(this.commonService.numericOnly),
                validatePostcode
              ]);
              this.recipientForm.markAllAsTouched();
            }
            this.recipientForm.get('postcode')?.updateValueAndValidity();
          },
          error: () => (this.isPopulatingStateCity = false),
        });
    }
  }

  selectCity(val: any) {
    this.getCity$.pipe(takeUntil(this._onDestroy)).subscribe({
      next: (data: any) => {
        if (data?.data?.length) {
          const city_index = data?.data
            .map((e: any) => e?.city_name?.trim()?.toLowerCase())
            .indexOf(val?.data[0]?.city_name?.trim()?.toLowerCase());
          setTimeout(() => {
            this.recipientForm.controls['city'].setValue(
              this.getCities[city_index]
            );
            this.isPopulatingStateCity = false;
          }, 500);
        } else {
          this.recipientForm.controls['city'].setValue(null);
        }
      },
      error: () => (this.isPopulatingStateCity = false),
    });
  }

  onContactOption(event: MatAutocompleteSelectedEvent) {
    const selectedOption = event.option.value;
    if(selectedOption) {
      const address =
        `${selectedOption.address1} ${selectedOption.address2} ${selectedOption.address3} ${selectedOption.address4}`;
  
      // Instead of setting directly, prepare the data and let valueChanges/event handle it
      const contactDataForPatch = {
        ...selectedOption,
        phone_no: selectedOption.mobile, // Map mobile to phone_no for consistency
        name: selectedOption.contact_person, // Map contact_person to name
        address: address,
        // Add other fields as needed to match the structure expected by patchRecipientForm or valueChanges
      };
  
      this.recipientDetail = {
        dialing_code: selectedOption.dialing_code,
        phone_no: selectedOption.mobile
      }
  
      this.commonService.contactOptionSelected.next(selectedOption.country);
      if(this.recipientForm?.value?.country?.name?.code === 'MY' && selectedOption?.country === 'MY') {
              this.getValidPostcode(selectedOption.postcode);
      }
  
      const formPatchData = {
        recipientName: selectedOption.contact_person,
        companyName: selectedOption.company_name,
        tel: {
          ...this.recipientForm.controls['tel'].value,
          phone: selectedOption.mobile,
        },
        email: selectedOption.email,
        address: address,
        country: {
          ...this.recipientForm.controls['country'].value,
          countryCode: selectedOption.country,
        },
        postcode: selectedOption.postcode,
        state: selectedOption.state,
        city: selectedOption.city,
      };
  
      this.recipientForm.patchValue(formPatchData, { emitEvent: false });
      if (
        this.recipientForm.value &&
        this.recipientForm.value.country.countryCode === 'MY'
      ) {
        this.commonService.getCountryIsMY(true);
      } else {
        this.commonService.getCountryIsMY(false);
      }
    }
  }

  onAddressOption(event: MatAutocompleteSelectedEvent){
    const addressParts = event.option.value.split(',').slice(0, -4);
    const formattedAddress = addressParts.join(', ');
    const patchAddress = event.option.value.split(',').slice(-4);

    const selected = {
      address: formattedAddress,
      postcode: patchAddress[0].trim(),
    };

    this.recipientForm.patchValue(selected);
  }

  onChange: any = () => {
    //
  };

  onTouched: any = () => {
    //
  };

  errorHandler(field: string, val: string) {
    return this.recipientForm.controls[field].hasError(val);
  }
  selectedIndex:any;
  
  showRecipientTab:any;

  validateSenderPostCode(){
    let pickUpDetails = this.commonService.getSelectedPickUpDetails();

    if(pickUpDetails.postcode?.length >= 5) {
      // this.isPopulatingStateCity = true;
      this.getCitiesByPostcode$ = this.commonService.getAPI(
        'cities',
        'querybypostcode?country=MY&postcode=' + pickUpDetails.postcode
      );
      this.getCitiesByPostcode$
        .pipe(
          takeUntil(this._onDestroy),
          finalize(() => this.cdr.markForCheck())
        )
        .subscribe({
          next: (val) => {
            if (!val?.data?.length) {
              this.showError(this.languageData?.invalid_sender_postcode)
            }
            else {
              this.saveRecipient();
            }
          }
        });
    }
    else{
      this.showError(this.languageData?.invalid_sender_postcode)
    }
  // Replace 'my' with 'Malaysia' in country field
  const changeCountryName = 
  typeof this.recipientForm.value?.country === 'string' && this.recipientForm.value?.country.toLowerCase() === 'my' 
    ? 'Malaysia' 
    : this.recipientForm.value?.country;
  // moved search_contact here and calling with submit_recipient_details on calling next button as per PDF slide # 56 shared by khyviyan 
  const combinedEventDetails = {
    events: [
      {
        event: 'submit_recipient_details',
        event_category: 'SendParcel Pro - Single Shipments',
        event_action: 'Submit Recipient Details',
        event_label: 'Pick Up Address',
        address_type: 'Recipient Address',
        postcode: this.recipientForm.value.postcode,
        city: this.recipientForm.value.city,
        country: changeCountryName,
      },
      {
        event: 'search_contact',
        event_category: 'SendParcel Pro - Single Shipments',
        event_action: 'Begin Search Contacts',
        event_label: `Search Contacts - ` +this.recipientForm.value?.recipientName,
      },
    ],
  };
  this.commonService.googleEventPush(combinedEventDetails);
  }
  showError(message: string): void {
    this.snackBar.open(message, this.languageForm?.close, {
      duration: 5000,
      panelClass: ['snack-bar-error']
    });
  }
  saveRecipient() {
    const recipientData = {
      sender: {
        pickup_option_id: this.commonService.getSelectedPickupID(),
      },
      recipient: {
        name: this.recipientForm.value.recipientName,
        company_name: this.recipientForm.value.companyName,
        dialing_code: this.recipientForm.value.tel.dialCode?.calling_code,
        phone_no: this.recipientForm.value.tel.phone,
        email: this.recipientForm.value.email?.toLowerCase(),
        address: this.recipientForm.value.address,
        postcode: this.recipientForm.value.postcode,
        city: this.recipientForm.value.city?.city_name
          ? this.recipientForm.value.city?.city_name
          : this.recipientForm.value.city,
        state: this.recipientForm.value.state?.state_name
          ? this.recipientForm.value.state?.state_name
          : this.recipientForm.value.state,
        country: this.recipientForm.value.country.name?.code,
      },
      save_to_contact:
        this.recipientForm.value.saveAsContacts === ''
          ? false
          : this.recipientForm.value.saveAsContacts,
    };
    this.commonService.setRecipientValue(recipientData);
    
    this.ChangeStepEvent.emit(true);
  }
  
  moveToRecipient() {
    // Move to the "Recipient" tab only if the conditions are met
    // For example, when the "Next" button is clicked
    // You can add your own conditions here if needed
    const recipientData = {
      sender: {
        pickup_option_id: this.commonService.getSelectedPickupID(),
      },
      recipient: {
        name: this.recipientForm.value.recipientName,
        company_name: this.recipientForm.value.companyName,
        dialing_code: this.recipientForm.value.tel.dialCode?.calling_code,
        phone_no: this.recipientForm.value.tel.phone,
        email: this.recipientForm.value.email?.toLowerCase(),
        address: this.recipientForm.value.address,
        postcode: this.recipientForm.value.postcode,
        city: this.recipientForm.value.city?.city_name
          ? this.recipientForm.value.city?.city_name
          : this.recipientForm.value.city,
        state: this.recipientForm.value.state?.state_name
          ? this.recipientForm.value.state?.state_name
          : this.recipientForm.value.state,
        country: this.recipientForm.value.country.name?.code,
      },
      save_to_contact:
        this.recipientForm.value.saveAsContacts === ''
          ? false
          : this.recipientForm.value.saveAsContacts,
    };
    this.commonService.setRecipientValue(recipientData);
    this.selectedIndex = 1; // Index of the "Recipient" tab
    this.showRecipientTab = true; // Show the tab content
  }
  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  get value(): any {
    return this.recipientForm.value;
  }

  set value(value: any) {
    this.recipientForm.setValue(value);
    this.onChange(value);
    this.onTouched();
  }

  writeValue(value: any) {
    if (value) {
      this.value = value;
    }

    if (value === null) {
      this.recipientForm.reset();
    }
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  validate(_: FormControl) {
    return this.recipientForm.valid
      ? null
      : { recipientForm: { valid: false } };
  }

  handleNewInput(event : any){
    this.recipientForm.controls['postcode'].setValue(event.postcode);

    const existingData = {
      recipientName: event.name?.trim(),
      companyName: event.companyName?.trim(),
      email: event.email?.toLowerCase().trim(),
      address: event.address?.trim(),
      postcode: event.postcode?.trim(),
      tel: {
        ...this.recipientForm.controls['tel'].value,
        phone: event.mobile,
      }
    };
    this.commonService.googleEventPush({
      event: 'smart_fill_recipient_details',
      event_category: 'SendParcel Pro - Single Shipments',
      event_action: 'Smart Fill Recipient Details',
      event_label: 'Recipient Details',
    });
    this.recipientForm.patchValue(existingData);
    this.phonePatchFromSmartInput = true;
    this.recipientForm.markAllAsTouched();
    this.cdr.markForCheck();
  }
}
