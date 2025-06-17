import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'pos-page-title',
  templateUrl: './page-title.component.html',
  styleUrls: ['./page-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTitleComponent {
  @Input() title: string | undefined;
  @Input() copy: string | undefined;
}
