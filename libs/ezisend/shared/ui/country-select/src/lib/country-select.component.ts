import {
  Component,
  ChangeDetectionStrategy,
  Input,
  forwardRef,
  OnDestroy,
  OnInit,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  NG_VALIDATORS,
  FormGroup,
  FormBuilder,
  Validators,
  UntypedFormControl,
} from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IntlCountryCode } from '@pos/ezisend/shared/data-access/models';
/** HAVE TO MOVE THIS INTERFACE TO SEPARATE FILE */

import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-country-select',
  templateUrl: './country-select.component.html',
  styleUrls: ['./country-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CountrySelectComponent),
      multi: true,
    },

    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CountrySelectComponent),
      multi: true,
    },
  ],
})
export class CountrySelectComponent
  implements ControlValueAccessor, OnDestroy, OnInit, OnChanges
{
  form: FormGroup;
  subscriptions: Subscription[] = [];

  /** list of countries filtered by search keyword */
  public filteredCountries: ReplaySubject<IntlCountryCode[]> =
    new ReplaySubject<IntlCountryCode[]>(1);
  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  @Input() data!: Observable<IntlCountryCode[]>;
  @Input() setName: any = this.commonService.defaultCountry;
  @Input() setFlag: any = this.commonService.defaultCountryCode;
  @Input() setCode: any = this.commonService.defaultCountryCode;
  @Input() selectedCountry: any;
  @Input() isParcel: any;
  @Input() disabled = false;
  @Input () isLabel: any;
  getFlagIcon = '';
  getData: any;

  /** control for the MatSelect filter keyword */
  public dialFilterCtrl: UntypedFormControl = new UntypedFormControl();

  filteredCountryCode$: Observable<IntlCountryCode[]> | undefined;

  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.form_data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.form_data :
    en.data.form_data;


  constructor(
    private fb: FormBuilder, 
    private commonService: CommonService,
    private translate: TranslationService
  ) {
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.form_data
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.form_data
      }
    })

    this.form = this.fb.group({
      countryCode: [''],
      name: ['', Validators.required],
    });

    // any time the inner form changes update the parent of any change
    this.subscriptions.push(
      this.form.valueChanges.subscribe((value) => {
        this.onChange(value);
        this.onTouched();
      })
    );
  }

  ngOnInit() {
    this.patchSelectedCountry();

    this.subscriptions.push(this.commonService.contactOptionSelected.subscribe(countryCode => {
      const getDefaultCountryID = this.getData?.data?.countries.findIndex(
        (id: any) => id.code === countryCode
      );
      this.form.controls['name'].setValue(
        this.getData?.data?.countries[getDefaultCountryID]
      );
    }));

    // listen for search field value changes
    this.dialFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDialCodes();
      });

    //Get and Set Default/Actual Flag, Phone and Code
    this.getFlagIcon = this.loadFlagImage(this.setFlag);
    this.form.get('countryCode')?.setValue(this.setFlag);
    this.form.controls['name'].setValue(this.setName);
    this.form.get('name')?.setValue(this.setName);


    this.singleSelect.openedChange.subscribe((isOpen) => {
      if (isOpen === false) {
        this.checkSearchValue();
      }
    });

    // if (this.disabled) {
    //   this.form.get('name')?.disable();
    // }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['setCode'] && changes['setCode'].currentValue) {
      this.patchSelectedCountry();
    }
  }

  errorHandler(field: string, val: string) {
    return this.form.controls[field].hasError(val);
  }

  patchSelectedCountry() {
    this.data.subscribe((val) => {
      this.getData = val;
      const getDefaultCountryID = this.getData?.data?.countries.findIndex(
        (id: any) => id.code === this.setCode
      );
      this.form.controls['name'].setValue(
        this.getData?.data?.countries[getDefaultCountryID]
      );
      this.filteredCountries.next(this.getData?.data?.countries.slice());
    });
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

  loadFlagImage(img: string) {
    this.getFlagIcon = this.commonService.flagAPI + img + '.svg';
    return this.commonService.flagAPI + img + '.svg';
  }

  getSelectedCountry(event: any) {
    this.selectedCountry = {
      data: event.value.country,
      isParcel: this.isParcel,
    };
    this.commonService.getCountryValue(this.selectedCountry);
  }

  onChange: any = () => {
    //Initializing func
  };
  onTouch: any = () => {
    //Initializing func
  };

  onTouched: any = () => {
    //Initializing func
  };

  writeValue(value: any) {
    
    if (value) {
      if(value?.name == undefined) {
        value.name = '';
      }
      this.value = value;
    }
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }

  set value(val: IntlCountryCode) {
    // this value is updated by programmatic changes
    this.form?.setValue(val);
    this.onChange(val);
    this.onTouch();
  }

  get value(): IntlCountryCode {
    return this.form?.value;
  }

  get nameControl() {
    return this.form.controls['name'];
  }

  checkSearchValue() {
    const search = this.dialFilterCtrl.value?.toLowerCase();
    if (search) {
      if (
        this.getData?.data?.countries.filter(
          (name: { country: string }) =>
            name.country.toLowerCase().indexOf(search) > -1
        ).length === 0
      ) {
        this.nameControl.setValue('');
      }
    }
  }

  validate(_: FormControl) {
    return this.form?.valid ? null : { country: { valid: false } };
  }
}
