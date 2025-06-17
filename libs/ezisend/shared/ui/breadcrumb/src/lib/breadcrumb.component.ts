import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { BreadcrumbItem } from '@pos/ezisend/shared/data-access/models';


@Component({
  selector: 'pos-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class BreadcrumbComponent {
  @Input()
  breadcrumbItems: BreadcrumbItem[] | undefined;
  @Input() backData?: { path: string, query:any, label: string };
}
