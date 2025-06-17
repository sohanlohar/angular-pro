import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { IHSC } from '@pos/ezisend/shared/data-access/models';
import { ReplaySubject, Subject, take, takeUntil } from 'rxjs';

export const HSCLIST: IHSC[] = [];

@Component({
  selector: 'pos-shipping-select-box',
  templateUrl: './shipping-select-box.component.html',
  styleUrls: ['./shipping-select-box.component.scss'],
})
export class ShippingSelectBoxComponent implements OnInit, AfterViewInit {
  HSCFilterCtrl: FormControl = new FormControl();
  filteredHSCList: ReplaySubject<IHSC[]> = new ReplaySubject<IHSC[]>(1);
  /** list of HSCode */
  @Output() getValue: EventEmitter<any> = new EventEmitter();
  @Input() hsc_list: IHSC[] = HSCLIST;
  protected _onDestroy = new Subject<void>();
  @ViewChild('singleSelect', { static: true })
  singleSelect!: MatSelect;
  constructor() {
    // console.log('incon');
  }

  ngOnInit(): void {
    this.filteredHSCList.next(this.hsc_list.slice());
    this.HSCFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterHSCLists();
      });
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  emitValuetoParent(event: any) {
    this.getValue.emit(event.value)
  }

  protected setInitialValue() {
    this.filteredHSCList
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        if (this.singleSelect) {
          this.singleSelect.compareWith = (a: IHSC, b: IHSC) =>
            a && b && a?.keyword === b?.keyword;
        }
      });
  }

  protected filterHSCLists() {
    if (!this.hsc_list) {
      return;
    }
    // get the search keyword
    let search = this.HSCFilterCtrl.value;
    if (!search) {
      this.filteredHSCList.next(this.hsc_list.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    const arrayDataq = this.hsc_list.filter((item) => {
      return (
        item.hscode.toLowerCase().indexOf(search) > -1 ||
        item.keyword.toLowerCase().indexOf(search) > -1
      );
    });
    this.filteredHSCList.next(arrayDataq);
  }
}
