import { FormBuilder, Validators } from "@angular/forms"
import { FormControlValidators } from "../../../validators/form-control-validators/src/lib/form-control-validators";

export type Dictionary<T> = { [key: string]: T };

export class BaseFormGroupHelper {
  public static formBuilder: FormBuilder = new FormBuilder();
}

// start general form
export class GeneralFormFB extends BaseFormGroupHelper {
  static generalFormFB = (data: any) => {
    return  this.formBuilder.group({
      name: [data?.name?.value ?? '', [
        Validators.required,
        FormControlValidators.onlyString()
      ]],
      name2: [data?.name2?.value ?? ''],
      phone_no: [data?.phone_no?.value ?? ''],
      email: [data?.email?.value ?? ''],
      address: [data?.address?.value ?? ''],
      city: [data?.city?.value ?? ''],
      postcode: [data?.postcode?.value ?? ''],
      state: [data?.state?.value ?? ''],
      country: [data?.country?.value ?? ''],
      is_default: [data?.is_default?.value ?? ''],
      search: [data?.search?.value ?? ''],
    })
  }
}
const GeneralFormValue = GeneralFormFB.generalFormFB({}).getRawValue();
export type GeneralFormType = typeof GeneralFormValue;
// end general form