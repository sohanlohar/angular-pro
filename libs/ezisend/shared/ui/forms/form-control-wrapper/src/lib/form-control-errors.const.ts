import { Dictionary } from '@pos/ezisend/shared/data-access/models';

/**
 * Add common validation error messages here
 */
export const FORM_CONTROL_ERRORS: Dictionary<string> = {
  email: 'Email is invalid.',
  pattern: 'Enter valid ${0}.',
  required: 'Enter ${0}.',
  inDateRange: '${0} is invalid.',
  integer: '${0} only allows integer.',
  onlyString: '${0} only allows string.',
  min: '${0} min value is ${1}.',
  max: '${0} max value is ${1}.',
  minlength: 'Minimum of ${1} characters.',
  maxlength: '${0} max length is ${1}.',
  notAllowed: '${0} does not allow ${1}.',
  dateInBetween: '${0} should be in between ${1} and ${2}.',
  numberInBetween: '${0} should be in between ${1} and ${2}.',
};
