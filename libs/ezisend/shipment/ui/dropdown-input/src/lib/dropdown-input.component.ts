import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'pos-dropdown-input',
  templateUrl: './dropdown-input.component.html',
  styleUrls: ['./dropdown-input.component.scss']
})
export class DropdownInputComponent implements OnInit {
  @Input() placeholder = ''
  @Input() options: {value: string, viewValue: string}[] = [];
  @Output() selectionChange = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}

  onSelectChange(event: MatSelectChange) {
    this.selectionChange.emit(event.value);
  }
}
