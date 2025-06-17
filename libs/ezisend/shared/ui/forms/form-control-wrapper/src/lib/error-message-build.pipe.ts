import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Dictionary } from '@pos/ezisend/shared/data-access/models';
import { FORM_CONTROL_ERRORS } from './form-control-errors.const';

@Pipe({ name: 'errorMessageBuilder' })
export class ErrorMessageBuilderPipe implements PipeTransform {
  
  transform(errors: Dictionary<any>, name: string, customErrorMessages?: Dictionary<string>) {
    const errorMessages: Dictionary<string> = {};
    const errorKeys = Object.keys(errors ?? {});

    errorKeys.forEach((key, index) => {
      if (index+1 < 2) {
        switch (key) {
          case 'email':
            errorMessages[key] = FORM_CONTROL_ERRORS[key];
            break;
  
          case 'min':
          case 'max':
            errorMessages[key] = FORM_CONTROL_ERRORS[key].replace('${0}', name)
              .replace('${1}', errors[key][key]);
            break;
  
          case 'minlength':
            errorMessages[key] = FORM_CONTROL_ERRORS[key].replace('${0}', name)
            .replace('${1}', errors[key]['requiredLength']);
            break;
  
          case 'maxlength':
            errorMessages[key] = FORM_CONTROL_ERRORS[key].replace('${0}', name)
              .replace('${1}', errors[key]['requiredLength']);
            break;
  
          case 'notAllowed':
            errorMessages[key] = FORM_CONTROL_ERRORS[key].replace('${0}', name)
              .replace('${1}', errors[key][key].join(', '));
            break;
  
          case 'requiredWhenNotEmpty':
            errorMessages[key] = FORM_CONTROL_ERRORS[key].replace('${0}', name)
              .replace('${1}', errors[key]['label']);
            break;
  
          case 'numberInBetween':
            errorMessages[key] = FORM_CONTROL_ERRORS[key].replace('${0}', name)
              .replace('${1}', errors[key]['minValue'])
              .replace('${2}', errors[key]['maxValue']);
            break;
  
          default:
            if (FORM_CONTROL_ERRORS[key]) {
              errorMessages[key] = FORM_CONTROL_ERRORS[key].replace('${0}', name);
            }
            break;
        }
  
        if (customErrorMessages && customErrorMessages.hasOwnProperty(key)) {
          errorMessages[key] = customErrorMessages[key];
        }
      }
    });

    return errorMessages;
  }
}
