import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pos-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
})
export class SearchInputComponent {
  @Input() keyword: string | undefined = '';
  @Input() placeholder = ''
  @Output() searchEvent = new EventEmitter<string>();
  @Input() fullWidth = false;

  onInputChange(input: any) {
    this.keyword = input.target.value;
    if (this.keyword == "") {
      this.searchEvent.emit(this.keyword);
    }
  }

  submitFormField() {
    this.searchEvent.emit(this.keyword);
  }
}
