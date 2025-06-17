/* eslint-disable @angular-eslint/directive-selector */
import { Directive, ElementRef, HostListener } from '@angular/core';
@Directive({
    selector: '[appTwoDecimalMask]'
})
export class TwoDecimalMaskDirective {
    private regex = new RegExp(/^(?!0(\.00?)?$)\d+(\.\d{0,2})?$/g);
    private specialKeys: Array<string> = [
        'Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Del', 'Delete'
    ];
    constructor(private el: ElementRef) { }
    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        // Allow special keys
        if (this.specialKeys.indexOf(event.key) !== -1) {
            return;
        }
        // Allow numpad keys (key codes 96-105) and digit keys (key codes 48-57)
        const keyCode = event.keyCode;
        const isDigitKey = (keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105);
        if (isDigitKey) {
            return;
        }
        // Validate the input value with the regex
        const current: string = this.el.nativeElement.value;
        const next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex)) {
            event.preventDefault();
        }
    }
    @HostListener('blur', ['$event'])
    onBlur(event: FocusEvent) {
        const currentValue: string = this.el.nativeElement.value;
        if (currentValue && !isNaN(+currentValue)) {
            const numericValue = +currentValue;
            if (numericValue === 0) {
                this.el.nativeElement.value = '';
            } else {
                this.el.nativeElement.value = numericValue.toFixed(2);
            }
        }
    }
}
