import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
  Input,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  EMPTY,
  exhaustMap,
  finalize,
  map,
  merge,
  mergeMap,
  Observable,
  ReplaySubject,
  Subject,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalDialogComponent } from '@pos/ezisend/shared/ui/dialogs/modal-dialog';
import { LoginService } from '@pos/ezisend/auth/data-access/services';
import { openViewGuideDialog } from '@pos/ezisend/shared/ui/dialogs/view-guide-dialog';
import {
  ICustomDetailFormGroup,
  ICustomDetails,
  IMpsChildShipmentFormGroup,
} from '@pos/ezisend/shipment/data-access/models';
import { IHSC, IntlCountryCode } from '@pos/ezisend/shared/data-access/models';
import { MatTabGroup } from '@angular/material/tabs';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';
import { IPickupAddress } from '@pos/ezisend/profile/data-access/models';
export const HSCLIST: IHSC[] = [];
export const COD_AMOUNT = 3000
export const MELPLUS_COD_AMOUNT = 500
export interface IProductDisable {
  category: string;
  country: string;
  end_date: string;
  product: string;
  start_date: string;
}
@Component({
  selector: 'pos-parcel-detail-form',
  templateUrl: './parcel-detail-form.component.html',
  styleUrls: ['./parcel-detail-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ParcelDetailFormComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  /** list of HSCode */
  protected hsc_list: IHSC[] = HSCLIST;
  /** control for the MatSelect filter keyword */
  public HSCFilterCtrl: UntypedFormControl = new UntypedFormControl();
  /** list of HSCs filtered by search keyword */
  public filteredHSCList: ReplaySubject<IHSC[]> = new ReplaySubject<IHSC[]>(1);
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  @ViewChild('singleSelect', { static: true })
  singleSelect!: MatSelect;
  @Output() backClicked = new EventEmitter<void>();
  @Input() isEditOrder = false;
  protected _onDestroy = new Subject<void>();
  @Input() isReturnOrder = false;
  disabledProducts: string[] = [];
  isIssuredDOM = false;
  isIssuredIntl = false;
  custom_title = 'Origin Country';
  is_cod = false;
  isCOD = false;
  isFeatureCODChecked =  false;
  isMelPlus = false
  isDisable = true;
  isParcel = false;
  isMPS = false;
  selectedCountry: any;
  HSCList: any;
  CountryList: any;
  isSubmitting = false;
  isFound: any
  customDeclarationsIsLoading = false;
  warningMessage: string | null = null;
  showWarning = false;
  public hscFilterCtrl: UntypedFormControl = new UntypedFormControl();
  public filteredHSC: ReplaySubject<IHSC[]> = new ReplaySubject<IHSC[]>(1);
  orderId!: string | null;
  isfetaureMelPlus: any;
  weightExceeded = false;
  dimensionExceeded = false;
  private category = new Map<string, string[]>([
    ['EMS', ['Document', 'Merchandise']],
    ['Air Parcel', ['Parcel']],
    ['Surface Parcel', ['Parcel']],
  ]);
  public category_details = [
    { name: 'Sales of goods', value: 'Sales of goods'},
    { name: 'Returned goods', value: 'Returned goods'},
    { name: 'Gift', value: 'Gift'},
    { name: 'Commercial Sample', value: 'Commercial Sample'},
    { name: 'Document', value: 'Document'},
    { name: 'Others', value: 'Others'}
  ];
  insuranceUrl =
    'https://www.pos.com.my/legal/terms-and-conditions-poscoverageplus';
  product_category: any;
  product_category_details: any;
  category_item: string | undefined;
  category_detail: string | undefined;
  $getHSC: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  mpsDetailsForm = this.fb.group({
    category: ['Parcel', Validators.required],
    category_details: [''],
    product: [''],
    width: [
      '',
      [
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
      ],
    ],
    length: [
      '',
      [
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
      ],
    ],
    height: [
      '',
      [
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
      ],
    ],
    weight: [
      '',
      [
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
      ],
    ],
    totalWeight: [{ value: '', disabled: true}, [Validators.required]],
    totalInsured: [{ value: '', disabled: false }, [Validators.max(5000)]],
    totalPremiumAmount: [{value: '', disabled: true}],
    volumetricWeight: [{ value: '', disabled: true }, [Validators.required]],
    chargeableWeight: [{ value: '', disabled: true }, [Validators.required]],
    noShipments: [{ value: 2, disabled: true }],
    content: ['', Validators.required],
    sender_ref: [''],
    parcelNotes: [''],
    codCheck: [false],
    insuranceCheck: [false],
    amount: [
      '',
      [
        Validators.pattern(this.commonService.numericWithDecimalOnly),
        Validators.min(1),
        Validators.max(COD_AMOUNT)
      ],
    ],
    sum_insured: [
      '',
      [
        Validators.pattern(this.commonService.numericWithDecimalOnly),
        Validators.max(5000),
      ],
    ],
    premiumAmt: [
      { value: '', disabled: true },
    ],
    mps_child_declarations: this.fb.array([]),
  });
  parcelDetailsForm = this.fb.group({
    category: ['Parcel', Validators.required],
    category_details: [''],
    product: [''],
    width: [
      '',
      [
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
        Validators.max(200)
      ],
    ],
    length: [
      '',
      [
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
        Validators.max(200),
      ],
    ],
    height: [
      '',
      [
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
        Validators.max(200),
      ],
    ],
    weight: [
      '',
      [
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
        Validators.max(60)
      ],
    ],
    volumetricWeight: [{ value: '', disabled: true }, [Validators.required]],
    chargeableWeight: [{ value: '', disabled: true }, [Validators.required]],
    content: ['', Validators.required],
    parcelNotes: [''],
    sender_ref: ['',[Validators.maxLength(50)]],
    codCheck: [false],
    insuranceCheck: [false],
    amount: [
      '',
      [Validators.pattern(this.commonService.numericWithDecimalOnly),
        Validators.min(1),
        Validators.max(COD_AMOUNT)],
    ],
    sum_insured: [
      '',
      [
        Validators.pattern(this.commonService.numericWithDecimalOnly),
        Validators.min(1),
        Validators.max(5000),
      ],
    ],
    premiumAmt: [
      { value: '', disabled: true },
      [Validators.pattern(this.commonService.numericWithDecimalOnly)],
    ],
  });
  isValidRecipientForm = false;
  openViewGuideDialog = openViewGuideDialog;
  selected_category = '';
  selected_category_detail = '';
  selected_product = '';
  parcelAbroadForm!: FormGroup;
  weightTooltip = 'Shipment rate will be calculated based on parcel weight or volumetric weight whichever is higher';
  melplusTooltip = 'Shipment rate is based on zone and weight band (in kg).'
  languageObj: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
    en.data;
  languageData: any;
  languageForm: any;
  @Output() selectValue = new EventEmitter<any>();
  isFeatureCod: any;
  isMelPlusCod: any;
  isconfirmOrderEnable: any =false;
  isFeatureCOD: any;
  isCountryMY = true;
  isPendingPickup = false;
  getCitiesByPostcode$!: Observable<any>;

    constructor(
    private _snackBar: MatSnackBar,
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    private loginService: LoginService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private stepper: MatStepper,
    private translate: TranslationService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    this.assignLanguageLabel();
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageObj = en.data
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageObj = bm.data
      }
      this.assignLanguageLabel();
      this.cdr.detectChanges();
    })
    const _WIDTH = this.parcelDetailsForm.controls['width'];
    const _LENGTH = this.parcelDetailsForm.controls['length'];
    const _HEIGHT = this.parcelDetailsForm.controls['height'];
    const _VOLUMETRICWEIGHT =
      this.parcelDetailsForm.controls['volumetricWeight'];
    const _SUMINSURED = this.parcelDetailsForm.controls['sum_insured'];
    const _PREMIUMAMT = this.parcelDetailsForm.controls['premiumAmt'];
    merge(_WIDTH.valueChanges, _LENGTH.valueChanges, _HEIGHT.valueChanges)
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        _VOLUMETRICWEIGHT.setValue(
          (_LENGTH.value * _WIDTH.value * _HEIGHT.value) / 5000
        );
      });
    _SUMINSURED.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val: number) => {
        if(this.canImplementNewRatePremiumAmt()){
          const percentToGet = 1;
          const res = (val * percentToGet) / 100;
          _PREMIUMAMT.setValue(res.toFixed(2));
        } else {
          if (val <= 1000) {
            _PREMIUMAMT.setValue('1.00');
          } else {
            const percentToGet = 0.1;
            const res = (percentToGet / 100) * val;
            _PREMIUMAMT.setValue(res.toFixed(2));
          }
        }
      });
      this.commonService.getIsMelplus$.subscribe(res=>{
        this.isfetaureMelPlus = res;
      })
      this.commonService.getIsMelplusCod$.subscribe(res=>{
        this.isMelPlusCod = res;
      })
      this.commonService.getIsCod$.subscribe(res=>{
        this.isFeatureCod = res;
      })
      this.commonService.getIsCodUbat$.subscribe(res=>{
        if(res){
          this.parcelDetailsForm.get('category')?.setValue('Ubat');
          this.parcelDetailsForm.controls['weight'].setValidators([
            Validators.max(2),
            Validators.required,
            Validators.pattern(this.commonService.numericWithDecimalOnly),
          ])
          this.parcelDetailsForm.controls['length'].setValidators([
            Validators.max(33),
            Validators.required,
            Validators.pattern(this.commonService.numericWithDecimalOnly),
          ])
          this.parcelDetailsForm.controls['width'].setValidators([
            Validators.max(26),
            Validators.required,
            Validators.pattern(this.commonService.numericWithDecimalOnly),
          ])
          this.parcelDetailsForm.controls['height'].setValidators([
            Validators.max(10),
            Validators.required,
            Validators.pattern(this.commonService.numericWithDecimalOnly),
          ])
        }
      })
      if(this.isReturnOrder){
        this.parcelAbroadForm.disable();
        this.parcelDetailsForm.disable();
        this.mpsDetailsForm.disable();
       }
  }
  assignLanguageLabel(){
    this.languageData = this.languageObj['myShipments']['parcel_data'];
    this.languageForm = this.languageObj['form_data'];
    this.weightTooltip = this.languageData.weight_tooltip;
    this.melplusTooltip = this.languageData.melplus_tooltip;
    this.custom_title = this.languageData.origin_country;
    this.category = new Map<string, any[]>([
      ['Pos Laju International', [
        {name: 'Document', value: this.languageForm.document},
        {name: 'Merchandise', value: this.languageForm.merchandise}]],
        ['Economy International (Air)', [{name: 'Parcel', value: this.languageData.parcel}]],
        ['Economy International (Surface)', [{name: 'Parcel', value: this.languageData.parcel}]],
    ]);
    this.category_details = [
      { name: 'Sales of Goods', value: this.languageForm.sales_of_goods},
      { name: 'Returned Goods', value: this.languageForm.returned_goods},
      { name: 'Gift', value: this.languageForm.gift},
      { name: 'Document', value: this.languageForm.document},
      { name: 'Commercial Sample', value: this.languageForm.commercial_sample},
      { name: 'Others', value: this.languageForm.others}
    ];
  }
  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnInit() {

    this.isPendingPickup = this.router.url.includes('pending-pickup') ? true : false;
    this.commonService.getCurrentIsCountryMY$.subscribe(res=>{
      this.isCountryMY = res;
    })
        this.commonService.setCurrentSelectedPickupAddress();
        this.parcelDetailsForm.get('weight')?.valueChanges.subscribe(() => {
          this.calculateChargeableWeight(this.parcelDetailsForm);
        });
        this.parcelDetailsForm.get('volumetricWeight')?.valueChanges.subscribe(() => {
          this.calculateChargeableWeight(this.parcelDetailsForm);
        });
    // listen for search field value changes
    this.HSCFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterHSCLists();
      });
    this.getEmsCountry();
        this.parcelAbroadForm = this.fb.group({
      category: ['', Validators.required],
      category_details: ['', Validators.required],
      product: ['', Validators.required],
      width: [
        '',
        [
          Validators.required,
          Validators.pattern(this.commonService.numericWithDecimalOnly),
        ],
      ],
      length: [
        '',
        [
          Validators.required,
          Validators.pattern(this.commonService.numericWithDecimalOnly),
        ],
      ],
      height: [
        '',
        [
          Validators.required,
          Validators.pattern(this.commonService.numericWithDecimalOnly),
        ],
      ],
      weight: [
        '',
        [
          Validators.required,
          Validators.pattern(this.commonService.numericWithDecimalOnly),
          Validators.max(30)
        ],
      ],
      volumetricWeight: [{ value: '', disabled: true }, [Validators.required]],
      chargeableWeight: [{ value: '', disabled: true }, [Validators.required]],
      parcelNotes: [''],
      sender_ref: ['', [Validators.maxLength(50)]],
      insuranceCheck: [false],
      sum_insured: [
        '',
        [
          Validators.pattern(this.commonService.numericWithDecimalOnly),
          Validators.min(1),
          Validators.max(5000),
        ],
      ],
      premiumAmt: [
        { value: '', disabled: true },
        [Validators.pattern(this.commonService.numericWithDecimalOnly)],
      ],
      customs_declarations: this.fb.array([this.createItem()]),
    });
    const _WIDTH_ABRD = this.parcelAbroadForm.controls['width'];
    const _LENGTH_ABRD = this.parcelAbroadForm.controls['length'];
    const _HEIGHT_ABRD = this.parcelAbroadForm.controls['height'];
    const _VOLUMETRICWEIGHT_ABRD =
      this.parcelAbroadForm.controls['volumetricWeight'];
    const _SUMINSURED_ABRD = this.parcelAbroadForm.controls['sum_insured'];
    const _PREMIUMAMT_ABRD = this.parcelAbroadForm.controls['premiumAmt'];
    this.parcelAbroadForm.get('weight')?.valueChanges.subscribe(() => {
      this.calculateChargeableWeight(this.parcelAbroadForm);
    });
     // Listen to changes on the weight, length, width, and height fields to update warnings
      // Subscribe to `parcelAbroadForm` for international shipments
  this.parcelAbroadForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
    this.validatePosLajuConditions();
  });

  // Subscribe to `parcelDetailsForm` for domestic shipments
  this.parcelDetailsForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
    this.validateDomesticConditions();
  });
    merge(
      _WIDTH_ABRD.valueChanges,
      _LENGTH_ABRD.valueChanges,
      _HEIGHT_ABRD.valueChanges
    )
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        _VOLUMETRICWEIGHT_ABRD.setValue(
          (_LENGTH_ABRD.value * _WIDTH_ABRD.value * _HEIGHT_ABRD.value) / 5000
        );
        this.updateChargeableWeight();
              this.cdr.detectChanges();
      });
    _SUMINSURED_ABRD.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val: number) => {
        if(this.canImplementNewRatePremiumAmt()){
          const percentToGet = 1;
          const res = (val * percentToGet) / 100;
          _PREMIUMAMT_ABRD.setValue(res.toFixed(2));
        } else {
          if (val <= 1000) {
            _PREMIUMAMT_ABRD.setValue('1.00');
          } else {
            const percentToGet = 0.1;
            const res = (percentToGet / 100) * val;
            _PREMIUMAMT_ABRD.setValue(res.toFixed(2));
          }
        }
      });
    this.commonService.getCurrentCountry$
      .pipe(takeUntil(this._onDestroy))
      .subscribe((data: any) => {
        if (data.isParcel !== true) {
          // this.isIssuredDOM = false;
          // this.isIssuredIntl = false;
          !this.isEditOrder && this.resetInsurance();
          if (data.data === this.commonService.defaultCountry) {
            this.commonService.getCountryIsMY(true);
          } else {
            this.commonService.getCountryIsMY(false);
          }
        }
      });
    this.commonService.getHSC$ = this.commonService.getAPI(
      'hscodes',
      'list',
      0
    );
    this.commonService.getHSC$
      .pipe(
        takeUntil(this._onDestroy),
        tap(() => {
          this.customDeclarationsIsLoading = true;
          this.cdr.markForCheck();
        }),
        tap((val: any) => {
          this.HSCList = val.data;
          this.hsc_list = val.data;
          this.filteredHSCList.next(this.hsc_list.slice());
        }),
        mergeMap(() =>
          this.commonService.countryList$.pipe(takeUntil(this._onDestroy))
        ),
        map((val: any) => val?.data?.countries),
        tap((countries: any) => (this.CountryList = countries)),
        mergeMap(() =>
          this.commonService.getCustomDetail$.pipe(takeUntil(this._onDestroy))
        )
      )
      .subscribe((customDetails: ICustomDetails[]) => {
        if (customDetails && customDetails.length && this.isEditOrder) {
          this.customs_declarations.clear();
          for (const custom of customDetails) {
            const item: ICustomDetailFormGroup = this.buildCustomItem(custom);
            this.customs_declarations.push(this.createItem(item));
          }
        }
        this.getDisableStatus();
        this.cdr.detectChanges();
        this.customDeclarationsIsLoading = false;
        this.cdr.markForCheck();
      });
    this.is_cod = this.loginService.getCodStatus();
    this.loginService.codStatusUpdated
      .pipe(takeUntil(this._onDestroy))
      .subscribe((latestStatus) => {
        this.is_cod = latestStatus;
        this.cdr.detectChanges();
      });
      // this localStorage item was set in return-order mode to disable the COD option
      if(this.isReturnOrder){
        const parcel_is_cod = localStorage.getItem('parcel_details.is_cod')
        if(!parcel_is_cod){
          this.is_cod = false;
        }
      }
    if (this.isEditOrder || this.isReturnOrder) {
      this.commonService.getSelectedPickUp$
        .pipe(takeUntil(this._onDestroy))
        .subscribe((pickupID) => {
          this.commonService.setRecipientValue({
            ...this.commonService.getRecipientValue(),
            sender: { pickup_option_id: pickupID }
          });
        });
      this.commonService.getParcelDetail$
        .pipe(takeUntil(this._onDestroy))
        .subscribe((parcelDetails) => {
          // // For product
          const productCategoryMap: Record<string, string> = {
            'EMS': 'Pos Laju International',
            'Air Parcel': 'Economy International (Air)',
            'Surface Parcel': 'Economy International (Surface)',
          };
          this.product_category = productCategoryMap[parcelDetails?.product] || this.product_category;
          // this.product_category = parcelDetails?.product;

          this.category_item = parcelDetails?.category;
          this.category_detail = parcelDetails?.category_details;
          if (parcelDetails) {
            this.patchParcelDetailsForm(parcelDetails);
            const countryValue =
              parcelDetails.type === 'DOMESTIC'
                ? { data: 'Malaysia', isParcel: false }
                : { data: '', isParcel: false };
            this.commonService.getCountryValue(countryValue);
            if(parcelDetails.category.toLowerCase() === 'melplus'){
              this.commonService.isMelPlusSelected.next(true);
              this.isMelPlus = true;
              this.parcelDetailsForm.controls['width'].setValidators([
                Validators.required,
                Validators.pattern(this.commonService.numericWithDecimalOnly),
                Validators.max(25),
              ]);
              this.parcelDetailsForm.controls['length'].setValidators([
                Validators.required,
                Validators.pattern(this.commonService.numericWithDecimalOnly),
                Validators.max(35),
              ]);
              this.parcelDetailsForm.controls['height'].setValidators([
                Validators.required,
                Validators.pattern(this.commonService.numericWithDecimalOnly),
                Validators.max(5),
              ]);
              this.parcelDetailsForm.controls['weight'].setValidators([
                Validators.required,
                Validators.pattern(this.commonService.numericWithDecimalOnly),
                Validators.max(2),
              ]);
            } else {
              this.commonService.isMelPlusSelected.next(false);
              this.isMelPlus = false;
              // this.parcelDetailsForm.controls['width'].setValidators([
              //   Validators.required,
              //   Validators.pattern(this.commonService.numericWithDecimalOnly),
              //   Validators.pattern(this.commonService.numericWithDecimalOnly),
              // ]);
              // this.parcelDetailsForm.controls['height']?.setValidators([
              //   Validators.required,
              //   Validators.pattern(this.commonService.numericWithDecimalOnly),
              //   Validators.pattern(this.commonService.numericWithDecimalOnly),
              // ]);
              // this.parcelDetailsForm.controls['length'].setValidators([
              //   Validators.required,
              //   Validators.pattern(this.commonService.numericWithDecimalOnly),
              //   Validators.pattern(this.commonService.numericWithDecimalOnly),
              // ]);
              // this.parcelDetailsForm.controls['weight']?.setValidators([
              //   Validators.required,
              //   Validators.pattern(this.commonService.numericWithDecimalOnly),
              //   Validators.pattern(this.commonService.numericWithDecimalOnly),
              // ]);
            }
          }
        });
      this.commonService.recipientForm
        .pipe(takeUntil(this._onDestroy))
        .subscribe((formStatus) => {
          this.isValidRecipientForm = formStatus;
          this.cdr.markForCheck();
        });
    }
    this.orderId = this.route.snapshot.paramMap.get('id');
    if(this.isReturnOrder){
      this.parcelAbroadForm.disable();
      this.parcelDetailsForm.disable();
      this.mpsDetailsForm.disable();
     }
     this.commonService.getCurrentSelectedPickupAddress$.subscribe((val: any) => {
      if(val !==null){
       this.isconfirmOrderEnable=true
      }
    })
  if(this.route.snapshot.paramMap.get('id1')){
      this.commonService
        .fetchList('pickupaddress', 'list')
        .subscribe({
          next:(pickupaddress)=>{
            const unId = Number(this.route.snapshot.paramMap.get('id1'))
            const address = pickupaddress.data['pickup-addresses'].find((address: IPickupAddress) => address.id === unId);
        if (address) {
          this.isFound = true
          this.commonService.setCurrentSelectedPickupAddress(address);
          this.commonService.setSelectedPickUpID(address.id);
          this.isconfirmOrderEnable = true;
        }
          },
          error:()=>{
            this.cdr.detectChanges();
            this.commonService.openErrorDialog();
          }
        });
      }
  }
  ngOnChanges(changes: SimpleChanges): void {
      if(changes['isReturnOrder'].currentValue){
        this.isReturnOrder = changes['isReturnOrder'].currentValue;
      }
  }
    setParcelType(event:any, index:number){
    this.customs_declarations.controls[index].get('parcel_type')?.setValue(event)
  }
  updateChargeableWeight() {
    const weight = this.parcelAbroadForm.controls['weight'].value;
    const volumetricWeight = this.parcelAbroadForm.controls['volumetricWeight'].value;
    if (weight !== null && volumetricWeight !== null) {
      const chargeableWeight = Math.max(weight, volumetricWeight);
      this.parcelAbroadForm.controls['chargeableWeight'].setValue(chargeableWeight, { emitEvent: false });
      // Manually trigger change detection to ensure the UI updates
      this.cdr.detectChanges();
    }
  }
  calculateChargeableWeight(formGroup: FormGroup) {
    const weight = parseFloat(formGroup.get('weight')?.value || '0');
    const volumetricWeight = parseFloat(formGroup.get('volumetricWeight')?.value || '0');
    const chargeableWeight = Math.max(weight, volumetricWeight);
    formGroup.get('chargeableWeight')?.setValue(chargeableWeight);
  }
  /**
   * Sets the initial value after the filteredHSCs are loaded initially
   */
  protected setInitialValue() {
    this.filteredHSCList
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        if (this.singleSelect) {
          this.singleSelect.compareWith = (a: IHSC, b: IHSC) =>
            a && b && a?.keyword === b?.keyword;
        }
      });
  }
  protected filterHSCLists() {
    if (!this.hsc_list) {
      return;
    }
    // get the search keyword
    let search = this.HSCFilterCtrl.value;
    if (!search) {
      this.filteredHSCList.next(this.hsc_list.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the hsc_lists
    this.filteredHSCList.next(
      this.hsc_list.filter(
        (item) =>
          item.hscode.toLowerCase().indexOf(search) > -1 ||
          item.keyword.toLowerCase().indexOf(search) > -1
      )
    );
  }
  onBackButtonClick() {
    this.backClicked.emit();
  }
  private buildCustomItem(custom: ICustomDetails): ICustomDetailFormGroup {
    return {
      parcel_type: this.HSCList.find(
        (hsc: IHSC) => hsc?.hscode === custom?.hscode && hsc?.keyword === custom?.item_category
      ),
      item_description: custom.parcel_description,
      weight: custom.weight,
      quantity: custom.quantity,
      value: custom.value,
      country: {
        countryCode: custom.country_of_origin,
        name: this.CountryList.find(
          (country: IntlCountryCode) =>
            country.code === custom.country_of_origin
        ),
      },
    };
  }
  getSelectedCountry(event: any) {
    this.selectedCountry = {
      data: event.value.country,
      isParcel: this.isParcel,
    };
    this.commonService.getCountryValue(this.selectedCountry);
  }
  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  getCategory(category: string){
    this.isCOD = false;
    this.isFeatureCODChecked = false;
    this.parcelDetailsForm.controls['codCheck'].setValue(false);
    this.parcelDetailsForm.controls['insuranceCheck'].setValue(false);
    if (this.showCOD()) {
      this.getCODVal()
    }
    if (this.isMelPlus && this.isMelPlusCod && this.isfetaureMelPlus) {
      this.getMelCODVal();
    }
    this.commonService.googleEventPush({
      event: 'select_parcel_category',
      event_category: 'SendParcel Pro - Single Shipments',
      event_action: 'Select Parcel Category',
      event_label: "Parcel Category -" +category,
    });
    if( category === "MelPlus"){
      this.commonService.isMelPlusSelected.next(true);
      this.isMelPlus = true;
      this.isMPS = false;
      this.parcelDetailsForm.controls['width'].setValue('');
      this.parcelDetailsForm.controls['length'].setValue('');
      this.parcelDetailsForm.controls['height'].setValue('');
      this.parcelDetailsForm.controls['weight'].setValue('');
      this.parcelDetailsForm.controls['width'].setValidators([
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
        Validators.max(25),
      ]);
      this.parcelDetailsForm.controls['length'].setValidators([
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
        Validators.max(35),
      ]);
      this.parcelDetailsForm.controls['height'].setValidators([
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
        Validators.max(5),
      ]);
      this.parcelDetailsForm.controls['weight'].setValidators([
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
        Validators.max(2),
      ]);
      this.commonService.isMPSSelected.next(false);
    } else if(category === "Parcel"){
        this.isMelPlus = false;
        this.isMPS = false;
        this.parcelDetailsForm.controls['weight'].setValue('');
        this.parcelDetailsForm.controls['weight'].setValidators([
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
        Validators.max(60),
      ]);
      this.commonService.isMPSSelected.next(false);
    } else if(category === "MPS") {
      this.isMPS = true;
      this.isMelPlus = false;
      this.commonService.isMPSSelected.next(true);
    } else {
      this.commonService.isMelPlusSelected.next(false);
      this.isMelPlus = false;
      this.isMPS = false;
      this.parcelDetailsForm.controls['width'].setValidators([
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
      ]);
      this.parcelDetailsForm.controls['height'].setValidators([
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
      ]);
      this.parcelDetailsForm.controls['length'].setValidators([
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
      ]);
      this.parcelDetailsForm.controls['weight'].setValidators([
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
      ]);
      this.commonService.isMPSSelected.next(false);
    }
  }
  patchParcelDetailsForm(parcelDetails: any) {
    let data: any = {
      category: parcelDetails.category,
      category_details: parcelDetails.category_details,
      height: parcelDetails.height,
      length: parcelDetails['length'],
      parcelNotes: parcelDetails.notes,
      sender_ref: parcelDetails.sender_ref,
      premiumAmt: parcelDetails.insured_premium,
      sum_insured:
        parcelDetails.sum_insured === 0 ? '' : parcelDetails.sum_insured,
      volumetricWeight: parcelDetails.volumetric_weight,
      chargeableWeight: parcelDetails.chargeable_weight,
      weight: parcelDetails.weight,
      width: parcelDetails.width,
    };
    if (parcelDetails.type === 'DOMESTIC') {
      data = {
        ...data,
        amount: parcelDetails.cod_amount === 0 ? '' : parcelDetails.cod_amount,
        content: parcelDetails.description,
      };
      this.parcelDetailsForm.patchValue(data);
      this.isCOD = parcelDetails.cod_amount ? true : false;
      this.isFeatureCODChecked = parcelDetails.cod_amount ? true : false;
      this.isIssuredDOM = parcelDetails.sum_insured ? true : false;
      this.parcelDetailsForm
        .get('codCheck')
        ?.setValue(!!parcelDetails.cod_amount);
      this.parcelDetailsForm
        .get('insuranceCheck')
        ?.setValue(!!parcelDetails.sum_insured);
    } else if (parcelDetails.type === 'INTERNATIONAL') {
      this.getProduct({ value: parcelDetails.product });
      data = {
        ...data,
        // category_details: '',
        // customs_declarations: this.fb.array([this.createItem()])
        product: parcelDetails.product,
      };
      this.category_item = data.category;
      this.parcelAbroadForm.patchValue(data);
      this.isIssuredIntl = parcelDetails.sum_insured ? true : false;
      this.parcelAbroadForm
        .get('insuranceCheck')
        ?.setValue(!!parcelDetails.sum_insured);
    }
    if (parcelDetails.category === 'MPS') {
      this.isMPS = true;
      data.totalInsured = parcelDetails.total_sum_insured;
      data.totalPremiumAmount = parcelDetails.insured_premium;
      data.sum_insured = parcelDetails.sum_insured;
      data.totalWeight = parcelDetails.total_mps_weight;
      data.insuranceCheck = parcelDetails.is_insured;
      data = {
        ...data,
        mps_child_declarations : this.setChildShipmentData(parcelDetails.parcel_Info.children)
      };
      this.mpsDetailsForm.patchValue(data);
      if (data?.mps_child_declarations && data?.mps_child_declarations?.length > 0) {
        const customsArray = this.mpsDetailsForm.get('mps_child_declarations') as FormArray;
        customsArray.clear();
        if(customsArray){
          data?.mps_child_declarations?.forEach((customsDeclaration:any) => {
            customsArray.push(this.fb.group(customsDeclaration));
          });
        }
      }
    } else {
      this.isMPS = false;
    }
    this.cdr.detectChanges();
  }
  get product_categories(): string[] {
    return Array.from(this.category.keys());
  }
  get item_categories(): any[] | undefined {
    return this.category.get(this.product_category);
  }
  createItem(item?: ICustomDetailFormGroup) {
    return this.fb.group(
      {
        parcel_type: [item ? item.parcel_type : '', [Validators.required]],
        description: [''],
        item_description: [
          item ? item.item_description : '',
          [Validators.required],
        ],
        quantity: [
          item ? item.quantity : '',
          [
            Validators.required,
            Validators.pattern(this.commonService.numericWithDecimalOnly),
          ],
        ],
        value: [
          item ? item.value : '',
          [
            Validators.required,
            Validators.pattern(this.commonService.numericWithDecimalOnly),
          ],
        ],
        weight: [
          item ? item.weight : '',
          [
            Validators.required,
            Validators.pattern(this.commonService.numericWithDecimalOnly),
          ],
        ],
        // chargeableWeight: [item ? item.chargeableWeight : 0],
        country: [item ? item.country : '', [Validators.required]],
      },
      { validator: this.requiredIfType() }
    );
  }
  resetInsurance() {
    this.parcelAbroadForm.controls['sum_insured'].setValue('');
    this.parcelAbroadForm.controls['insuranceCheck'].setValue(false);
    this.parcelDetailsForm.controls['sum_insured'].setValue('');
    this.parcelDetailsForm.controls['insuranceCheck'].setValue(false);
  }
  openSuccessDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { isreturnorder: this.isReturnOrder };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = this.isEditOrder || this.isReturnOrder? '325px' : '410px';
    dialogConfig.maxWidth = '680px';
    this.dialog.open(ModalDialogComponent, dialogConfig);
  }
  requiredIfType() {
    return (control: AbstractControl) => {
      if (control.get('type')?.value != 10) return null;
      let error = null;
      if (!control.get('name')?.value) error = { nameRequired: true };
      if (!control.get('pay')?.value) error = { ...error, payRequired: true };
      return error;
    };
  }
  get customs_declarations() {
    return this.parcelAbroadForm.get('customs_declarations') as FormArray;
  }
  addItem() {
    this.customs_declarations.push(this.createItem());
    this.getDisableStatus();
  }
  getDisableStatus() {
    if (this.customs_declarations.value.length > 1) {
      this.isDisable = false;
    } else {
      this.isDisable = true;
    }
  }
  isRemovable() {
    return this.customs_declarations.length > 1;
  }
  removeCustom(pos: number) {
    this.customs_declarations.removeAt(pos);
    this.getDisableStatus();
  }
  getInsuranceValDOM(val: any) {
    this.isIssuredDOM = val.checked;
    if (!this.isIssuredDOM) {
      this.parcelDetailsForm.controls['sum_insured'].setValue('');
      this.parcelDetailsForm.controls['sum_insured'].setValidators(null);
      this.parcelDetailsForm.controls['sum_insured'].updateValueAndValidity();
    } else {
      this.parcelDetailsForm.controls['sum_insured'].setValue('');
      this.parcelDetailsForm.controls['sum_insured'].setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(5000),
        Validators.pattern(this.commonService.numericWithDecimalOnly),
      ]);
      this.parcelDetailsForm.controls['sum_insured'].updateValueAndValidity();
    }
  }
  handleLabel() {
    if (this.isEditOrder) {
      return `${this.languageForm.save_changes}`;
    } else if (this.isReturnOrder) {
      return 'Confirm & Submit';
    }
    return `${this.languageForm.complete}`;
  }
  getInsuranceValIntl(val: any) {
    this.isIssuredIntl = val.checked;
    if (!this.isIssuredIntl) {
      this.parcelAbroadForm.controls['sum_insured'].setValue('');
      this.parcelAbroadForm.controls['sum_insured'].setValidators(null);
      this.parcelAbroadForm.controls['sum_insured'].updateValueAndValidity();
    } else {
      this.parcelDetailsForm.controls['sum_insured'].setValue('');
      this.parcelAbroadForm.controls['sum_insured'].setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(5000),
        Validators.pattern(this.commonService.numericWithDecimalOnly),
      ]);
      this.parcelAbroadForm.controls['sum_insured'].updateValueAndValidity();
    }
  }
  errorHandler(field: string, val: string) {
    return this.parcelDetailsForm.controls[field].hasError(val);
  }
  errorHandlerParcelAbrd(field: string, val: string) {
    return this.parcelAbroadForm.controls[field].hasError(val);
  }
  errorHandlerAbrd(field: any, val: string, i: any) {
    return this.customs_declarations.controls[i].get(field)?.hasError(val);
  }
  getCODVal() {
    const amountControl = this.parcelDetailsForm.controls['amount'];
    // this.isCOD = val.checked;
    if (!this.isCOD) {
      amountControl.setValue('');
      amountControl.setValidators(null);
      amountControl.updateValueAndValidity();
    } else {
      amountControl.setValue('');
      amountControl.setValidators([
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
        this.maxAmountValidator.bind(this)
      ]);
      amountControl.updateValueAndValidity();
    }
  }
  maxAmountValidator(control: FormControl): { [s: string]: boolean } | null {
    if (parseFloat(control.value) > COD_AMOUNT) {
        return { maxAmountExceeded: true };
    }
    return null;
}
  roundAmount() {
    const amountControl = this.parcelDetailsForm.controls['amount'];
    if (amountControl.value !== null && amountControl.value !== undefined) {
        let amount = parseFloat(amountControl.value);
        if (!isNaN(amount)) {
            // Round the amount to two decimal places
            amount = Math.round(amount * 100) / 100;
            // Update the form control with the rounded amount
            amountControl.setValue(amount.toFixed(2), { emitEvent: false });
        }
    }
    else {
      this.commonService.openErrorDialog('Error', this.languageForm.validAmount);
  }
  }
  OnChangeCODCheckbox(event:any){
    if (this.showCOD()) {
      this.isCOD = event?.checked;
      this.getCODVal()
    }
    else if (this.isMelPlus && this.isMelPlusCod && this.isfetaureMelPlus) {
      this.isFeatureCODChecked = event?.checked;
      this.getMelCODVal();
    }
  }
  getMelCODVal(){
    const amountControl = this.parcelDetailsForm.controls['amount'];
    // this.isFeatureCODChecked = val.checked;
    if (!this.isFeatureCODChecked) {
      amountControl.setValue('');
      amountControl.setValidators(null);
      amountControl.updateValueAndValidity();
    } else {
      amountControl.setValue('');
      amountControl.setValidators([
        Validators.required,
        Validators.pattern(this.commonService.numericWithDecimalOnly),
        Validators.min(1), // Minimum value
        Validators.max(MELPLUS_COD_AMOUNT) // Maximum value
      ]);
      amountControl.updateValueAndValidity();
    }
  }
    showError(message: string): void {
      this.snackBar.open(message, this.languageForm?.close, {
        duration: 5000,
        panelClass: ['snack-bar-error']
      });
    }

    VaidatedSenderPostcode(isMY: boolean, isMps : boolean){

      const pickUpDetails = this.commonService.getSelectedPickUpDetails();

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
            next: (val:any) => {
              if (!val?.data?.length) {
                this.showError(this.languageData?.invalid_sender_postcode)
              }
              else {
                if(this.isPendingPickup && this.isEditOrder){
                  this.submit_update_shipment(isMY,isMps);
                }
                else{
                  this.submit_shipment(isMY,isMps);
                }
                
              }
            }
          });
      }
      else{
        this.showError(this.languageData?.invalid_sender_postcode)
      }
    }
    submit_shipment(isMY: boolean, isMps : boolean) {

    this.isSubmitting = true;

    const query = this.isEditOrder
      ? `save-basics/${this.orderId}`
      : this.isReturnOrder ? 'save-rts' : 'save-basics';

    // For non-return orders, RecipientDetailFormComponent sets the full payload structure in commonService.getRecipientValue()
    // For return orders, we need to construct it carefully below.

      if(this.isReturnOrder  ){

      // Get the original sender's details (now recipient of the return) which were edited in RecipientDetailFormComponent.
      // RecipientDetailFormComponent.saveRecipient() updates commonService.getRecipientValue().
      // The relevant part is commonService.getRecipientValue().recipient.
      const originalSenderDetailsAsReturnRecipient = { ...this.commonService.getRecipientValue().recipient };

      if (originalSenderDetailsAsReturnRecipient && (originalSenderDetailsAsReturnRecipient.dialing_code == null || originalSenderDetailsAsReturnRecipient.dialing_code == "")) {
        originalSenderDetailsAsReturnRecipient.dialing_code = "+60";
      }

      let originalRecipientDetailsAsReturnSender: IPickupAddress; // This will be the sender of the return (original recipient)

      if(this.route.snapshot.params['id1']){
      if(Number(this.commonService.getSelectedPickupID()) === Number(this.route.snapshot.params['id1'])  ){
        this.commonService.getSenderAddress$.subscribe({
          next:(senderAddressFromService:IPickupAddress) => { // This is original recipient, now sender of return
            originalRecipientDetailsAsReturnSender = senderAddressFromService;
            if (originalRecipientDetailsAsReturnSender && (originalRecipientDetailsAsReturnSender.dialing_code == null || originalRecipientDetailsAsReturnSender.dialing_code == "")) {
              originalRecipientDetailsAsReturnSender.dialing_code = "+60";
            }
            this.commonService.setRecipientValue({
              recipient: originalSenderDetailsAsReturnRecipient, // Correct: original sender's details (edited)
              sender: originalRecipientDetailsAsReturnSender,    // Correct: original recipient's details
              save_to_contact: this.commonService.getRecipientValue().save_to_contact // Preserve this
            })
          }
        })
    } else {
      this.commonService.getCurrentSelectedPickupAddress$.subscribe({
          next:(currentSelectedPickupAddress: any) => { // This is original recipient, now sender of return
            originalRecipientDetailsAsReturnSender = currentSelectedPickupAddress;
            if (originalRecipientDetailsAsReturnSender && (originalRecipientDetailsAsReturnSender.dialing_code == null || originalRecipientDetailsAsReturnSender.dialing_code == "")) {
              originalRecipientDetailsAsReturnSender.dialing_code = "+60";
            }
            this.commonService.setRecipientValue({
              recipient: originalSenderDetailsAsReturnRecipient,
              sender: originalRecipientDetailsAsReturnSender,
              save_to_contact: this.commonService.getRecipientValue().save_to_contact
            })
          }
        })
      }
      }
    else {
    this.commonService.getCurrentSelectedPickupAddress$.subscribe({
      next:(currentSelectedPickupAddress: any) => {  // This is original recipient, now sender of return
        originalRecipientDetailsAsReturnSender = currentSelectedPickupAddress;
        if (originalRecipientDetailsAsReturnSender && (originalRecipientDetailsAsReturnSender.dialing_code == null || originalRecipientDetailsAsReturnSender.dialing_code == "")) {
          originalRecipientDetailsAsReturnSender.dialing_code = "+60";
        }
        this.commonService.setRecipientValue({
          recipient: originalSenderDetailsAsReturnRecipient,
          sender: originalRecipientDetailsAsReturnSender,
          save_to_contact: this.commonService.getRecipientValue().save_to_contact
        })
      }
    })
  }  } // End of isReturnOrder block

    const finalPayloadForApi = this.commonService.getRecipientValue();
    this.commonService
      .submitData('shipments', query, finalPayloadForApi)
      .pipe(
        takeUntil(this._onDestroy),
        map((result) => {
          if(this.commonService.isCODUbat.getValue()) {
            return {
              query: 'save-codubat',
              data: this.saveDomestic(result['data']['shipment_id'])
            };
          } else {
            const shipmentId = result['data']['shipment_id'];
            return isMY
            ? !isMps ?{
                query: 'save-domestic',
                data: this.saveDomestic(shipmentId),
              } : {query: 'save-mps', data: this.saveMps(result['data']['shipment_id'])}
            : {
                query: 'save-international',
                data: this.saveIntl(shipmentId),
              }; }
        }),
        exhaustMap(({ query, data }) =>
          this.commonService
            .submitData('shipments', query, data)
            .pipe(takeUntil(this._onDestroy))
        ),
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          const eventDetails = {
            event: 'submit_parcel_details',
            event_category: 'SendParcel Pro - Single Shipments',
            event_action: 'Submit Parcel Details',
            event_label: 'Parcel Details',
            parcel_category: this.parcelDetailsForm.value.category  || 'Null',
            parcel_width: this.parcelAbroadForm.value.width  || 'Null',
            parcel_height: this.parcelAbroadForm.value.height  || 'Null',
            parcel_length: this.parcelAbroadForm.value.length  || 'Null',
            parcel_weight: this.parcelAbroadForm.value.amount  || 'Null',
            parcel_volumetric_weight: this.parcelDetailsForm.value.volumetricWeight  || 'Null',
            parcel_chargeable_weight: this.parcelDetailsForm.value.chargeableWeight  || 'Null',
            item_description: this.parcelDetailsForm.value.content,
            status:
              'Status e.g. Picked Up / In Transit / Out For Delivery / Dropped Off',
            order_type: this.isCOD ? 'COD' : 'NON COD',
            currency: 'MYR',
            cash_on_delivery_amount: this.isCOD ? this.parcelDetailsForm.value.amount : null,
            insured_shipping_insurance: this.isIssuredDOM ? 'Yes' : 'No',
            sum_insured_amount: this.parcelAbroadForm.value.sum_insured  || 'Null',
            premium_amount: this.parcelAbroadForm.value.premiumAmt  || 'Null',
            shipment_type: 'Single Shipment',
          }
          this.commonService.googleEventPush(eventDetails);
          this.openSuccessDialog()
        },
        error: (err) => {
          // Extract errors from the API response
          const errors = err?.error?.error?.data?.errors || [];
          if (errors.length > 0) {
            // Create a consolidated error message
            const errorMessages = errors
              .map((error: { field: any; message: any; }) => `${error.field}: ${error.message}`)
              .join('\n');
            // Show the error messages in the dialog
            this.commonService.openErrorDialog('', errorMessages, 'Ok');
          } else {
            // Fallback for unexpected errors
            const message = err?.error?.error?.data?.message || this.languageForm.unexpectedError;
            this.commonService.openErrorDialog('', message, 'Ok');
          }
        },
      });
  }

  submit_update_shipment(isMY: boolean, isMps : boolean) {
    this.isSubmitting = true;
    const query = `save/${this.orderId}`;

    // // parcel details
    let parcel: Observable<any>;
    if (this.commonService.isCODUbat.getValue()) {
      parcel = this.saveDomestic(Number(this.orderId));
    } else if (isMY) { // No need for the ternary within the else if
      parcel = isMps ? this.saveMps(Number(this.orderId)) : this.saveDomestic(Number(this.orderId));
    } else {
      parcel = this.saveIntl(Number(this.orderId));
    }

      if(this.isReturnOrder  ){

        const originalSenderDetailsAsReturnRecipient = { ...this.commonService.getRecipientValue().recipient };
        if (originalSenderDetailsAsReturnRecipient && (originalSenderDetailsAsReturnRecipient.dialing_code == null || originalSenderDetailsAsReturnRecipient.dialing_code == "")) {
            originalSenderDetailsAsReturnRecipient.dialing_code = "+60";
        }

        let originalRecipientDetailsAsReturnSender: IPickupAddress;

        if(this.route.snapshot.params['id1']){
          if(Number(this.commonService.getSelectedPickupID()) === Number(this.route.snapshot.params['id1'])  ){
            this.commonService.getSenderAddress$.subscribe({
              next:(senderAddressFromService:IPickupAddress) => { // Original recipient, now sender of return
                originalRecipientDetailsAsReturnSender = senderAddressFromService;
                if (originalRecipientDetailsAsReturnSender && (originalRecipientDetailsAsReturnSender.dialing_code == null || originalRecipientDetailsAsReturnSender.dialing_code == "")) {
                  originalRecipientDetailsAsReturnSender.dialing_code = "+60";
                }
                this.commonService.setRecipientValue({
                  recipient: originalSenderDetailsAsReturnRecipient,
                  sender: originalRecipientDetailsAsReturnSender,
                  save_to_contact: this.commonService.getRecipientValue().save_to_contact
                })
              }
            })
          } else {
            this.commonService.getCurrentSelectedPickupAddress$.subscribe({
              next:(currentSelectedPickupAddress: any) => { // Original recipient, now sender of return
                originalRecipientDetailsAsReturnSender = currentSelectedPickupAddress;
                if (originalRecipientDetailsAsReturnSender && (originalRecipientDetailsAsReturnSender.dialing_code == null || originalRecipientDetailsAsReturnSender.dialing_code == "")) {
                  originalRecipientDetailsAsReturnSender.dialing_code = "+60";
                }
                this.commonService.setRecipientValue({
                  recipient: originalSenderDetailsAsReturnRecipient,
                  sender: originalRecipientDetailsAsReturnSender,
                  save_to_contact: this.commonService.getRecipientValue().save_to_contact
                })
              }
            })
          }
        }
        else {
          this.commonService.getCurrentSelectedPickupAddress$.subscribe({
            next:(currentSelectedPickupAddress: any) => { // Original recipient, now sender of return
              originalRecipientDetailsAsReturnSender = currentSelectedPickupAddress;
              if (originalRecipientDetailsAsReturnSender && (originalRecipientDetailsAsReturnSender.dialing_code == null || originalRecipientDetailsAsReturnSender.dialing_code == "")) {
                originalRecipientDetailsAsReturnSender.dialing_code = "+60";
              }
              this.commonService.setRecipientValue({
                recipient: originalSenderDetailsAsReturnRecipient,
                sender: originalRecipientDetailsAsReturnSender,
                save_to_contact: this.commonService.getRecipientValue().save_to_contact
              })
            }
          })
        }
      }
      this.commonService
          .submitData('shipments', query, {
        basic: this.commonService.getRecipientValue(),
        parcel: parcel
      })
          .subscribe({
            next: () => {
              this.isSubmitting = false;
              this.openSuccessDialog();
            },
            error: (err) => {
              if (err?.error?.error?.code === "E1003") {
                this.commonService.openSnackBar(
                  this.languageForm.editing_not_allowed_error, this.languageForm.close
                );
              } else {
                this.commonService.openSnackBar(
                  this.languageForm.unexpectedError, this.languageForm.close
                );
              }

              this.isSubmitting = false;
              this.cdr.markForCheck();
            },
          });
      }

  saveDomestic(shipmentId: any) {
    const createShipment = {
      event: 'create_shipment',
      event_category: 'SendParcel Pro - Shipment',
      event_action: 'Create Shipment Domestic',
      event_label: 'My Shipments',
    };
    this.commonService.googleEventPush(createShipment);

    let domesticData: any = {
      category: this.parcelDetailsForm.value.category,
      cod_amount: this.commonService.isCODUbat.getValue() === true ? 0 : parseFloat(this.parcelDetailsForm.value.amount),
      description: this.parcelDetailsForm.value.content,
      height: parseFloat(this.parcelDetailsForm.value.height),
      length: parseFloat(this.parcelDetailsForm.value.length),
      notes: this.parcelDetailsForm.value.parcelNotes,
      sender_ref: this.parcelDetailsForm.value.sender_ref,
      shipment_id: shipmentId,
      sum_insured: parseFloat(this.parcelDetailsForm.value.sum_insured),
      weight: parseFloat(this.parcelDetailsForm.value.weight),
      width: parseFloat(this.parcelDetailsForm.value.width),
    };
    domesticData = {
      ...domesticData,
      is_cod:
        this.parcelDetailsForm.value.codCheck === ''
          ? false
          : this.parcelDetailsForm.value.codCheck,
      is_insured:
        this.parcelDetailsForm.value.insuranceCheck === ''
          ? false
          : this.parcelDetailsForm.value.insuranceCheck,
    };
    return domesticData;
  }
  saveMps(shipmentId: any) {
    const createShipment = {
      event: 'create_shipment',
      event_category: 'SendParcel Pro - Shipment',
      event_action: 'Create Shipment MPS',
      event_label: 'My Shipments',
    };
    this.commonService.googleEventPush(createShipment);
    let mpsData: any = {
      shipment_id: shipmentId,
      category: "MPS",
      width: parseFloat(this.mpsDetailsForm.value.width),
      height: parseFloat(this.mpsDetailsForm.value.height),
      length: parseFloat(this.mpsDetailsForm.value.length),
      weight: parseFloat(this.mpsDetailsForm.value.weight),
      description: this.mpsDetailsForm.value.content,
      sender_ref: this.mpsDetailsForm.value.sender_ref,
      sum_insured: parseFloat(this.mpsDetailsForm.value.sum_insured),
      total_sum_insured: parseFloat(this.mpsDetailsForm.getRawValue().totalInsured),
      child_shipments: this.childShipmentData(
        this.mpsDetailsForm.getRawValue().mps_child_declarations
      ),
    }
    mpsData = {
      ...mpsData,
      is_insured:
        this.mpsDetailsForm.value.insuranceCheck === ''
          ? false
          : this.mpsDetailsForm.value.insuranceCheck,
    };
    return mpsData;
  }
  private validateDomesticConditions(): void {
    const categoryControl = this.parcelDetailsForm.get('category');
    const weightControl = this.parcelDetailsForm.get('weight');
    const lengthControl = this.parcelDetailsForm.get('length');
    const widthControl = this.parcelDetailsForm.get('width');
    const heightControl = this.parcelDetailsForm.get('height');

    const maxWeight = 60; // Max weight for both Parcel and Document
    const maxLongestSide = 200; // Max longest side for both Parcel and Document
    const maxDimension = 200;

    const updateValidators = () => {
      const category = categoryControl?.value;
      // Add validators based on category
      if (category === 'Parcel' || category === 'Document') {
        // Weight validation
        weightControl?.setValidators([
          Validators.required,
          Validators.max(maxWeight),
        ]);

        // Dimensions validation (length, width, height)
        [lengthControl, widthControl, heightControl].forEach(control => {
          control?.setValidators([
            Validators.required,
            Validators.max(maxLongestSide),
            Validators.max(maxDimension),
          ]);
        });
      }
    };

    const updateWarnings = () => {
      const category = categoryControl?.value;
      const weight = parseFloat(weightControl?.value) || 0;
      const length = parseFloat(lengthControl?.value) || 0;
      const width = parseFloat(widthControl?.value) || 0;
      const height = parseFloat(heightControl?.value) || 0;

      // Reset warning message
      this.warningMessage = null;

      if (category === 'Parcel' || category === 'Document') {
        let weightExceeds = false;
        let dimensionExceeds = false;

        // Weight validation: Show warning if weight > 30 and <= 60
        if (weight > 30 && weight <= maxWeight) {
          weightExceeds = true;
        }

        // Dimensions validation: Show warning if longest side > 150 and <= 200
        const longestSide = Math.max(length, width, height);
        if (longestSide > 150 && longestSide <= maxLongestSide) {
          dimensionExceeds = true;
        }

        // Show warning message if weight or dimensions exceed the limit
        if (weightExceeds || dimensionExceeds) {
          this.warningMessage = this.languageForm.extra_charges_warning_message;
        }

        // Show error message if weight > 60 or longest side > 200
        if (weight > maxWeight || longestSide > maxLongestSide) {
          this.warningMessage = this.languageForm.error_message;
        }
      }

      // Update visibility of the warning message
      this.showWarning = !!this.warningMessage;
    };

    // Subscribe to category changes to update validators dynamically
    categoryControl?.valueChanges.subscribe(() => {
      updateWarnings();
      updateValidators();
    });

    // Subscribe to value changes to update warnings dynamically
    [weightControl, lengthControl, widthControl, heightControl].forEach(control => {
      control?.valueChanges.subscribe(updateWarnings);
    });

    // Initialize validators and warnings on component load
    updateWarnings();
    updateValidators();
  }


  private validatePosLajuConditions(): void {
    const productControl = this.parcelAbroadForm.get('product');
    const categoryControl = this.parcelAbroadForm.get('category');
    const weightControl = this.parcelAbroadForm.get('weight');
    const lengthControl = this.parcelAbroadForm.get('length');
    const widthControl = this.parcelAbroadForm.get('width');
    const heightControl = this.parcelAbroadForm.get('height');

    type ProductKey = 'Pos Laju International' | 'Economy International (Air)' | 'Economy International (Surface)';
    const dimensions: Record<ProductKey, { minLength: number; minWidth: number; minHeight: number; maxLongestSide: number }> = {
      'Pos Laju International': { minLength: 16, minWidth: 1, minHeight: 11, maxLongestSide: 150 },
      'Economy International (Air)': { minLength: 16, minWidth: 1, minHeight: 11, maxLongestSide: 200 },
      'Economy International (Surface)': { minLength: 16, minWidth: 1, minHeight: 11, maxLongestSide: 200 },
    };

    const weightLimits: Record<ProductKey, Record<string, number>> = {
      'Pos Laju International': { Merchandise: 30, Document: 1 },
      'Economy International (Air)': { Parcel: 30 },
      'Economy International (Surface)': { Parcel: 30 },
    };

    const updateValidators = () => {
      const product = productControl?.value as ProductKey | undefined;
      const category = categoryControl?.value as string;

      if (product && dimensions[product] && weightLimits[product]) {
        const productDimensions = dimensions[product];
        const weightLimit = weightLimits[product]?.[category];

        // Dimensions validation
        lengthControl?.setValidators([
          Validators.required,
          Validators.min(productDimensions.minLength),
          Validators.max(productDimensions.maxLongestSide),
        ]);
        widthControl?.setValidators([
          Validators.required,
          Validators.min(productDimensions.minWidth),
          Validators.max(productDimensions.maxLongestSide),
        ]);
        heightControl?.setValidators([
          Validators.required,
          Validators.min(productDimensions.minHeight),
          Validators.max(productDimensions.maxLongestSide),
        ]);

        // Weight validation
        if (weightLimit !== undefined) {
          weightControl?.setValidators([Validators.required, Validators.max(weightLimit)]);
        }

        // Update validity for the controls
        [lengthControl, widthControl, heightControl, weightControl].forEach((control) =>
          control?.updateValueAndValidity({ emitEvent: false })
        );
      }
    };

    // Subscribe to value changes for product and category
    productControl?.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(updateValidators);
    categoryControl?.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(updateValidators);

    // Call once on initialization
    updateValidators();
  }

  saveIntl(shipmentId: any) {
    const createShipment = {
      event: 'create_shipment',
      event_category: 'SendParcel Pro - Shipment',
      event_action: 'Create Shipment International',
      event_label: 'My Shipments',
    };
    this.commonService.googleEventPush(createShipment);
    this.weightExceeded = false;
    this.dimensionExceeded = false;
    let product = this.parcelAbroadForm.value.product;
    // Mapping product values for backend
    if (product === 'Pos Laju International') {
        product = 'EMS';
    } else if (product === 'Economy International (Air)') {
        product = 'Air Parcel';
    } else if (product === 'Economy International (Surface)') {
        product = 'Surface Parcel';
    }
    let intlData: any = {
      shipment_id: shipmentId,
      sender_ref: this.parcelAbroadForm.value.sender_ref,
      product: product,
      category: this.parcelAbroadForm.value.category,
      category_details: this.parcelAbroadForm.value.category_details,
      width: parseFloat(this.parcelAbroadForm.value.width),
      height: parseFloat(this.parcelAbroadForm.value.height),
      length: parseFloat(this.parcelAbroadForm.value.length),
      weight: parseFloat(this.parcelAbroadForm.value.weight),
      country: this.commonService.getRecipientValue().recipient.country,
      notes: this.parcelAbroadForm.value.parcelNotes,
      sum_insured: isNaN(parseFloat(this.parcelAbroadForm.value.sum_insured))
        ? 0
        : parseFloat(this.parcelAbroadForm.value.sum_insured),
      customs_declarations: this.customDeclarationData(
        this.parcelAbroadForm.value.customs_declarations
      ),
    };
    intlData = {
      ...intlData,
      is_insured:
        this.parcelAbroadForm.value.insuranceCheck === ''
          ? false
          : this.parcelAbroadForm.value.insuranceCheck,
    };
    return intlData;
  }
  onChange() {
    this.selectValue.emit();
  }
  getProduct(event: any) {
    if (event.value === 'Surface Parcel' || event.value === 'Air Parcel') {
      this.isParcel = true;
      // this.parcelAbroadForm.get('category')?.setValue('Parcel');
      // this.parcelAbroadForm.controls['category_details'].setValidators([
        //   Validators.required,
      // ]);
      // if(!this.isEditOrder) {
        //   this.parcelAbroadForm.controls['category_details'].setValue('');
      // }
    } else {
      this.isParcel = false;
      this.parcelAbroadForm.controls['category'].setValidators([
        Validators.required,
      ]);
      this.category_item = '';
      if(!this.isEditOrder) {
        this.parcelAbroadForm.get('category')?.setValue('');
        // this.parcelAbroadForm.controls['category_details'].setValidators(null);
        this.parcelAbroadForm.controls['category_details'].setValue('');
      }
    }
  }
  customDeclarationData(data: any) {
    const results = data.map((response: any) => ({
      country_origin: response.country.name.code,
      hscode: response.parcel_type.hscode,
      item_category: response.parcel_type.keyword,
      item_description: response.item_description,
      quantity: parseFloat(response.quantity),
      weight: parseFloat(response.weight),
      value: parseFloat(response.value),
    }));
    return results;
  }
  childShipmentData(data: IMpsChildShipmentFormGroup[]) {
    const results = data.map((response: any) => {
      const baseObject:any = {
        category: "MPS",
        width: parseFloat(response.child_width),
        height: parseFloat(response.child_height),
        length: parseFloat(response.child_length),
        weight: parseFloat(response.child_weight),
        description: response.child_description,
        sum_insured: parseFloat(response.child_sumInsured),
        is_insured: response.child_isInsurance,
        sender_ref: this.mpsDetailsForm.controls['sender_ref'].getRawValue()
      };
      // Conditionally add more data based on the isEditOrder flag
      if (this.isEditOrder) {
        baseObject.child_shipment_id =  response.child_shipment_id;
        baseObject.deleted =  response.deleted;
      }
      return baseObject;
    });
    return results;
  }
  setChildShipmentData(data: any) {
    const results = data.map((response: any) => ({
      child_shipment_id: response.id,
      deleted : false,
      child_width: parseFloat(response.width),
      child_height: parseFloat(response.height),
      child_length: parseFloat(response.length),
      child_weight: parseFloat(response.weight),
      child_volumetric_weight: parseFloat(response.volumetric_weight),
      child_chargeable_weight: parseFloat(response.chargeable_weight),
      child_description: response.description,
      child_premAmt: parseFloat(response.insured_premium),
      child_sumInsured: parseFloat(response.sum_insured),
      child_isInsurance: response.child_isInsurance === false ? false : true
    }));
    return results;
  }

  isSubmitDisabled(formValidity: boolean) {
    let invalid = !formValidity || this.isSubmitting;
    if (this.isEditOrder) {
      invalid = invalid || !this.isValidRecipientForm;
    }
    return invalid;
  }
  getEmsCountry() {
    this.commonService.getCurrentRecipientData$.subscribe((val) => {
      if(val?.recipient?.country !== undefined) {
        if(val?.recipient && val?.recipient?.country !== 'MY') {
          this.commonService
          .getAPI('products', `query?country=${val?.recipient?.country}`, 0)
          .pipe(
            takeUntil(this._onDestroy),
            tap((response: any) => {
              this.disabledProducts = response.data.map((product: IProductDisable) => product.product);
              if(!this.isEditOrder) {
                if (this.disabledProducts) this.parcelAbroadForm.controls['product']?.setValue('')
              }
              this.updateChargeableWeight();
              this.cdr.detectChanges();
            }),
            catchError((err) => {
              this.openSnackBar(err?.message ?? this.languageData.product_list_fail_note,'Okay', 2000)
              this.goBack(0);
              return EMPTY
            }),
          )
          .subscribe();
        }
      }
    });
  }
  openSnackBar(message: string, action: string, time: number){
    this._snackBar.open(message, action, {duration: time})
  }
  getDisabledCountry(product: string) {
    return this.disabledProducts.includes(product)
  }
  showCOD(){
    return this.is_cod && !this.isReturnOrder && !this.isMelPlus && !this.isMPS;
  }
  goBack(index: number){
    this.stepper.selectedIndex = index;
  }

  canImplementNewRatePremiumAmt(){
    const form = this.isCountryMY ? this.parcelDetailsForm : this.parcelAbroadForm;
    return form.get('category')?.value?.toLowerCase() !== 'ubat' && form.get('category')?.value?.toLowerCase() !== 'melplus';
  }

}
