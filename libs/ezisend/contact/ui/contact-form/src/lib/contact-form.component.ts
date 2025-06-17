import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  OnDestroy,AfterViewInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Contact } from '@pos/ezisend/contact/data-access/models';
import {
  ICity,
  IResponse,
  IState,
} from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { validatePostcode } from '@pos/ezisend/shipment/data-access/helper/my-shipment-helper';
import { FormControlValidators } from 'libs/ezisend/shared/data-access/validators/form-control-validators/src/lib/form-control-validators';
import { EMPTY, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormComponent implements OnInit, OnChanges, OnDestroy {
  countryList$!: Observable<any>;
  states!: IResponse<IState[]>;
  cities!: IResponse<ICity[]>;
  stateSelected: any;
  citySelected: any;
  isPopulatingStateCity = false;
  protected _onDestroy = new Subject<void>();

  languageForm: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.form_data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.form_data :
    en.data.form_data;

  @Input() contactDetails: Contact = {
    id: 123,
    person: '',
    company_name: '',
    mobile: '',
    dialing_code: '',
    email: '',
    address: '',
    postcode: '',
    city: '',
    state: '',
    country: '',
  };
  @Input() setPhone = '';

  @Output() contactFormStatus = new EventEmitter<any>();
  @Output() formSubmit = new EventEmitter<any>();

  contactForm: FormGroup = this.fb.group({
    person: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
    company_name: ['', [Validators.minLength(5), Validators.maxLength(50)]],
    mobile: this.fb.group({
      dialCode: [''],
      phone: [''],
      countryCode: [''],
    }),
    // dialing_code: [0, [Validators.required]],
    email: [
      '',
      [
        Validators.pattern(this.commonService.emailOnly),
        Validators.minLength(3),
        Validators.maxLength(50),
      ],
    ],
    address: [
      '',
      [Validators.required, Validators.minLength(5), Validators.maxLength(200)],
    ],
    postcode: [
      '',
      [Validators.required, Validators.minLength(4), Validators.maxLength(10)],
    ],
    city: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
    state: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
    country: this.fb.group({
      name: [''],
      countryCode: [''],
    }),
  });

  constructor(private fb: FormBuilder, public commonService: CommonService, private cdr: ChangeDetectorRef,public translate: TranslationService,private router: Router) {

    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageForm = en.data.form_data
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageForm = bm.data.form_data
      }
      this.cdr.markForCheck();
    })
  }


  ngOnInit(){
  this.resetTypeFormFieldCuntryCityState();
    this.commonService.getCountryIsMY(true);
          this.getCountryAndStateList();
    this.updateFieldPostcodeStateCity();
    setTimeout(async() => {
    await this.trigger();
    }, 2000);
      }

  trigger(){
      this.contactForm.patchValue(this.contactDetails);
      this.onCreateGroupFormValueChange();
    this.commonService.getCurrentIsCountryMY$.subscribe((isMY: boolean) => {
            /* to reset custom postcode field validator */
      if(isMY) {
        this.contactForm.get('postcode')?.setValidators(null);
        this.contactForm.get('postcode')?.setValidators([Validators.required, Validators.minLength(5), Validators.pattern(this.commonService.numericOnly)]);
      } else {
        this.contactForm.get('postcode')?.setValidators(null);
        this.contactForm.get('postcode')?.setValidators([Validators.required, Validators.minLength(3), Validators.pattern(this.commonService.alphaOnly)]);
      }

      this.contactForm.get('postcode')?.updateValueAndValidity();
      return isMY;
    });

    this.contactForm
      .get('postcode')
      ?.valueChanges.pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.contactForm.get('postcode')?.setValidators(null);
        this.contactForm
          .get('postcode')
          ?.setValidators([
            Validators.required,
            Validators.minLength(5),
            Validators.pattern(this.commonService.numericOnly),
          ]);
      });

    this.contactForm
      .get('country')
      ?.valueChanges.pipe(takeUntil(this._onDestroy))
      .subscribe((data) => {
        if (data.name.code === 'MY') {
          this.contactForm
            .get('postcode')
            ?.valueChanges.pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.contactForm.get('postcode')?.setValidators(null);
              this.contactForm
                .get('postcode')
                ?.setValidators([
                  Validators.required,
                  Validators.minLength(5),
                  Validators.pattern(this.commonService.numericOnly),
                ]);
            });
        } else if (data.name.code !== 'MY') {
          this.contactForm
            .get('postcode')
            ?.valueChanges.pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.contactForm.get('postcode')?.setValidators(null);
              this.contactForm
                .get('postcode')
                ?.setValidators([
                  Validators.required,
                  Validators.minLength(3),
                  Validators.pattern(this.commonService.alphaOnly),
                ]);
            });
        }
      });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['contactDetails']) {
      this.contactDetails = changes['contactDetails'].currentValue;
            this.contactForm.patchValue(this.contactDetails);

      (this.contactDetails && this.contactDetails.country === 'MY')
        ? this.commonService.getCountryIsMY(true)
        : this.commonService.getCountryIsMY(false);

      this.stateSelected = this.states?.data.find(state => state.state_name === this.contactDetails.state);
      if (this.stateSelected) {
        this.getCitiesByState(this.stateSelected);
      }
    }
      }

  resetTypeFormFieldCuntryCityState() {
    this.commonService.isLocalCountryMY
      ? this.commonService.getCountryValue({
          data: 'Malaysia',
          isParcel: false,
        })
      : this.commonService.getCountryValue({ data: '', isParcel: false });
  }

  updateFieldPostcodeStateCity() {
    this.commonService.getCurrentCountry$
    .pipe(
      tap((data:any) => {

        if (!data.isParcel) {
          if (data.data === this.commonService.defaultCountry) {
            this.commonService.getCountryIsMY(true);
            this.contactForm.controls['postcode'].setValue(null);
          } else {
            this.commonService.getCountryIsMY(false);
            this.contactForm.controls['state'].setValue(null);
            this.contactForm.controls['postcode'].setValue(null);
            this.contactForm.controls['city'].setValue(null);
          }
        }
      }),
      takeUntil(this._onDestroy)
    )
    .subscribe();
  }

  getCountryAndStateList() {
        this.countryList$ = this.commonService.getAPI('countries', 'list', 0);
    const getStates = this.commonService.getAPI('states', 'query?country=MY');
    const getIsCurrentCuntryMY = this.commonService.getCurrentCountry$;

    getIsCurrentCuntryMY
      .pipe(
        switchMap((isMY: boolean) => (isMY ? getStates : EMPTY)),
        takeUntil(this._onDestroy),
        tap((states: any) => (this.states = states))
      )
      .subscribe();
  }

  getCitiesByState(data: any) {
    const getCity$ = this.commonService.getAPI(
      'cities',
      `query?country=MY&state=${data.state_code}`
    );
        getCity$.pipe(tap((cities: any) => {
      this.cities = cities;
      this.citySelected = this.cities.data.find(city => city.city_name?.trim()?.toLowerCase() === this.contactDetails.city?.trim()?.toLowerCase());
      this.cdr.markForCheck();
    }),
    takeUntil(this._onDestroy)
    ).subscribe();
  }

  getValidPostcode(postcode: any) {
        postcode = FormControlValidators.trimDomesticPostcode(postcode);
    if (this.contactForm.get('country')?.value.name.code !== 'MY') {
      return
    }
    if (this.contactForm.get('country')?.value.name.code === 'MY' && postcode?.length > 5){
      this.contactForm.get('postcode')?.setValidators([
        Validators.required,
        Validators.maxLength(5),
        Validators.pattern(this.commonService.numericOnly)
      ]);
      return
    }
    if (postcode.length >= 5) {
      const getCitiesByPostcode$ = this.commonService.getAPI(
        'cities',
        'querybypostcode?country=MY&postcode=' + postcode
      );
      getCitiesByPostcode$
        .pipe(
          tap((val: any) => {
            if (val?.data?.length) {
              const state_index = this.states?.data
                .map((e: any) => e.state_code)
                .indexOf(val?.data[0]?.state_code);
              this.contactForm.controls['state'].setValue(
                this.states.data[state_index]
              );
              this.getCitiesByState(this.states?.data[state_index]);
              this.selectCity(val);
              this.contactForm.get('postcode')?.setValidators(null);
            } else {
              this.contactForm.controls['state'].setValue(null);;
              this.contactForm.controls['city'].setValue(null);
              this.contactForm.get('postcode')?.setValidators(validatePostcode);
            }
            this.contactForm.get('postcode')?.updateValueAndValidity();
          }),
          takeUntil(this._onDestroy)
        )
        .subscribe();
    }
  }

  selectCity(val: any) {
    const getCity$ = this.commonService.getAPI(
      'cities',
      'query?country=MY&state=' + val.data[0].state_code
    );
    getCity$
      .pipe(
        tap((data: any) => {
          if (data?.data?.length) {
            const city_index = data?.data
              .map((e: any) => e?.city_name?.trim()?.toLowerCase())
              .indexOf(val?.data[0]?.city_name?.trim()?.toLowerCase());
            setTimeout(() => {
              this.contactForm.controls['city'].setValue(
                this.cities?.data[city_index]
              );
            }, 500);
          } else {
            this.contactForm.controls['city'].setValue(null);
          }
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe();
  }

  onCreateGroupFormValueChange() {
    this.contactForm.valueChanges.subscribe(() =>
      this.contactFormStatus.emit(this.contactForm)
    );
  }

  onSubmit() {
    // Checking if the current URL contains "create" or "details"
    const isUpdate = this.router.url.includes('details'); // true for update, false for create
  
    // Hash phone and email values
    const hashedPhone = this.commonService.convertToHashSHA256(this.contactForm.value.mobile.phone || '');
    const hashedEmail = this.commonService.convertToHashSHA256(this.contactForm.value.email || '');
    if (isUpdate) {
      const eventDetails = {
        event: "update_contact",
        event_category: "SendParcel Pro - Contact",
        event_action: "Update Contact",
        event_label: "Contact",
        hash_phone: hashedPhone,
        hash_email: hashedEmail,
        postcode: this.contactForm.value.postcode,
        city: this.contactForm?.value?.city?.name?.city,
        country: this.contactForm?.value?.country?.name?.country,
      };
      this.commonService.googleEventPush(eventDetails);
    }
  
    // Emit the form value for further processing
    this.formSubmit.emit(this.contactForm.value);
  }

  errorHandler(field: string, val: string) {
    return this.contactForm.controls[field].hasError(val);
  }
}
