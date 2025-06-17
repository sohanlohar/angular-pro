import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

const MOVE_ICON =
  `
  <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="m794 922-42-42 73-74H620v-60h205l-73-74 42-42 146 146-146 146ZM340 686q51.397 0 92.699-24Q474 638 499 598q-34-26-74.215-39t-85-13Q295 546 255 559t-74 39q25 40 66.301 64 41.302 24 92.699 24Zm.089-200Q369 486 389.5 465.411q20.5-20.588 20.5-49.5Q410 387 389.411 366.5q-20.588-20.5-49.5-20.5Q311 346 290.5 366.589q-20.5 20.588-20.5 49.5Q270 445 290.589 465.5q20.588 20.5 49.5 20.5ZM340 897q133-121 196.5-219.5T600 504q0-117.79-75.292-192.895Q449.417 236 340 236t-184.708 75.105Q80 386.21 80 504q0 75 65 173.5T340 897Zm0 79Q179 839 99.5 721.5T20 504q0-150 96.5-239T340 176q127 0 223.5 89T660 504q0 100-79.5 217.5T340 976Zm0-410Z"/></svg>
`;
@Component({
  selector: 'pos-smart-input',
  templateUrl: './smart-input.component.html',
  styleUrls: ['./smart-input.component.scss'],
})
export class SmartInputComponent {
  @Output() newInput = new EventEmitter<any>();

  constructor(
    iconRegistry: MatIconRegistry, 
    sanitizer: DomSanitizer,
    private translate: TranslationService
  ) {
    iconRegistry.addSvgIconLiteral('move-location', sanitizer.bypassSecurityTrustHtml(MOVE_ICON));

    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.smart_fill_data
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.smart_fill_data
      }
    })

  }

  panelOpenState = false;
  userInput = '';
  copyUserInput = '';
  pastedText = '';
  isPasted = false;
  
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.smart_fill_data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.smart_fill_data :
    en.data.smart_fill_data;

  updateInputLines() {
    this.copyUserInput = this.userInput;
    const phoneNumberHyphenPlus = /^[0-9 +-]{9,100}$/;
    const postcodenumberRegex = /([^\d]|^)\d{5,5}([^\d]|$)/;
    const emailaddressRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
    const nameRegex = /^[a-zA-Z/@ ]+$/;

    const data = {
      mobile: this.findSpecificMatchRegex(phoneNumberHyphenPlus),
      postcode: this.findExactMatchInString(postcodenumberRegex), /* only local postcode */
      email: this.findExactMatchInString(emailaddressRegex),
      name: this.findSpecificMatchRegex(nameRegex),
      address: this.copyUserInput.replace(', ', ',\n'),
      companyName: '',
    };

    this.newInput.emit(data);
  }

  /* paste, trim and remove multiple newline */
  onPaste(event: ClipboardEvent) {
    const paste = event && event.clipboardData && event.clipboardData.getData('text') ? event.clipboardData.getData('text') : '';
    this.pastedText = paste.trim().replace(/\n\s*\n/g, '\n').split('\n').map((input: string) => input.trim()).join('\n');
  }

  onInput(content: string) {
    if (!this.isPasted) {
      this.userInput = content.trim().replace(/\n\s*\n/g, '\n').split('\n').map((input: string) => input.trim()).join('\n');
    }
    this.isPasted = content !== '';
  }

  private findSpecificMatchRegex(regex: RegExp): string {
    const sentences = this.copyUserInput.split('\n');
    /* test every loop */
    let matched = sentences.find((characters: string) => characters !== '' && regex.test(characters)) ?? '';
    this.removeCharacterFromString(matched);
    const numPattern = /^[0-9+-]{9,100}$/;
    if(numPattern.test(matched)) {
      matched = matched.replace('+', '');
      matched = matched.replace('-', '');
      matched = matched.replace(' ', '');
    }
    return matched ?? '';
  }

  private findExactMatchInString(regex: RegExp): string {
    /* use match method */
    const matches = this.copyUserInput.match(regex);
    const matched = matches && matches[0] ? matches[0] : '';
    this.removeCharacterFromString(matched);
    return matched
  }

  private removeCharacterFromString(character: string) {
    this.copyUserInput = this.copyUserInput.replace(character, ' ').trim();
  }

}
