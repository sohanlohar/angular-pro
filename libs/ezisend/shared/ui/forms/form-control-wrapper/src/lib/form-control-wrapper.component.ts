import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Dictionary } from '@pos/ezisend/shared/data-access/models';

@Component({
  selector: 'pos-form-control-wrapper',
  templateUrl: './form-control-wrapper.component.html',
  styleUrls: ['./form-control-wrapper.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FormControlWrapperComponent {
  @Input() name!: string;
  @Input() dropdown!: boolean;
  @Input() control!: FormControl | AbstractControl | null;

  testgroup!: FormGroup;
  isAddress = false;
  isAddressDrop = false;

  /**
   * Custom Error Messages that are not listed in form-control-errors.const
   * * Only use this when validation is unique and not commonly used
   * * The dictionary key must match the validation error key
   * * Can be used to override existing validation message
   */
  @Input() customErrorMessages?: Dictionary<string>;

  get controlErrors(): Dictionary<any> {
    if(this.dropdown){
      this.isAddress = false;
      this.isAddressDrop = true;
      return this.control?.errors ?? {}
    }else {
      this.isAddress = (this.name === 'Address' || this.name === 'Alamat');
      return this.control?.errors ?? {}
    }
  }

}
