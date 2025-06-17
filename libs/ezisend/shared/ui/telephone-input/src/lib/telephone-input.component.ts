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
  Validators,
  NG_VALIDATORS,
  FormGroup,
  FormBuilder,
  UntypedFormControl,
} from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

export interface IntlCountryCode {
  country: string;
  calling_code: string;
  code: string;
}

@Component({
  selector: 'pos-telephone-input',
  templateUrl: './telephone-input.component.html',
  styleUrls: ['./telephone-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TelephoneInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TelephoneInputComponent),
      multi: true,
    },
  ],
})
export class TelephoneInputComponent
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

  @Input() data!: Observable<IntlCountryCode[]>; // Retreive from Public API
  @Input() dialing_code: any = this.commonService.defaultDialingCode;
  @Input() setFlag: any = this.commonService.defaultCountryCode;
  @Input() setPhone = '';
  @Input() isFromSmartInput = false;

  getFlagIcon = '';
  getData: any;

  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.form_data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.form_data :
    en.data.form_data;

  /** control for the MatSelect filter keyword */
  public dialFilterCtrl: UntypedFormControl = new UntypedFormControl();

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
        dialCode: ['', [Validators.required]],
        phone: [
          '',
          [
            Validators.required,
            Validators.pattern(this.commonService.numericWithSpecialCharacters),
            Validators.minLength(8)
          ],
        ],
        countryCode: [''],
      });

      // any time the inner form changes update the parent of any change
      this.subscriptions.push(
        this.form.valueChanges.subscribe((value) => {
          if(value.dialCode) {
            this.onChange(value);
          }
          
          this.onTouched();
        })
      );
    }

  ngOnInit() {
    this.data.subscribe((val) => {
      this.getData = val;
      this.patchCodeField();
    });

    // listen for search field value changes
    this.dialFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDialCodes();
      });

    //Get and Set Default/Actual Flag, Phone and Code
    this.getFlagIcon = this.loadFlagImage(this.setFlag);
    this.form.controls['dialCode']?.setValue(this.dialing_code);
    this.form.get('phone')?.setValue(this.setPhone);
    this.form.controls['countryCode']?.setValue(this.setFlag);

    this.singleSelect.openedChange.subscribe((isOpen) => {
      if (isOpen === false) {
        this.checkSearchValue();
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.form && changes && changes['setPhone']) {
      this.form
        .get('phone')
        ?.setValue(changes && changes['setPhone'].currentValue);
    }
    if (changes && changes['dialing_code']) {
      this.patchCodeField();
    }
    if (
      changes &&
      changes['isFromSmartInput'] &&
      changes['isFromSmartInput'].currentValue)
    {
      this.form.markAllAsTouched();
    }
  }

  errorHandler(field: string, val: string) {
    return this.form.controls[field].hasError(val);
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

  patchCodeField() {
    const getDefaultCountryID = this.getData?.data?.countries.findIndex(
      (id: any) => id.calling_code == this.dialing_code
    );
    this.form.controls['dialCode'].setValue(
      this.getData?.data?.countries[getDefaultCountryID]
    );
    this.filteredCountries.next(this.getData?.data?.countries.slice());
  }

  loadFlagImage(img: string) {
    this.getFlagIcon = this.commonService.flagAPI + img + '.svg';
    return this.commonService.flagAPI + img + '.svg';
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

  get phoneControl() {
    return this.form.controls['phone'];
  }

  get dialCodeControl() {
    return this.form.controls['dialCode'];
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
        this.dialCodeControl.setValue('');
      }
    }
  }

  validate(_: FormControl) {
    return this.form?.valid ? null : { phone: { valid: false } };
  }
}
