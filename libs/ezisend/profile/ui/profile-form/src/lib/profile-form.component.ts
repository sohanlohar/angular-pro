import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ICity } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { validatePostcode } from '@pos/ezisend/shipment/data-access/helper/my-shipment-helper';
import { finalize, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { FormControlValidators } from '../../../../../shared/data-access/validators/form-control-validators/src';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileFormComponent implements OnInit, OnChanges, OnDestroy {
  countryList$!: Observable<any>;
  getState: any;
  getCities: any;
  citySelected: any;
  deleteIconDisabled = false;
  getCity$!: Observable<any>;
  isPopulatingStateCity = false;
  protected _onDestroy = new Subject<void>();

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone_no: this.fb.group({
      dialCode: ['', [Validators.required]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(this.commonService.numericOnly),
        ],
      ],
      countryCode: [''],
    }),
    nick_name: [''],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    country: this.fb.group({
      countryCode: [''],
      name: ['', Validators.required],
    }),
    postcode: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.pattern(this.commonService.emailOnly)]],
    is_default: [false],
    id: [null],
  });

  @Input() OnSubmitButton: boolean = false;
  @Input() headerLabel = '';
  @Input() isHaveDeleteAction = false;
  @Input() dataPickupAddress = this.form.value;
  @Input() isNewPickupAddress = false;
  @Input() totalPickupList = 0;
  @Output() submitForm = new EventEmitter<any>();
  @Output() deleteFormData = new EventEmitter<string>();
  languageForm: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.form_data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.form_data :
    en.data.form_data;
    
  constructor(
    private fb: FormBuilder,
    public commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private translate: TranslationService
  ) {
    this.registerMatIcon();
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageForm = en.data.form_data
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageForm = bm.data.form_data
      }
      this.cdr.markForCheck()
    })
  }

  ngOnInit() {
    this.resetTypeFormFieldCuntryCityState();
    this.fetchState();
    this.defineFormBasedOnCountry();
    this.patchPickupAddress();
    this.countryList$ = this.commonService.getAPI('countries', 'list', 0);
    this.commonService.getCurrentIsCountryMY$.subscribe((isMY: boolean) => {

      if(isMY) {
        this.form.get('postcode')?.setValidators(null);
        this.form.get('postcode')?.setValidators([Validators.required,  Validators.minLength(5), Validators.pattern(this.commonService.numericOnly)]);
      } else {
        this.form.get('postcode')?.setValidators(null);
        this.form.get('postcode')?.setValidators([Validators.required, Validators.pattern(this.commonService.alphaOnly)]);
      }
      
      this.form.get('postcode')?.updateValueAndValidity();
      return isMY;
    });

    this.form.get('postcode')?.valueChanges.subscribe(() => {
      this.form.get('postcode')?.setValidators(null);
      this.form.get('postcode')?.setValidators([Validators.required, Validators.minLength(5), Validators.pattern(this.commonService.numericOnly)]);
    })
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['totalPickupList'] &&
      changes['totalPickupList'].currentValue
    ) {
      this.totalPickupList = changes['totalPickupList'].currentValue;
    }
    if (
      changes['dataPickupAddress'] &&
      changes['dataPickupAddress'].currentValue
    ) {
      this.dataPickupAddress = changes['dataPickupAddress'].currentValue;
      this.patchPickupAddress();
      this.deleteIconDisabled = this.dataPickupAddress.is_default;
    } else if (
      changes['dataPickupAddress'] &&
      !changes['dataPickupAddress'].currentValue
    ) {
      this.form.reset();
    }
  }

  registerMatIcon() {
    this.matIconRegistry.addSvgIcon(
      `delete_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `./assets/delete-icon.svg`
      )
    );
  }

  patchPickupAddress() {
    this.getValidPostcode(this.dataPickupAddress?.postcode)
    if (this.dataPickupAddress) {
      if (this.isNewPickupAddress) {
        this.getCities = [];
        this.dataPickupAddress.is_default = true;
      }

      this.form.patchValue(this.dataPickupAddress);
      if (this.dataPickupAddress.country === 'MY') {
        this.commonService.getCountryIsMY(true);
        this.getValidPostcode(this.dataPickupAddress.postcode);
      } else {
        this.commonService.getCountryIsMY(true);
      }
    } else {
      this.commonService.getCountryIsMY(true);
    }

    if (this.totalPickupList === 0) {
      this.dataPickupAddress = {};
      this.dataPickupAddress.dialing_code = "+60";
      this.form.patchValue({
        is_default: true,
        country: "MY",
        dialing_code: "+60"
      });
      this.form.patchValue(this.dataPickupAddress);
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

  fetchState() {
    this.countryList$ = this.commonService.getAPI('countries', 'list', 0);
    const state$ = this.commonService.getAPI('states', 'query?country=MY', 0);
    state$
      .pipe(
        tap((response: any) => (this.getState = response.data)),
        takeUntil(this._onDestroy)
      )
      .subscribe();
  }

  defineFormBasedOnCountry() {
    this.form.get('country.name')?.setValue({
      calling_code: "+60",
      code: "MY",
      country: "Malaysia"
    });

    this.commonService.getCurrentCountry$
      .pipe(
        tap((data: any) => {
          if (data.isParcel !== true) {
            if (data.data === this.commonService.defaultCountry) {
              this.commonService.getCountryIsMY(true);
            } else {
              this.commonService.getCountryIsMY(false);
              this.form.controls['state'].setValue(null);
              this.form.controls['postcode'].setValue(null);
              this.form.controls['city'].setValue(null);
            }
          }
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe();
  }

  getCitiesByState(city: ICity) {
    this.getCity$ = this.commonService.getAPI(
      'cities',
      'query?country=MY&state=' + city.state_code,
      0
    );
    this.getCity$
    .pipe(takeUntil(this._onDestroy))
    .subscribe((val) => {
      this.getCities = val.data;
    });
  }

  getValidPostcode(postcode: any) {
    if (!postcode) return;
    postcode = FormControlValidators.trimDomesticPostcode(postcode)

    if (postcode?.length >= 5) {
      this.isPopulatingStateCity = true;
      const getCitiesByPostcode$ = this.commonService.getAPI(
        'cities',
        'querybypostcode?country=MY&postcode=' + postcode
      );
      getCitiesByPostcode$
      .pipe(
        takeUntil(this._onDestroy),
        tap((val: any) => {
          if (val?.data?.length) {
            const state_index = this.getState
              .map((e: any) => e.state_code)
              .indexOf(val?.data[0]?.state_code);
            this.form.controls['state'].setValue(this.getState[state_index]);
            this.getCitiesByState(this.getState[state_index]);
            this.selectCity(val);
            this.form.get('postcode')?.setValidators(null);
          } else {
            this.form.controls['state'].setValue(null);
            this.form.controls['city'].setValue(null);
            this.form.get('postcode')?.setValidators(validatePostcode);
          }
          this.form.get('postcode')?.updateValueAndValidity();

        }),
        finalize(() => {
          this.isPopulatingStateCity = false;
          this.cdr.markForCheck()
        })
      )
      .subscribe();
    }
  }

  selectCity(val: any) {
    this.getCity$
    .pipe(takeUntil(this._onDestroy))
    .subscribe((data: any) => {
      this.isPopulatingStateCity = false;
      if (data?.data?.length) {
        const city_index = data?.data
          .map((e: any) => e?.city_name?.trim()?.toLowerCase())
          .indexOf(val?.data[0]?.city_name?.trim()?.toLowerCase());
        setTimeout(() => {
          this.form.controls['city'].setValue(this.getCities[city_index]);
        }, 500);
      } else {
        this.form.controls['city'].setValue(null);
      }
    });
  }

  errorHandler(field: string, val: string) {
    return this.form.controls[field].hasError(val);
  }

  deletePickupAddress() {
    if (Boolean(this.form.value.id)) {
      this.deleteFormData.emit(this.form.value.id);
    }
  }

  save() {
    this.submitForm.emit(this.form.value);
    const isUpdate = !!this.form.value.id; // Check if the form has an `id` to distinguish between Update and Submit
    // Replace 'my' with 'Malaysia' in country field
            const changeCountryName = 
          typeof this.form.value.country === 'string' && this.form.value.country.toLowerCase() === 'my' 
            ? 'Malaysia' 
            : this.form.value.country;
  const eventDetails = {
    event: 'pick_up_update_address_success',
    event_category: 'SendParcel Pro - My Profile - Pick Up Address',
    event_action: isUpdate ? 'Update Pick Up Address Success' : 'New Pick Up Address Success',
    event_label: isUpdate ? 'Success' : 'New Address Success',
    address_type: 'Pick Up Address ',
    postcode: 'postcode ' + this.form.value.postcode,
    city: this.form.value.city,
    country: changeCountryName,
  };
  this.commonService.googleEventPush(eventDetails);
  }
}
