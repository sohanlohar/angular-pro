import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ControlValueAccessor,
  UntypedFormControl,
} from '@angular/forms';
import { MAT_SELECT_SCROLL_STRATEGY_PROVIDER } from '@angular/material/select';
import { MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER } from '@angular/material/tooltip';
import { ICity, IntlCountryCode } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { FormControlValidators } from '@pos/ezisend/shared/data-access/validators/form-control-validators';
import { validatePostcode } from '@pos/ezisend/shipment/data-access/helper/my-shipment-helper';
import { Observable, ReplaySubject, Subject, take, takeUntil, tap } from 'rxjs';
import { bm } from '../../../../../../assets/my';
import { en } from '../../../../../../assets/en';
import { TranslationService } from '../../../../../../shared-services/translate.service';

interface IFormConfig {
  [key: string]: {
    label: string;
    isShow?: boolean;
  };
}

@Component({
  selector: 'pos-general-form',
  templateUrl: './general-form.component.html',
  styleUrls: ['./general-form.component.scss'],
  providers: [
    MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER,
    MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class GeneralFormComponent
  implements ControlValueAccessor, OnInit, OnChanges
{
  @Input() data!: any;
  @Input() OnSubmitButton: boolean = false;
  @Input() title = '';
  @Input() config!: IFormConfig;
  @Input() isDisabledForm = false;
  @Output() emitSave = new EventEmitter();
  countryList$!: Observable<any>;
  isParcel: any;
  selectedCountry: any;
  protected _onDestroy = new Subject<void>();
  public filteredCountries: ReplaySubject<IntlCountryCode[]> =
    new ReplaySubject<IntlCountryCode[]>(1);
  getData: any;
  getFlagIcon = '';

  formConfig: IFormConfig = {};
  form!: FormGroup;
  matHintAlign: 'start' | 'end' = 'end';
  getState: any;
  getCities: any;
  getCity$!: Observable<any>;
  public dialFilterCtrl: UntypedFormControl = new UntypedFormControl();
  
  languageObj: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
    en.data;

  languageData:any;
  languageForm:any;
  
  constructor(
    private translate: TranslationService,
    public _commonService: CommonService,
    ) {
    this.assignFormLabel();
    this.builForm();
    this.fetchState();
    this.translate.buttonClick$.subscribe(() => {
      
      if (localStorage.getItem("language") == "en") {
        this.languageObj = en.data
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageObj = bm.data
      }
      this.assignFormLabel();
    })
  }

  isChangeFromParent(){
    if(this.config){
      for(let key in this.config){
        if(this.formConfig[key]){
          this.formConfig
          this.formConfig[key].label = this.config[key].label;
        }
      }
    }
  }
  
  assignFormLabel(){
    
    this.languageData = this.languageObj['profile'];
    this.languageForm = this.languageObj['form_data'];

    this.formConfig = {
      name: { label: this.languageForm.name },
      nick_name: { label: this.languageForm.nick_name },
      phone_no: { label: this.languageForm.phone },
      dialCode: { label: this.languageForm.code },
      email: { label: this.languageForm.email_address },
      address: { label: this.languageForm.address },
      city: { label: this.languageForm.city },
      postcode: { label: this.languageForm.postcode },
      state: { label: this.languageForm.state },
      country: { label: this.languageForm.country },
      saveCheckbox: { label: this.languageForm.save_to_contact, isShow: false },
      saveButton: { label: this.languageForm.save, isShow: false },
      search: { label: this.languageForm.search_contact },
    };
  }

  ngOnInit(): void {
    this.updateFormConfig();
    this.resetTypeFormFieldCuntryCityState();
    this.defineFormBasedOnCountry();
    this.countryList$ = this._commonService.getAPI('countries', 'list', 0);

    this.countryList$.subscribe((val) => {
      this.getData = val;
      const getDefaultCountryID = this.getData?.data?.countries.findIndex(
        (id: any) => id.country === 'Malaysia'
      );
      this.form.controls['dialCode'].setValue(
        this.getData?.data?.countries[getDefaultCountryID]
      );
      this.form.controls['country'].setValue(
        !this.form.disabled
          ? this.getData?.data?.countries[getDefaultCountryID]
          : this.getData?.data?.countries[getDefaultCountryID].country
      );
      this.filteredCountries.next(this.getData?.data?.countries.slice());
      this._commonService.getCurrentIsCountryMY$.subscribe((isMY) => {
        /* to reset custom postcode field validator */
        if(isMY) {
          this.form.get('postcode')?.setValidators(null);
          this.form.get('postcode')?.setValidators([Validators.required, Validators.pattern(this._commonService.numericOnly)]);
        }
        else {
          this.form.get('postcode')?.setValidators(null);
          this.form.get('postcode')?.setValidators([Validators.required, Validators.pattern(this._commonService.alphaOnly)]);
        }
        this.form.get('postcode')?.updateValueAndValidity();
        return isMY;
      })
      this.form.get('country')?.disable();
    });

    // listen for search field value changes
    this.dialFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDialCodes();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    if (
      changes['data'] &&
      changes['data'].currentValue &&
      Object.keys(changes['data'].currentValue).length){
        this.builForm();
        this.form.patchValue(this.data);
        this.form.markAsTouched();
        if (this.form.get('postcode')?.valid) {
          this.getValidPostcode(this.form.get('postcode')?.value)
        }
    }
    
    this.isChangeFromParent();
  }

  protected filterDialCodes() {
    if (!this.getData?.data?.countries) {
      return;
    }
    // get the search keyword
    let search = this.dialFilterCtrl.value;
    if (!search) {
      this.filteredCountries.next(this.getData?.data?.countries.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    // filter the countries
    this.filteredCountries.next(
      this.getData?.data?.countries.filter(
        (name: { country: string }) =>
          name.country.toLowerCase().indexOf(search) > -1
      )
    );
  }

  resetTypeFormFieldCuntryCityState() {
    this._commonService.isLocalCountryMY
      ? this._commonService.getCountryValue({
          data: 'Malaysia',
          isParcel: false,
        })
      : this._commonService.getCountryValue({ data: '', isParcel: false });
  }

  updateFormConfig() {
    for (const key in this.formConfig) {
      if (this.config[key]) {
        if (this.config[key].label)
          this.formConfig[key].label = this.config[key].label;
        if (this.config[key].isShow)
          this.formConfig[key].isShow = this.config[key].isShow;
      }
    }
  }

  fetchState() {
    this.countryList$ = this._commonService.getAPI('countries', 'list', 0);
    const state$ = this._commonService.getAPI('states', 'query?country=MY', 0);
    state$
      .pipe(
        tap((response: any) => (this.getState = response.data)),
        takeUntil(this._onDestroy)
      )
      .subscribe();
  }

  defineFormBasedOnCountry() {
    this._commonService.getCurrentCountry$
      .pipe(
        tap((data: any) => {
          if (!data.isParcel) {
            if (data.data === this._commonService.defaultCountry) {
              this._commonService.getCountryIsMY(true);
            } else {
              this._commonService.getCountryIsMY(false);
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
    this.getCity$ = this._commonService.getAPI(
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
    postcode = FormControlValidators.trimDomesticPostcode(postcode)

    if (postcode.length >= 5) {
      const getCitiesByPostcode$ = this._commonService.getAPI(
        'cities',
        'querybypostcode?country=MY&postcode=' + postcode
      );
      getCitiesByPostcode$
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val: any) => {
        if (val?.data?.length) {
          const state_index = this.getState
            .map((e: any) => e.state_code)
            .indexOf(val?.data[0]?.state_code);
          this.form.controls['state'].setValue(
            !this.form.disabled
              ? this.getState[state_index]
              : this.getState[state_index].state_name
          );
          this.getCitiesByState(this.getState[state_index]);
          this.selectCity(val);
          this.form.get('postcode')?.setValidators(null);
        } else {
          this.form.controls['state'].setValue(null);
          this.form.controls['city'].setValue(null);
          this.form.get('postcode')?.setValidators(validatePostcode);
        }
        this.form.get('postcode')?.updateValueAndValidity();
      });
    }
  }

  getSelectedCountry(event: any) {
    this.selectedCountry = {
      data: event.value.country,
      isParcel: this.isParcel,
    };
    this._commonService.getCountryValue(this.selectedCountry);
  }

  selectCity(val: any) {
    this.getCity$
    .pipe(takeUntil(this._onDestroy))
    .subscribe((data: any) => {
      if (data?.data?.length) {
        const city_index = data?.data
          .map((e: any) => e?.city_name?.trim()?.toLowerCase())
          .indexOf(val?.data[0]?.city_name?.trim()?.toLowerCase());
        setTimeout(() => {
          this.form.controls['city'].setValue(
            !this.form.disabled
              ? this.getCities[city_index]
              : this.getCities[city_index].city_name
          );
        }, 500);
      } else {
        this.form.controls['city'].setValue(null);
      }
    });
  }

  save() {
    this.emitSave.emit(this.form.value);
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  get value(): any {
    return this.form.value;
  }

  set value(value: any) {
    this.form.setValue(value);
    this.onChange(value);
    this.onTouched();
  }

  writeValue(value: any) {
    if (value) {
      this.value = value;
    }

    if (value === null) {
      this.form.reset();
    }
  }

  registerOnTouched(fn: any) {
    //
  }

  onChange: any = () => {
    //
  };

  onTouched: any = () => {
    //
  };

  loadFlagImage(img: string) {
    this.getFlagIcon = this._commonService.flagAPI + img + '.svg';
    return this._commonService.flagAPI + img + '.svg';
  }

  get phoneControl() {
    return this.form.controls['phone_no'];
  }

  get dialCodeControl() {
    return this.form.controls['dialCode'];
  }

  checkSearchValue() {
    const search = this.dialFilterCtrl.value;
    if (search) {
      if (
        this.getData?.data?.countries.filter(
          (name: { country: string }) =>
            name.country.toLowerCase().indexOf(search) > -1
        ).length === 0
      ) {
        this.dialCodeControl.setValue('');
      }
    }
  }

  private builForm() {
    this.form = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      nick_name: new FormControl(''),
      phone_no: new FormControl('', [
        Validators.required,
        Validators.pattern(this._commonService.numericWithSpecialCharacters),
      ]),
      dialCode: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.pattern(this._commonService.emailOnly)]),
      address: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      postcode: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      is_default: new FormControl(false),
      search: new FormControl(''),
    });

    if (this.isDisabledForm) {
      this.form.disable();
    }
  }
}
