import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'pos-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  @Input() length = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  // @Input() pageSizeOptions = [20, 50, 100, 150, 200]; ASAL
  @Input() pageSizeOptions = [20, 50, 100];
  @Output() onCurrentPage = new EventEmitter<PageEvent>();

  onPageEvent(event: PageEvent) {
    this.onCurrentPage.emit(event);
  }
}
