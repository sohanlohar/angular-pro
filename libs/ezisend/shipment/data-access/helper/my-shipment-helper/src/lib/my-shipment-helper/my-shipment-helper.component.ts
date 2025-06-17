import { AbstractControl } from "@angular/forms";

export class MyShipmentHelper {
  public static contructFilterObject(object: any): string {
    const query = Object.entries(object)
      .filter((value) => value[1])
      .map((value) => `${value[0]}=${object[value[0]]}`)
      .join('&');
    return query;
  }
}

export function validatePostcode(control: AbstractControl) {
  return { postcode_not_found: true };
}