import { HttpClient } from '@angular/common/http';
import { environment } from '@pos/shared/environments';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { EMPTY, Observable, Subject, catchError, map, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { FormControlValidators } from 'libs/ezisend/shared/data-access/validators/form-control-validators/src/lib/form-control-validators';
import { validatePostcode } from '@pos/ezisend/shipment/data-access/helper/my-shipment-helper';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import {
  ICity,
  IResponse,
  IState,
} from '@pos/ezisend/shared/data-access/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RateCalculatorService } from '../../services/rate-calc.service';
import { RateCardResponse, RateCard } from '../../services/rate-card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';
@Component({
  selector: 'pos-rate-calc-ui',
  templateUrl: './rate-calc-ui.component.html',
  styleUrls: ['./rate-calc-ui.component.scss'],
})
export class RateCalcUiComponent implements OnInit, OnDestroy {
  @Input() showShipmentCalculator = false;
  @Input() showRateCard = false;
  @Output() RateCalcUiStatus = new EventEmitter<any>();
  @Output() formSubmit = new EventEmitter<any>();
  countryList$!: Observable<any>;
  states!: IResponse<IState[]>;
  cities!: IResponse<ICity[]>;
  statesFrom!: IResponse<IState[]>;
  citiesFrom!: IResponse<ICity[]>;
  selected = 'selected';
  stateSelected: any;
  stateFrom: any;
  initialRateCards: any[] = [];
  isLoading = false;
  isLoadingQuote = false;
  isPopulatingStateCity = false;
  isEditModeEnabled = false;
  invalidPostcodeError = false;
  showShipmentDimensions = false;
  selectedValue: string;
  selectWeight: string;
  currentZone: number | null = null;
  shippingCost: number | null = null;
  totalCost: number | null = null;
  sstAmount: number | null = null;
  SPPAPI = environment.sppUatUrl;
  protected _onDestroy = new Subject<void>();
  RateCalcUi: FormGroup = this.fb.group({
    postcode: [
      '',
      [Validators.required, Validators.minLength(4), Validators.maxLength(10)],
    ],
    weightKG: ['', [Validators.required, Validators.max(30), Validators.min(1)]],
    addWeightPrice: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(10)],
    ],
    itemLength: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(10)],
    ],
    itemWidth: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(10)],
    ],
    itemHeight: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(10)],
    ],
    itemPrice: [
      '',
      { value: '', disabled: true }, [Validators.required, Validators.minLength(1), Validators.maxLength(10)],
    ],
    itemPrice1: ['', [Validators.required, Validators.min(1), Validators.max(100), Validators.pattern(/^(?!0\d)\d+(\.\d{1,2})?$/)
    ]],
    itemPrice4: ['', [Validators.required, Validators.min(1), Validators.max(100), Validators.pattern(/^(?!0\d)\d+(\.\d{1,2})?$/)]],
    itemPrice5: ['', [Validators.required, Validators.min(1), Validators.max(100), Validators.pattern(/^(?!0\d)\d+(\.\d{1,2})?$/)]],
    addWeightPrice1: ['', [Validators.required, Validators.min(1), Validators.max(100), Validators.pattern(/^(?!0\d)\d+(\.\d{1,2})?$/)]],
    addWeightPrice4: ['', [Validators.required, Validators.min(1), Validators.max(100), Validators.pattern(/^(?!0\d)\d+(\.\d{1,2})?$/)]],
    addWeightPrice5: ['', [Validators.required, Validators.min(1), Validators.max(100), Validators.pattern(/^(?!0\d)\d+(\.\d{1,2})?$/)]],
    volumetricWeightKG: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(1), Validators.maxLength(10)],
    ],
    chargeableWeight: [
      { value: '', disabled: true }, [Validators.required, Validators.minLength(1), Validators.maxLength(10)],
    ],
    PostcodePickup: [
      '',
      [Validators.required, Validators.minLength(5), Validators.pattern(this.commonService.numericOnly)],
    ],
    PostcodeDestination: [
      '',
      [Validators.required, Validators.minLength(5), Validators.pattern(this.commonService.numericOnly)],
    ],
    city: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
    state: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
    stateFrom: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
    stateTo: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
  });
  rate_cards: any = [];
  addWeight = 'Add Weight';
  setPrice =  'Set Price';
  addAdditionalWeight = 'Add Additional Weight';
  weightLookUp: { value: number, title: string }[] = [];
  apiUrl: any;
  activeTab = 'rateCard';
  languageObj: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
    en.data;
  languageData: any;
  languageForm: any;
  constructor(public RateCalculatorService: RateCalculatorService, private fb: FormBuilder, public commonService: CommonService, private cdr: ChangeDetectorRef, private http: HttpClient, private snackBar: MatSnackBar, private translate: TranslationService) {
    this.selectWeight = '';
    this.selectedValue = '';
    // Populate weightLookUp dynamically
    for (let i = 0.5; i <= 15; i += 0.5) {
      this.weightLookUp.push({ value: i, title: i.toString() });
    }   
    this.assignLanguageLabels();
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageObj = en.data
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageObj = bm.data
      }
      this.assignLanguageLabels();
      this.fetchData();
    })
  }
  /**
   * Method Name: assignLanguageLabels
   * 
   * Input Parameters:
   *   - None
   * 
   * Output Parameters:
   *   - None
   * 
   * Purpose:
   *   - Assigns language labels based on the current language selection.
   * 
   * Author:
   *   - Clayton
   * 
   * Description:
   *   - This method sets the labels for various fields and buttons in the rate calculator form 
   *     according to the selected language.
   */
  assignLanguageLabels() {
    this.languageData = this.languageObj['rate_calulator'];
    this.languageForm = this.languageObj['form_data'];
    this.addWeight = this.languageData.add_weight  // 'Add Weight';
    this.setPrice = this.languageData.set_price    // 'Set Price';
    this.addAdditionalWeight = this.languageData.add_additional_weight // 'Add Additional Weight';
    this.rate_cards = [
      {
        zone: 1,
        first_weight: this.addWeight,
        first_price: this.setPrice,
        additional_weight: this.addAdditionalWeight,
        additional_price: this.setPrice
      },
      {
        zone: 4,
        first_weight: this.addWeight,
        first_price: this.setPrice,
        additional_weight: this.addAdditionalWeight,
        additional_price: this.setPrice,
      },
      {
        zone: 5,
        first_weight: this.addWeight,
        first_price: this.setPrice,
        additional_weight: this.addAdditionalWeight,
        additional_price: this.setPrice,
      },
    ];
  }
  // Toggles the visibility of shipment dimensions.
  //   - This method toggles the boolean value of the 'showShipmentDimensions' property, 
  //     which controls the visibility of shipment dimension fields in the UI.
  toggleShipmentDimensions() {
    this.showShipmentDimensions = !this.showShipmentDimensions;
  }
  ngOnInit() {
    this.isLoading = true;
    this.resetTypeFormFieldCuntryCityState();
    this.commonService.getCountryIsMY(true);
    this.getCountryAndStateList();
    this.updateFieldPostcodeStateCity();
    this.fetchData();
    this.isLoading = true;
    this.RateCalculatorService.getRateCalculatorData().subscribe({
      
      next: (response: RateCardResponse) => {
        if (response.data.rate_cards == null || response.data.rate_cards.length < 1) {
          this.RateCalculatorService._tabName.next('rateCard')
          if (response.data.rate_cards === null) {
            this.toggleEditMode();
        }
          this.cdr.detectChanges();
        } else {
          this.RateCalculatorService._tabName.next('shipment')
          this.cdr.detectChanges();
        }
        this.formMapper(response.data.rate_cards);
        this.cdr.detectChanges();
        if (!this.isRateCardConfigured()) {
          this.snackBar.open(this.languageData.configure_your_rate_card, 'Close', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snack-bar-warning']
          });
          this.isLoadingQuote = false;
          this.cdr.detectChanges();
          
        
          return;
        }
      },
      error: (error: any) => {
        let errorMessage = this.languageData.error_while_fetching_rate_calculation_data;
        if (error && error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        this.snackBar.open(errorMessage, this.languageForm.close, {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snack-bar-error'],
        });
      }
    });
    this.RateCalculatorService.getActiveTab().subscribe(tab => {
      this.activeTab = tab;
  });
  }
  /**
 * Method Name: getRateCalculatorData
 * 
 * Input Parameters:
 *   - None
 * 
 * Output Parameters:
 *   - Observable<RateCardResponse> - An observable containing the rate card response data.
 * 
 * Purpose:
 *   - Fetches rate card data from the API.
 * 
 * Author:
 *   - IlyasAhmed
 * 
 * Description:
 *   - This method sends a GET request to retrieve rate card data from the server. 
 *     It maps the response to ensure that the required data is present, and handles 
 *     any errors that might occur during the HTTP request.
 */
  getRateCalculatorData(): Observable<RateCardResponse> {
    return this.http.get<RateCardResponse>(`${this.apiUrl}/rate-cards`).pipe(
      map(response => {
        if (!response || !response.data || !response.data.rate_cards) {
          throw new Error(this.languageData.no_rate_cards_available);
        }
        return response;
      }),
      catchError(error => {
        // Handle any errors that occur during the HTTP request.
        return throwError(() => new Error(error.message || this.languageData.error_while_fetching_rate_data));
      })
    );
  }
  /**
   * Method Name: fetchData
   * 
   * Input Parameters:
   *   - None
   * 
   * Output Parameters:
   *   - None
   * 
   * Purpose:
   *   - Fetches data required for the form.
   * 
   * Author:
   *   - IlyasAhmed
   * 
   * Description:
   *   - This method fetches the initial rate card data required for the form and then 
   *     maps this data into the form fields using the 'formMapper' method.
   */
  fetchData() {
    this.RateCalculatorService.getRateCalculatorData().subscribe({
      next: (response: RateCardResponse) => {
        if (response && response.data.rate_cards.length > 0) {
          this.rate_cards = response.data.rate_cards;
          this.RateCalculatorService._tabName.next('shipment')
          this.cdr.detectChanges();
        } else {
          this.rate_cards = this.getInitialRateCards();
          this.RateCalculatorService._tabName.next('rateCard');
          this.cdr.detectChanges();
        }
        this.initialRateCards = JSON.parse(JSON.stringify(this.rate_cards));
        this.formMapper(this.rate_cards);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.rate_cards = this.getInitialRateCards();
        this.snackBar.open(this.languageData.failed_to_fetch_data + ': ' + (error.message || ''), this.languageForm.close, {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snack-bar-error'],
        });
      }
    });
  }
  /**
 * Method Name: getInitialRateCards
 * 
 * Input Parameters:
 *   - None
 * 
 * Output Parameters:
 *   - An array of objects containing initial rate card data with null values.
 * 
 * Purpose:
 *   - To provide a default structure for rate cards with null values.
 * 
 * Author:
 *   - IlyasAhmed
 * 
 * Description:
 *   - This method returns an array of objects representing the initial state 
 *     of rate cards. Each object contains properties for `first_weight`, 
 *     `first_price`, `additional_weight`, and `additional_price`, all initialized to null.
 */
  private getInitialRateCards() {
    return [{
      first_weight: null,
      first_price: null,
      additional_weight: null,
      additional_price: null
    }, {
      first_weight: null,
      first_price: null,
      additional_weight: null,
      additional_price: null
    }, {
      first_weight: null,
      first_price: null,
      additional_weight: null,
      additional_price: null
    }];
  }
  /**
 * Method Name: isRateCardConfigured
 * 
 * Input Parameters:
 *   - None
 * 
 * Output Parameters:
 *   - A boolean value indicating whether all rate cards are configured correctly.
 * 
 * Purpose:
 *   - To check if all rate cards are configured with valid and non-default values.
 * 
 * Author:
 *   - IlyasAhmed
 * 
 * Description:
 *   - This method iterates over the `rate_cards` array and verifies that each card 
 *     has valid values for `first_weight`, `first_price`, `additional_weight`, 
 *     and `additional_price`. The method checks if these values are not null, 
 *     and ensures that they are not equal to default values defined in the component 
 *     (`addWeight`, `setPrice`, `addAdditionalWeight`). If all cards meet these 
 *     conditions, the method returns `true`; otherwise, it returns `false`.
 */
  isRateCardConfigured(): boolean {
    return this.rate_cards.every((card: { first_weight: string; first_price: string; additional_weight: string; additional_price: string; }) => {
      return card.first_weight && card.first_weight !== this.addWeight &&
             card.first_price && card.first_price !== this.setPrice &&
             card.additional_weight && card.additional_weight !== this.addAdditionalWeight &&
             card.additional_price && card.additional_price !== this.setPrice;
    });
  }
  isPlaceholder(value: string): boolean {
    return value === this.setPrice || value === this.addWeight || value === this.addAdditionalWeight;
  }
  /**
 * Method Name: onGenerateQuote
 * 
 * Input Parameters:
 *   - None
 * 
 * Output Parameters:
 *   - None
 * 
 * Purpose:
 *   - To initiate the process of generating a quote based on the rate card configuration 
 *     and the provided postcodes. This method checks if the rate card is configured, 
 *     retrieves the zone data, and generates the quote accordingly.
 * 
 * Author:
 *   - IlyasAhmed
 * 
 * Description:
 *   - This method first triggers change detection to ensure the latest state of the 
 *     component is captured. It checks if the rate card is configured using the 
 *     `isRateCardConfigured` method. If not configured, it shows a warning message 
 *     using a snackbar and exits. If the origin and destination postcodes are provided, 
 *     it makes an API call to get the zone data via `RateCalculatorService.getZone`. 
 *     Upon receiving the zone data, it assigns the zone to `currentZone` and calls 
 *     `generateQuote` to proceed with quote generation. The method also handles 
 *     possible errors during the API call and ensures the loading state (`isLoadingQuote`) 
 *     is appropriately managed.
 */
  onGenerateQuote() {
    this.cdr.detectChanges();
    this.getRateCalculatorData();
    this.fetchData();
    this.cdr.detectChanges();
    const originPostcode = this.RateCalcUi.get('PostcodePickup')?.value;
    const destinationPostcode = this.RateCalcUi.get('PostcodeDestination')?.value;
    if (originPostcode && destinationPostcode) {
      this.isLoadingQuote = true; // Start loading
      this.RateCalculatorService.getZone(originPostcode, destinationPostcode).subscribe({
        next: zoneData => {
          this.currentZone = zoneData.data.zone;
          this.generateQuote();
          this.cdr.detectChanges();
        },
        error: err => {
          this.invalidPostcodeError = true;
          this.snackBar.open(this.languageData.error_fetching_zone_data, this.languageForm.close, {
            duration: 3000,
            panelClass: ['snack-bar-error']
          });
          this.isLoadingQuote = false;
          this.cdr.detectChanges();
        },
        complete: () => {
          this.isLoadingQuote = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.isLoadingQuote = false;
      this.cdr.detectChanges();
    }
  }
  /**
 * Method Name: generateQuote
 * 
 * Input Parameters:
 *   - None
 * 
 * Output Parameters:
 *   - None
 * 
 * Purpose:
 *   - To generate a shipping quote based on the chargeable weight and the current zone.
 * 
 * Author:
 *   - IlyasAhmed
 * 
 * Description:
 *   - This method first checks if `currentZone` is available. If not, it shows an information 
 *     message to the user via a snackbar and exits. It then calculates the `chargeableWeight` 
 *     by comparing the actual weight (`weightKG`) and the volumetric weight 
 *     (`volumetricWeightKG`). If the `chargeableWeight` is invalid, an error message is shown 
 *     using a snackbar, and the method exits. Otherwise, it calls the 
 *     `RateCalculatorService.calculateShippingCost` method, passing the `currentZone` and 
 *     `chargeableWeight`. Upon receiving a response, it calculates the SST (6% of the shipping cost), 
 *     the total cost, and updates the relevant properties. If an error occurs during the 
 *     API call, an appropriate error message is displayed and the cost-related properties 
 *     are reset.
 */
  generateQuote() {
    if (!this.currentZone) {
      this.snackBar.open(this.languageData.zone_information_not_available, this.languageForm.close, {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['snack-bar-info'],
      });
      return;
    }
    // Use chargeableWeight if available, otherwise default to weightKG
    const actualWeight = parseFloat(this.RateCalcUi.get('weightKG')?.value || '0');
    const volumetricWeight = parseFloat(this.RateCalcUi.get('volumetricWeightKG')?.value || '0');
    const chargeableWeight = Math.max(actualWeight, volumetricWeight);
    if (isNaN(chargeableWeight)) {
      this.snackBar.open(this.languageData.invalid_weight_input, this.languageForm.close, {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['snack-bar-error'],
      });
      return;
    }
    this.RateCalculatorService.calculateShippingCost(this.currentZone, chargeableWeight).subscribe({
      next: cost => {
        this.shippingCost = cost;
        // Calculate SST (6% of the shipping cost)
        this.sstAmount = cost * 0.06;
        // Calculate the total cost
        this.totalCost = cost + this.sstAmount;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        let errorMessage = this.languageData.error_calculating_shipping_cost;
        if (error && error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        this.snackBar.open(errorMessage, this.languageForm.close, {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snack-bar-error'],
        });
        // Reset costs on error
        this.shippingCost = null;
        this.totalCost = null;
        this.sstAmount = null;
      }
    });
  }
  /**
 * Method Name: calculateWeights
 * 
 * Input Parameters:
 *   - None
 * 
 * Output Parameters:
 *   - None
 * 
 * Purpose:
 *   - To calculate the volumetric weight and determine the chargeable weight based on 
 *     item dimensions and actual weight.
 * 
 * Author:
 *   - IlyasAhmed
 * 
 * Description:
 *   - This method retrieves the length, width, height, and actual weight from the form (`RateCalcUi`). 
 *     It then calculates the volumetric weight using the formula: 
 *     (length * width * height) / 5000. The chargeable weight is determined as the maximum of the 
 *     actual weight and the volumetric weight. Finally, the form is updated with the calculated 
 *     volumetric weight and chargeable weight, each rounded to two decimal places.
 */
  calculateWeights() {
    const length = this.RateCalcUi.get('itemLength')?.value;
    const width = this.RateCalcUi.get('itemWidth')?.value;
    const height = this.RateCalcUi.get('itemHeight')?.value;
    const actualWeight = parseFloat(this.RateCalcUi.get('weightKG')?.value);
    if (length && width && height && !isNaN(actualWeight)) {
      const volumetricWeight = (length * width * height) / 5000;
      const chargeableWeight = Math.max(actualWeight, volumetricWeight);
      this.RateCalcUi.patchValue({
        volumetricWeightKG: volumetricWeight.toFixed(2),
        chargeableWeight: chargeableWeight.toFixed(2),
      });
    }
  }
  /**
 * Method Name: trigger
 * 
 * Input Parameters:
 *   - None
 * 
 * Output Parameters:
 *   - None
 * 
 * Purpose:
 *   - To initialize form behaviors and validators for postcode fields based on the selected country.
 * 
 * Author:
 *   - IlyasAhmed
 * 
 * Description:
 *   - This method is responsible for setting up the form state and validators for the `postcode` field 
 *     based on the selected country. It subscribes to the `getCurrentIsCountryMY$` observable to check 
 *     if the selected country is Malaysia (MY). If so, it applies specific numeric validators to the 
 *     `postcode` field. If not, it applies alphanumeric validators. Additionally, it subscribes to 
 *     value changes in the `postcode` and `country` fields to dynamically adjust validators based on 
 *     user input and selections. This setup ensures that the form behaves correctly based on the selected country.
 */
  trigger() {
    // this.RateCalcUi.patchValue(this.contactDetails);
    this.onCreateGroupFormValueChange();
    this.commonService.getCurrentIsCountryMY$.subscribe((isMY: boolean) => {
      /* to reset custom postcode field validator */
      if (isMY) {
        this.RateCalcUi.get('postcode')?.setValidators(null);
        this.RateCalcUi.get('postcode')?.setValidators([Validators.required, Validators.minLength(5), Validators.pattern(this.commonService.numericOnly)]);
      } else {
        this.RateCalcUi.get('postcode')?.setValidators(null);
        this.RateCalcUi.get('postcode')?.setValidators([Validators.required, Validators.minLength(3), Validators.pattern(this.commonService.alphaOnly)]);
      }
      this.RateCalcUi.get('postcode')?.updateValueAndValidity();
      return isMY;
    });
    this.RateCalcUi
      .get('postcode')
      ?.valueChanges.pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.RateCalcUi.get('postcode')?.setValidators(null);
        this.isLoading = false;
        this.RateCalcUi
          .get('postcode')
          ?.setValidators([
            Validators.required,
            Validators.minLength(5),
            Validators.pattern(this.commonService.numericOnly),
          ]);
      });
    this.RateCalcUi
      .get('country')
      ?.valueChanges.pipe(takeUntil(this._onDestroy))
      .subscribe((data) => {
        if (data.name.code === 'MY') {
          this.RateCalcUi
            .get('postcode')
            ?.valueChanges.pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.RateCalcUi.get('postcode')?.setValidators(null);
              this.RateCalcUi
                .get('postcode')
                ?.setValidators([
                  Validators.required,
                  Validators.minLength(5),
                  Validators.pattern(this.commonService.numericOnly),
                ]);
            });
        } else if (data.name.code !== 'MY') {
          this.RateCalcUi
            .get('postcode')
            ?.valueChanges.pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.isLoading = false;
              this.RateCalcUi.get('postcode')?.setValidators(null);
              this.RateCalcUi
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
   /**
   * Method Name: ngOnDestroy
   * Purpose:
   *   - Destroys the component.
   * 
   * Author:
   *   - IlyasAhmed
   * 
   * Description:
   *   - This method is triggered when the component is destroyed. It cleans up the component 
   *     by completing the '_onDestroy' Subject to unsubscribe from all active subscriptions.
   */
  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  /** Method Name: OnFormSubmit
   *  Description:
 *   - This method is triggered when the form is submitted. It calls the `datamapper` method to map 
 *     the form data into the desired format and assigns the resulting data to a local variable `data`.
 *     This method prepares the data for further processing, such as sending it to a server or using 
 *     it in the application.
 */
  OnFormSubmit(): void {
    const data = this.datamapper();
  }
/**
 * Method Name: submitRateCalc
 * 
 * Input Parameters:
 *   - None
 * 
 * Output Parameters:
 *   - None
 * 
 * Purpose:
 *   - To submit the rate calculation data to the server and update the state based on the response.
 * 
 * Author:
 *   - IlyasAhmed
 * 
 * Description:
 *   - This method maps the rate calculation data using the `datamapper` method and submits it to 
 *     the server using the `postRateCalculator` method of `RateCalculatorService`. Upon successful 
 *     submission, it updates the initial state of rate cards, toggles the edit mode, and changes 
 *     the tab name using `_tabName` subject. It also forces a UI update after a short delay. 
 *     If the form is not valid, it triggers change detection twice to ensure the UI reflects the 
 *     current state.
 */
  submitRateCalc() {   
    this.cdr.detectChanges();
    const dataToSubmit = this.datamapper();
    this.RateCalculatorService.isSubmitted = true;
    this.RateCalculatorService.postRateCalculator(dataToSubmit).subscribe({
      next: (response: any) => {
        this.RateCalculatorService.isSubmitted = false;
        // to update initial state of rate card when we click on save and apply 
        this.initialRateCards = JSON.parse(JSON.stringify(this.rate_cards));
        this.toggleEditMode();
        this.RateCalculatorService._tabName.next('none')
        this.cdr.detectChanges();
        setTimeout(() => {
          this.RateCalculatorService._tabName.next('shipment')
          this.getRateCalculatorData();
          this.cdr.detectChanges();
        },200);
        this.cdr.detectChanges();
      }
    });
    if (!this.RateCalcUi.valid) {
      this.cdr.detectChanges();
      this.cdr.detectChanges();
    }
  }
  /**
 * Method Name: hasError
 * 
 * Input Parameters:
 *   - errorType: 'min' | 'max' - The type of error to check for.
 * 
 * Output Parameters:
 *   - Returns a boolean indicating whether any of the specified controls have the given error type.
 * 
 * Purpose:
 *   - To check if any of the specified form controls have a specific type of validation error.
 * 
 * Author:
 *   - IlyasAhmed
 * 
 * Description:
 *   - This method checks a predefined list of form controls to determine if any of them have the 
 *     specified type of error (either 'min' or 'max'). It returns `true` if at least one control 
 *     has the error, otherwise it returns `false`.
 */
  hasError(errorType: 'min' | 'max'): boolean {
    const controlsToCheck = [
      'itemPrice1',
      'itemPrice4',
      'itemPrice5',
      'addWeightPrice1',
      'addWeightPrice4',
      'addWeightPrice5'
    ];
    return controlsToCheck.some(controlName => 
      this.RateCalcUi.get(controlName)?.hasError(errorType) ?? false
    );
  }
  /** Description:
 *   - This method utilizes the `hasError` method to check if any of the specified form controls 
 *     have a 'min' validation error. It returns `true` if such an error is found, otherwise `false`.
 */
  hasMinError(): boolean {
    return this.hasError('min');
  }
  /** Description:
 *   - This method utilizes the `hasError` method to check if any of the specified form controls 
 *     have a 'max' validation error. It returns `true` if such an error is found, otherwise `false`.
 */
  hasMaxError(): boolean {
    return this.hasError('max');
  }
  /**
 * Method Name: formatPrices
 * Description:
 *   - This method iterates over each rate card in the `rate_cards` array and formats the `first_price`
 *     and `additional_price` fields using the `formatPrice` method. This ensures that all price values 
 *     adhere to a consistent format.
 */
  formatPrices() {
    this.rate_cards.forEach((card: any) => {
      card.first_price = this.formatPrice(card.first_price);
      card.additional_price = this.formatPrice(card.additional_price);
    });
  }
  /**
 * Method Name: formatPrice
 * Description:
 *   - This method takes a price value, whether it is a number or a string, converts it to a floating-point number,
 *     and returns it as a string with two decimal places. This ensures consistency in how prices are displayed.
 */
  formatPrice(price: number | string): string {
    return parseFloat(price.toString()).toFixed(2);
  }
  /**
 * Method Name: datamapper
 * 
 * Input Parameters:
 *   - None
 * 
 * Output Parameters:
 *   - An object containing an array of rate cards with zones and safely parsed weight and price values.
 * 
 * Purpose:
 *   - To map and structure rate card data into a format that can be used for further processing or submission.
 * 
 * Author:
 *   - IlyasAhmed
 * 
 * Description:
 *   - This method constructs an object containing rate card data for different zones. It uses the `parseSafely` method
 *     to ensure that the weight and price values are correctly parsed before being included in the rate cards array.
 *     Each rate card is associated with a specific zone and includes `first_weight`, `first_price`, `additional_weight`,
 *     and `additional_price` fields.
 */
    datamapper() {
    return {
      rate_cards: [
        {
          zone: 1,
          first_weight: this.parseSafely(this.rate_cards[0].first_weight),
          first_price: this.parseSafely(this.rate_cards[0].first_price),
          additional_weight: this.parseSafely(this.rate_cards[0].additional_weight),
          additional_price: this.parseSafely(this.rate_cards[0].additional_price)
        },
        {
          zone: 2,
          first_weight: this.parseSafely(this.rate_cards[0].first_weight),
          first_price: this.parseSafely(this.rate_cards[0].first_price),
          additional_weight: this.parseSafely(this.rate_cards[0].additional_weight),
          additional_price: this.parseSafely(this.rate_cards[0].additional_price)
        },
        {
          zone: 3,
          first_weight: this.parseSafely(this.rate_cards[0].first_weight),
          first_price: this.parseSafely(this.rate_cards[0].first_price),
          additional_weight: this.parseSafely(this.rate_cards[0].additional_weight),
          additional_price: this.parseSafely(this.rate_cards[0].additional_price)
        },
        {
          zone: 4,
          first_weight: this.parseSafely(this.rate_cards[1].first_weight),
          first_price: this.parseSafely(this.rate_cards[1].first_price),
          additional_weight: this.parseSafely(this.rate_cards[1].additional_weight),
          additional_price: this.parseSafely(this.rate_cards[1].additional_price)
        },
        {
          zone: 5,
          first_weight: this.parseSafely(this.rate_cards[2].first_weight),
          first_price: this.parseSafely(this.rate_cards[2].first_price),
          additional_weight: this.parseSafely(this.rate_cards[2].additional_weight),
          additional_price: this.parseSafely(this.rate_cards[2].additional_price)
        },
      ]
    };
  }
  /**
 * Method Name: mapObjects
 * 
 * Input Parameters:
 *   - index: number - The index of the rate card in the `rate_cards` array to be mapped.
 *   - rateCard: RateCard - The rate card object containing weight and price values to be mapped.
 * 
 * Output Parameters:
 *   - None
 * 
 * Purpose:
 *   - To map and update the `rate_cards` array at a specific index with the parsed values from the provided `rateCard` object.
 * 
 * Author:
 *   - IlyasAhmed
 * 
 * Description:
 *   - This method updates the `rate_cards` array at the given `index` with the values from the `rateCard` object. 
 *     The `parseSafely` method is used to ensure that the weight and price values are correctly parsed before being 
 *     assigned to the respective fields (`first_weight`, `first_price`, `additional_weight`, `additional_price`) 
 *     in the `rate_cards` array.
 */
  private mapObjects(index: number, rateCard: RateCard): void {
    this.rate_cards[index].first_weight = this.parseSafely(rateCard.first_weight);
    this.rate_cards[index].first_price = this.parseSafely(rateCard.first_price);
    this.rate_cards[index].additional_weight = this.parseSafely(rateCard.additional_weight);
    this.rate_cards[index].additional_price = this.parseSafely(rateCard.additional_price);
  }
  /**
   * Method Name: formMapper
   * 
   * Input Parameters:
   *   - rateCards: RateCard[] - Array of rate cards to map into the form.
   * 
   * Output Parameters:
   *   - None
   * 
   * Purpose:
   *   - Maps the rate card form values.
   * 
   * Author:
   *   - IlyasAhmed
   * 
   * Description:
   *   - This method maps the provided rate card data into the form controls to populate 
   *     the form fields with the relevant information.
   */
  formMapper(rateCards: RateCard[]): void {
    rateCards.forEach((rateCard: RateCard, index: number) => {
      if (index <= 2) {
        this.mapObjects(index, rateCard);
      } else {
        this.mapObjects(index - 2, rateCard);
      }
    });
    // Format prices after mapping
    this.rate_cards.forEach((card: any) => {
      card.first_price = this.formatPrice(card.first_price);
      card.additional_price = this.formatPrice(card.additional_price);
    });
  }
  /**
 * Method Name: parseSafely
 * 
 * Input Parameters:
 *   - x: string | number | null | undefined - The input value that needs to be parsed into a number.
 * 
 * Output Parameters:
 *   - Returns: number - The parsed number value or 0 if the input is invalid, null, or undefined.
 * 
 * Purpose:
 *   - To safely parse a given value into a number, ensuring that null, undefined, or non-numeric values are handled gracefully by returning 0.
 * 
 * Author:
 *   - IlyasAhmed
 * 
 * Description:
 *   - This method checks the input `x` to see if it is null or undefined, and if so, returns 0. 
 *     If `x` is a valid string or number, it attempts to parse it as a float. If the parsed result 
 *     is `NaN` (Not-a-Number), the method returns 0; otherwise, it returns the parsed number.
 */
  parseSafely(x: string | number | null | undefined): number {
    if (x === null || x === undefined) return 0;
    const parsed = parseFloat(x.toString());
    return isNaN(parsed) ? 0 : parsed;
  }
  /**
 * Method Name: toggleEditMode
 * 
 * Input Parameters:
 *   - shouldCancel: boolean - Optional parameter to indicate whether changes should be canceled.
 * 
 * Output Parameters:
 *   - None
 * 
 * Purpose:
 *   - To toggle the edit mode state on or off, with an optional parameter to cancel any unsaved changes and revert to the initial state.
 * 
 * Author:
 *   - IlyasAhmed
 * 
 * Description:
 *   - If `shouldCancel` is true and the edit mode is currently enabled, the method will revert any changes made and disable the edit mode.
 *     If `shouldCancel` is false or omitted, the method will toggle the edit mode state. When enabling edit mode, it will also save 
 *     the current state of `rate_cards` as `initialRateCards` for potential reversion.
 */
  toggleEditMode(shouldCancel: boolean = false) {
    if (shouldCancel) {
      // Revert changes if shouldCancel is true and currently in edit mode
      this.cancelChanges();
      this.isEditModeEnabled = false;
    } else {
      // Toggle edit mode normally
      this.isEditModeEnabled = !this.isEditModeEnabled;
      if (this.isEditModeEnabled) {
        this.initialRateCards = JSON.parse(JSON.stringify(this.rate_cards));
      }
    }
  }
  cancelChanges() {
    this.rate_cards = JSON.parse(JSON.stringify(this.initialRateCards));
  }
   /**
   * Method Name: resetTypeFormFieldCuntryCityState
   * 
   * Input Parameters:
   *   - None
   * 
   * Output Parameters:
   *   - None
   * 
   * Purpose:
   *   - Resets the country, city, and state form fields.
   * 
   * Author:
   *   - copied from my other file
   * 
   * Description:
   *   - This method resets the country, city, and state form fields to their initial states.
   */
  resetTypeFormFieldCuntryCityState() {
    this.commonService.isLocalCountryMY
      ? this.commonService.getCountryValue({
        data: 'Malaysia',
        isParcel: false,
      })
      : this.commonService.getCountryValue({ data: '', isParcel: false });
  }
   /**
   * Method Name: updateFieldPostcodeStateCity
   * 
   * Input Parameters:
   *   - None
   * 
   * Output Parameters:
   *   - None
   * 
   * Purpose:
   *   - Updates the state, city, and postcode fields.
   * 
   * Author:
   *   - copied from my other file
   * 
   * Description:
   *   - This method updates the state, city, and postcode fields in the form based on the 
   *     provided postcode by fetching the relevant data from the API.
   */
  updateFieldPostcodeStateCity() {
    this.commonService.getCurrentCountry$
      .pipe(
        tap((data: any) => {
          if (!data.isParcel) {
            if (data.data === this.commonService.defaultCountry) {
              this.commonService.getCountryIsMY(true);
              this.RateCalcUi.controls['postcode'].setValue(null);
            } else {
              this.commonService.getCountryIsMY(false);
              this.RateCalcUi.controls['state'].setValue(null);
              this.RateCalcUi.controls['postcode'].setValue(null);
              this.RateCalcUi.controls['city'].setValue(null);
            }
          }
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe();
  }
  /**
   * Method Name: getCountryAndStateList
   * 
   * Input Parameters:
   *   - None
   * 
   * Output Parameters:
   *   - None
   * 
   * Purpose:
   *   - Fetches the country and state list for populating the dropdown.
   * 
   * Author:
   *   - copied from my other file
   * 
   * Description:
   *   - This method fetches the list of countries and states from the common service and 
   *     populates the dropdown lists in the form with the received data.
   */
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
  /**
 * Method Name: getCitiesByState
 * 
 * Input Parameters:
 *   - data: any - Object containing the state code for which cities need to be fetched.
 * 
 * Output Parameters:
 *   - None
 * 
 * Purpose:
 *   - To retrieve cities based on the provided state code and update the component's `cities` property with the fetched data.
 * 
 * Author:
 *   - copied from my other file
 * 
 * Description:
 *   - This method makes an API call to retrieve a list of cities based on the state code from the provided `data` object. 
 *     The result is stored in the `cities` property. The ChangeDetectorRef (`cdr`) is used to trigger change detection, 
 *     ensuring that the UI updates accordingly. The observable is also managed by `takeUntil` to avoid memory leaks.
 */
  getCitiesByState(data: any) {
    const getCity$ = this.commonService.getAPI(
      'cities',
      `query?country=MY&state=${data.state_code}`
    );
    getCity$.pipe(tap((cities: any) => {
      this.cities = cities;
      // this.citySelected = this.cities.data.find(city => city.city_name?.trim()?.toLowerCase() === this.contactDetails.city?.trim()?.toLowerCase());
      this.cdr.markForCheck();
    }),
      takeUntil(this._onDestroy)
    ).subscribe();
  }
  getCitiesByStateFrom(data: IState): void {
    const getCity$ = this.commonService.getAPI(
      'cities',
      `query?country=MY&state=${data.state_code}`
    );
    getCity$.pipe(
      tap((cities: any) => {
        const typedCities = cities as IResponse<ICity[]>;
        this.citiesFrom = typedCities;
        this.cdr.markForCheck();
      }),
      takeUntil(this._onDestroy)
    ).subscribe();
  }
  /**
 * Method Name: getValidPostcode
 * 
 * Input Parameters:
 *   - postcode: any - The postcode that needs to be validated and processed.
 * 
 * Output Parameters:
 *   - None
 * 
 * Purpose:
 *   - To validate the given postcode, update form controls accordingly, and fetch the related cities and states if valid.
 * 
 * Author:
 *   - copied from my other file
 * 
 * Description:
 *   - This method first trims the provided postcode and checks if it meets the length requirements.
 *     If the selected country is Malaysia ('MY') and the postcode is valid (length > 5), it applies specific validators.
 *     If the postcode is valid (length >= 5), it makes an API call to fetch cities by postcode.
 *     Depending on the response, it updates the state and city form controls, and shows an error message if the postcode is invalid.
 *     The observable stream is managed using `takeUntil` to ensure proper resource cleanup.
 */
  getValidPostcode(postcode: any) {
    // Trim the postcode and ensure it meets length requirements
    postcode = FormControlValidators.trimDomesticPostcode(postcode);
    if (this.RateCalcUi.get('country')?.value.name.code.tolowercase() === 'my' && postcode?.length > 5) {
      // Validate postcode if country is MY
      this.RateCalcUi.get('postcode')?.setValidators([
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
              this.invalidPostcodeError = false;
              // Valid data received, update state and city
              const state_index = this.states?.data
                .map((e: any) => e.state_code)
                .indexOf(val?.data[0]?.state_code);
              this.RateCalcUi.controls['state'].setValue(
                this.states.data[state_index]
              );
              this.getCitiesByState(this.states?.data[state_index]);
              this.selectCity(val);
              this.RateCalcUi.get('postcode')?.setValidators(null);
            } else {
              this.invalidPostcodeError = true;
              // No data received, show error message
              this.snackBar.open(this.languageData.invalid_postcode, this.languageForm.close, {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['snack-bar-error'],
              });
              this.RateCalcUi.controls['state'].setValue(null);;
              this.RateCalcUi.controls['city'].setValue(null);
              this.RateCalcUi.get('postcode')?.setValidators(validatePostcode);
            }
            this.RateCalcUi.get('postcode')?.updateValueAndValidity();
          }),
          takeUntil(this._onDestroy)
        )
        .subscribe();
    }
  }
  getValidPostcodeFrom(postcode: any) {
    postcode = FormControlValidators.trimDomesticPostcode(postcode);
    if (this.RateCalcUi.get('country')?.value.name.code === 'MY' && postcode?.length > 5) {
      this.RateCalcUi.get('postcode')?.setValidators([
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
              this.RateCalcUi.controls['stateFrom'].setValue(
                this.states.data[state_index]
              );
              this.getCitiesByState(this.states?.data[state_index]);
              this.selectCity(val);
              this.RateCalcUi.get('postcode')?.setValidators(null);
            } else {
              // No data received, show error message
              this.snackBar.open(this.languageData.invalid_postcode, this.languageForm.close, {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['snack-bar-error'],
              });
              this.RateCalcUi.controls['stateFrom'].setValue(null);;
              this.RateCalcUi.controls['city'].setValue(null);
              this.RateCalcUi.get('postcode')?.setValidators(validatePostcode);
            }
            this.RateCalcUi.get('postcode')?.updateValueAndValidity();
          }),
          takeUntil(this._onDestroy)
        )
        .subscribe();
    }
  }
  /**
 * Method Name: selectCity
 * 
 * Input Parameters:
 *   - val: any - The data object containing state and city information to be used for selecting a city.
 * 
 * Output Parameters:
 *   - None
 * 
 * Purpose:
 *   - To fetch and set the city based on the state code and city name from the provided data.
 * 
 * Author:
 *   - copied from my other file
 * 
 * Description:
 *   - This method makes an API call to fetch cities based on the state code provided in the input parameter `val`.
 *     If valid city data is returned, it tries to find the index of the city in the response that matches the city name from `val`.
 *     It then sets the city form control with the matched city after a brief delay (500ms).
 *     If no valid city data is found, it clears the city form control.
 *     The observable stream is managed using `takeUntil` to ensure proper resource cleanup.
 */
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
              this.RateCalcUi.controls['city'].setValue(
                this.cities?.data[city_index]
              );
            }, 500);
          } else {
            this.RateCalcUi.controls['city'].setValue(null);
          }
        }),
        takeUntil(this._onDestroy)
      )
      .subscribe();
  }
  /**
 * Method Name: onCreateGroupFormValueChange
 * 
 * Input Parameters:
 *   - None
 * 
 * Output Parameters:
 *   - None
 * 
 * Purpose:
 *   - To listen for changes in the `RateCalcUi` form and emit the updated form values through the `RateCalcUiStatus` event emitter.
 * 
 * Author:
 *   - IlyasAhmed
 * 
 * Description:
 *   - This method subscribes to the `valueChanges` observable of the `RateCalcUi` form group.
 *     Every time the form's value changes, it emits the current state of the `RateCalcUi` form through the `RateCalcUiStatus` event emitter.
 *     This allows other parts of the application to respond to form changes in real-time.
 */
  onCreateGroupFormValueChange() {
    this.RateCalcUi.valueChanges.subscribe(() =>
      this.RateCalcUiStatus.emit(this.RateCalcUi)
    );
  }
  /** Method Name: onSubmit
  * 
  * Input Parameters:
  *   - None
  * 
  * Output Parameters:
  *   - None
  * 
  * Purpose:
  *   - To emit the current form values when the form is submitted.
  * 
  * Author:
  *   - IlyasAhmed
  * 
  * Description:
  *   - This method is triggered when the form is submitted.
  *     It emits the current values of the `RateCalcUi` form group through the `formSubmit` event emitter.
  *     This allows other components or services to handle the form submission with the provided data.
  */
  onSubmit() {
    this.formSubmit.emit(this.RateCalcUi.value);
  }
  errorHandler(field: string, val: string) {
    return this.RateCalcUi.controls[field].hasError(val);
  }
}
