import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { IChildrenDetails, IMpsChildShipmentFormGroup, IParcelDetails } from '@pos/ezisend/shipment/data-access/models';
import { Observable, Subject, map, merge, takeUntil } from 'rxjs';
import { bm } from '../../../../../../../assets/my';
import { en } from '../../../../../../../assets/en';
import { TranslationService } from '../../../../../../../shared-services/translate.service';
@Component({
  selector: 'pos-mps-shipment-details',
  templateUrl: './mps-shipment-details.component.html',
  styleUrls: ['./mps-shipment-details.component.scss'],
})
export class MpsShipmentDetailsComponent implements OnInit {

  protected _onDestroy = new Subject<void>();
  isIssuredMps = false;
  isDisable = false;
  isMaxChild = false;
  isChildInsured = false;
  isValidRecipientForm = false;
  isSubmitting = false;
  totalWeight = 0;
  totalSumInsured = 0;
  panelOpenState: boolean = false;
  filteredChild = [];
  insuranceUrl =
    'https://www.pos.com.my/legal/terms-and-conditions-poscoverageplus';

  @Input() parcelDetailsForm!: FormGroup;
  @Input() isEditOrder = false;
  @Input() isPendingPickup = false;
  @Input() isCountryMY = true;
  @Output() mpsFormValid = new EventEmitter<boolean>();

  languageObj: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
    en.data;

  languageData: any;
  languageForm: any;

  constructor(
    private fb: UntypedFormBuilder,
    public commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private translate: TranslationService
  ) {
    this.parcelDetailsForm;
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
  }
  public deletedItem: any= [];
  panelStates: boolean[] = [];

  assignLanguageLabel(){
    this.languageData = this.languageObj['myShipments']['parcel_data'];
    this.languageForm = this.languageObj['form_data'];
  }

  ngOnInit() {
    this.togglePanelState();
    const _WIDTH = this.parcelDetailsForm.controls['width'];
    const _LENGTH = this.parcelDetailsForm.controls['length'];
    const _HEIGHT = this.parcelDetailsForm.controls['height'];
    const _VOLUMETRICWEIGHT = this.parcelDetailsForm.controls['volumetricWeight'];
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
      .subscribe((val) => {
        const percentToGet = 1;
        const res = (val * percentToGet) / 100;
        _PREMIUMAMT.setValue(res.toFixed(2));
      });

    if (!this.isEditOrder)
      this.mps_child_declarations.push(this.createMpsChildDeclaration());
    this.getDisableStatus();

    if(this.isEditOrder){
      this.commonService.getParcelDetail$
        .pipe(takeUntil(this._onDestroy))
        .subscribe((parcelDetails) => {
          if (parcelDetails) {
            this.updateInsuranceCheck(parcelDetails);
          }})
    }
    this.getInsuranceValDOM({});
    const childLength = this.mps_child_declarations;
     if(childLength.length >=19){
      this.isMaxChild = true;
      }
  }

  togglePanelState = () => {
    if (this.isEditOrder) {
      this.panelStates = Array(this.mps_child_declarations.length).fill(
        false
      );
    } else {
      // Default behavior: Open the first item when not in edit mode
      this.panelStates = Array(this.mps_child_declarations.length).fill(
        false
      );
      this.panelStates[0] = true;
    }
  };

  togglePanel(index: number) {
    this.panelStates[index] = !this.panelStates[index];
  }

  getInsuranceValDOM(val: any) {
    if (val && Object.keys(val).length === 0) {
      return;
    }

    this.isIssuredMps = val.checked;

    if (!this.isIssuredMps) {
      const parentSumInsured = this.parcelDetailsForm.controls['sum_insured'].value;
      this.parcelDetailsForm.controls['totalInsured'].setValue(+this.totalSumInsured);
      this.parcelDetailsForm.controls['sum_insured'].setValidators(null);
      this.parcelDetailsForm.controls['sum_insured'].updateValueAndValidity();
      const check = ((1 / 100) * this.totalSumInsured).toFixed(2);

      this.parcelDetailsForm.controls['totalPremiumAmount'].setValue(check);
    } else {
      this.parcelDetailsForm.controls['sum_insured'].setValue('');
      this.parcelDetailsForm.controls['sum_insured'].setValidators([
        Validators.required,
        Validators.max(5000),
        Validators.pattern(this.commonService.numericWithDecimalOnly),
      ]);
      this.parcelDetailsForm.controls['sum_insured'].updateValueAndValidity();
    }
  }

  setChildDimensionValDOM(val : {checked: boolean, source: MatCheckbox}, index : number) {
    const isInsuredDOM = val.checked;
    if(isInsuredDOM) {
      this.mps_child_declarations.at(index).get('child_weight')?.setValue(this.parcelDetailsForm.value.weight)
      this.mps_child_declarations.at(index).get('child_width')?.setValue(this.parcelDetailsForm.value.width)
      this.mps_child_declarations.at(index).get('child_length')?.setValue(this.parcelDetailsForm.value.length)
      this.mps_child_declarations.at(index).get('child_height')?.setValue(this.parcelDetailsForm.value.height)
      this.mps_child_declarations.at(index).get('child_description')?.setValue(this.parcelDetailsForm.value.content)
    } else {
      this.mps_child_declarations.at(index).get('child_weight')?.setValue(null)
      this.mps_child_declarations.at(index).get('child_width')?.setValue(null)
      this.mps_child_declarations.at(index).get('child_length')?.setValue(null)
      this.mps_child_declarations.at(index).get('child_height')?.setValue(null)
      this.mps_child_declarations.at(index).get('child_description')?.setValue(null)
    }
  }
  getChildInsuranceValDOM(val : {checked: boolean, source: MatCheckbox}, index : number) {
    const isInsuredDOM = val.checked;
    if(!isInsuredDOM){
      this.mps_child_declarations.at(index).get('child_sumInsured')?.setValidators(null)
      this.mps_child_declarations.at(index).get('child_isInsurance')?.setValue(false);
      const childSumInsured = this.mps_child_declarations.at(index).get('child_sumInsured')?.value;
      this.parcelDetailsForm.controls['totalInsured'].setValue(+this.totalSumInsured - childSumInsured);
      this.totalSumInsured = this.totalSumInsured - childSumInsured;
      this.mps_child_declarations.at(index).get('child_sumInsured')?.setValue('');
      const totalPremAmt = (1 / 100) * this.totalSumInsured;
      if( totalPremAmt > 1){
        this.parcelDetailsForm.controls['totalPremiumAmount'].setValue((+totalPremAmt).toFixed(2));
      } else if(totalPremAmt < 1 && totalPremAmt > 0){
        this.parcelDetailsForm.controls['totalPremiumAmount'].setValue("1.00");
      } else if(totalPremAmt === 0){
        this.parcelDetailsForm.controls['totalPremiumAmount'].setValue(0);
      }
    } else {
      this.mps_child_declarations.at(index).get('child_sumInsured')?.setValidators([
          Validators.min(1),
          Validators.max(5000),
          Validators.pattern(this.commonService.numericWithDecimalOnly),
        ])
      this.mps_child_declarations.at(index).get('child_isInsurance')?.setValue(true);
      // this.mps_child_declarations.at(index).get('child_premAmt')?.setValue(1);
    }
  }

  get mps_child_declarations() {
    return this.parcelDetailsForm.get('mps_child_declarations') as FormArray;
  }

  createMpsChildDeclaration(item?: IMpsChildShipmentFormGroup) {
    return this.fb.group(
      {
      child_weight: [item? item.child_weight : '', [Validators.required, Validators.pattern(this.commonService.numericWithDecimalOnly)]],
      child_width: [item? item.child_width : '' , [Validators.required, Validators.pattern(this.commonService.numericWithDecimalOnly)]],
      child_length: [item? item.child_length : '' , [Validators.required, Validators.pattern(this.commonService.numericWithDecimalOnly)]],
      child_height: [item? item.child_height : '' , [Validators.required, Validators.pattern(this.commonService.numericWithDecimalOnly)]],
      child_volumetric_weight: [item? item.child_volumetric_weight : {value:'', disabled: true} , [Validators.required, Validators.pattern(this.commonService.numericWithDecimalOnly)]],
      child_description: [item? item.child_description : '', [Validators.required]],
      child_isInsurance: [item? item.child_isInsurance : false],
      child_copyParent: [false],
      child_sumInsured: [item? item.child_sumInsured : '', [Validators.max(5000), Validators.pattern(this.commonService.numericWithDecimalOnly)]],
      child_premAmt: [item? item.child_premAmt : {value:'', disabled: true}],
      deleted : false,
    },
    );
  }

  addItem() {
    if (!this.isEditOrder) {
      this.panelStates = Array(this.mps_child_declarations.length).fill(false);
      this.panelStates[this.panelStates.length] = true;
    } else {
      this.panelStates = Array(this.mps_child_declarations.length).fill(false);
      this.panelStates[this.panelStates.length] = true;
    }
    const deletedItem = this.mps_child_declarations.value.filter((el: any) => {
      // eslint-disable-next-line no-prototype-builtins
      return el.deleted === true && el.hasOwnProperty('deleted')
    });

    const childLength = this.mps_child_declarations;
        if (deletedItem) {
      deletedItem.forEach(() => {
        this.mps_child_declarations.removeAt(this.mps_child_declarations.controls.length - 1);
      });
    }
    this.mps_child_declarations.push(this.createMpsChildDeclaration());
    this.getDisableStatus();
    this.parcelDetailsForm.controls['noShipments'].setValue(+childLength.length + 1);
    if(childLength.length >= 19){
      this.isMaxChild = true;
    }
    this.mergeMpsArr();
        this.updateNumShipments();
  }

  getDisableStatus() {
    const childDeclarations = this.mps_child_declarations;
    if (childDeclarations.value.length > 1 && childDeclarations.getRawValue().filter((childData)=> !childData.deleted).length > 1) {
      this.isDisable = false;
    } else {
      this.isDisable = true;
    }
  }

  removeCustom(index: number) {
    const childId = this.mps_child_declarations.at(index).get('child_shipment_id')?.value;
    if (childId) {
      this.mps_child_declarations.at(index).get('deleted')?.setValue(true);
    } else {
      this.mps_child_declarations.removeAt(index);
    }
    this.getDisableStatus();
    this.parcelDetailsForm.controls['noShipments'].setValue(+this.mps_child_declarations.length + 1);
    if (this.mps_child_declarations.length < 19) {
      this.isMaxChild = false;
    }
    this.mps_child_declarations.controls.forEach((control, i:any)=>{
      if(i == index){
        const obj = this.mps_child_declarations.at(index);
        this.mps_child_declarations.removeAt(i)
        // this.mps_child_declarations.push(obj);
        this.deletedItem.push(obj)
      }
    })
    this.mergeMpsArr()
    this.updateNumShipments();
  }

  isSubmitDisabled(formValidity: boolean) {
    let invalid = !formValidity || this.isSubmitting;
    if (this.isEditOrder) {
      invalid = invalid || !this.isValidRecipientForm;
    }
    return this.mpsFormValid.emit(invalid);
  }

  onVolumetricWeightCalculation(index : number) {
    const width = this.mps_child_declarations.at(index).get('child_width')?.value;
    const height = this.mps_child_declarations.at(index).get('child_height')?.value;
    const length = this.mps_child_declarations.at(index).get('child_length')?.value;

    if(width && height && length) {
      const volumetricWeight = (width * length * height) / 5000;
      this.mps_child_declarations.at(index).get('child_width')?.setValue(+width);
      this.mps_child_declarations.at(index).get('child_height')?.setValue(+height);
      this.mps_child_declarations.at(index).get('child_length')?.setValue(+length);
      this.mps_child_declarations.at(index).get('child_volumetric_weight')?.setValue(volumetricWeight);

    }
    if (index >= 0) {
      this.mps_child_declarations.at(index).get('child_copyParent')?.setValue(false);
    }
  }

  onPremiumAmountCalculation(index : number) {
    this.totalSumInsured = this.mps_child_declarations.value.reduce((prev: number,next: { child_sumInsured: number; }) => prev + +next.child_sumInsured, +this.parcelDetailsForm.value.sum_insured);

    this.parcelDetailsForm.controls['totalInsured'].setValue(+this.totalSumInsured);
    this.parcelDetailsForm.controls['totalInsured'].markAsTouched();

    if(this.canImplementNewRatePremiumAmt()){
      const percentToGet = 1;
      const res = (this.totalSumInsured * percentToGet) / 100;
        this.parcelDetailsForm.controls['totalPremiumAmount'].setValue(res.toFixed(2));
    }else{
      const totalPremAmt = (1 / 100) * this.totalSumInsured;
      if(totalPremAmt > 1){
        this.parcelDetailsForm.controls['totalPremiumAmount'].setValue((+totalPremAmt).toFixed(2));
      } else {
          this.parcelDetailsForm.controls['totalPremiumAmount'].setValue("1.00")
      }
    }

    // implemented for child premium amount
    if(this.canImplementNewRatePremiumAmt()){
      const percentToGet = 1;
      const totalSum = this.mps_child_declarations.at(index).get('child_sumInsured')?.value || 0;
      const res = (totalSum * percentToGet) / 100;
        this.mps_child_declarations.at(index).get('child_premAmt')?.setValue(res.toFixed(2));
    }else{
      const totalSum = this.mps_child_declarations.at(index).get('child_sumInsured')?.value || 0;
      const totalPremAmt = (1 / 100) * totalSum;

      if(totalPremAmt > 1){
        this.parcelDetailsForm.controls['totalPremiumAmount'].setValue((+totalPremAmt).toFixed(2));
        this.mps_child_declarations.at(index).get('child_premAmt')?.setValue(+totalPremAmt.toFixed(2));
      } else {
          this.mps_child_declarations.at(index).get('child_premAmt')?.setValue("1.00");
      }
    }
  }

  canImplementNewRatePremiumAmt(){
    const form = this.parcelDetailsForm;
    return form.get('category')?.value?.toLowerCase() !== 'ubat' && form.get('category')?.value?.toLowerCase() !== 'melplus';
  }

  onTotalWeightCalculation (index : number) {
    this.totalWeight = this.mps_child_declarations.value.reduce((prev: number, next: { child_weight: number; }) => prev + +next.child_weight, +this.parcelDetailsForm.value.weight);
    this.parcelDetailsForm.controls['totalWeight'].setValue(+this.totalWeight);
    if (index >= 0) {
      this.mps_child_declarations.at(index).get('child_copyParent')?.setValue(false);
    }
    // OR
    // this.sum = this.capValues.getRawValue().reduce((prev, next) => prev + +next.fdnTotalShares, 0);
  }

  onTotalSumInsured() {
    this.totalSumInsured = this.mps_child_declarations.value.reduce((prev: number,next: { child_sumInsured: number; }) => prev + +next.child_sumInsured, +this.parcelDetailsForm.value.sum_insured);
    this.parcelDetailsForm.controls['totalInsured'].setValue(+this.totalSumInsured);
    const totalPremAmt = (1 / 100) * this.totalSumInsured;
    if( totalPremAmt > 1){
      this.parcelDetailsForm.controls['totalPremiumAmount'].setValue((+totalPremAmt).toFixed(2));
    } else {
      this.parcelDetailsForm.controls['totalPremiumAmount'].setValue("1.00")
    }
  }

  updateInsuranceCheck(parcelDetails: IParcelDetails) {
    if(parcelDetails){
      this.isIssuredMps = parcelDetails.is_insured;
      this.totalSumInsured = parcelDetails.total_sum_insured;
      if(!parcelDetails.is_insured){
        this.parcelDetailsForm.controls['sum_insured'].setValidators(null);
      }else{
        this.parcelDetailsForm.controls['sum_insured'].setValue(parcelDetails.sum_insured.toString());
      }

      const childLength = parcelDetails.parcel_Info.children;
      this.parcelDetailsForm.controls['noShipments'].setValue(+childLength.length + 1);

      this.mps_child_declarations.value.map((children:IChildrenDetails, index:number)=> {
          children.child_isInsurance = parcelDetails.parcel_Info.children[index]?.is_insured;
          this.mps_child_declarations.at(index).get('child_isInsurance')?.setValue(children.child_isInsurance);
          this.mps_child_declarations.at(index).get('child_width')?.setValidators([Validators.required, Validators.pattern(this.commonService.numericWithDecimalOnly)]);
          this.mps_child_declarations.at(index).get('child_length')?.setValidators([Validators.required, Validators.pattern(this.commonService.numericWithDecimalOnly)]);
          this.mps_child_declarations.at(index).get('child_height')?.setValidators([Validators.required, Validators.pattern(this.commonService.numericWithDecimalOnly)]);
          this.mps_child_declarations.at(index).get('child_volumetric_weight')?.disable();
          this.mps_child_declarations.at(index).get('child_volumetric_weight')?.setValidators([Validators.required, Validators.pattern(this.commonService.numericWithDecimalOnly)]);
          this.mps_child_declarations.at(index).get('child_sumInsured')?.setValidators([Validators.max(5000), Validators.pattern(this.commonService.numericWithDecimalOnly)]);

          const control = this.mps_child_declarations.at(index).get('child_premAmt');
          if (control) {
            control.setValue(children.child_premAmt.toString());
            control.disable();
            control.markAsTouched();

            control?.disable();
          }

          if(!parcelDetails.parcel_Info.children[index].is_insured) {
            this.mps_child_declarations.at(index).get('child_sumInsured')?.setValidators(null);
          }
      })
    }
  }

  updateNumShipments() {
    const childrenCount = this.mps_child_declarations.value.filter((el:any) => {
      return el.deleted === false && el.hasOwnProperty('deleted')
    });
    this.parcelDetailsForm.controls['noShipments'].setValue(+childrenCount.length + 1);
  }

  mergeMpsArr() {
    const concatenatedControls = this.mps_child_declarations.controls.concat(this.deletedItem);
    while (this.mps_child_declarations.length !== 0) {
      this.mps_child_declarations.removeAt(0);
    }
    concatenatedControls.forEach(control => {
      this.mps_child_declarations.push(control);
    });
  }
}
