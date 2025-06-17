import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class FormControlValidators {
  /**
 * Validates if numeric input fits the accepted criteria of integer and decimal length
 */
 static onlyString(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value) {
        return (Boolean(+control.value) && typeof +control.value === 'number')
          ? { onlyString: true }
          :  null;
      }

      return null;
    };
  }

  static trimDomesticPostcode(postcode: string) {
    /* check postcode have whitespace */
    if (/\s/.test(postcode)) {
      postcode = postcode.trim();
    }
    /* validate postcode length */
    if (postcode.length > 5) {
      postcode = postcode.substring(0,5)
    }
    
    return postcode;
  }
}