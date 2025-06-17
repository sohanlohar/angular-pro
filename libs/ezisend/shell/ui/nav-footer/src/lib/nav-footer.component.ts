import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { IsActiveMatchOptions } from '@angular/router';
import { NavItem } from '@pos/ezisend/shell/data-access/models';

@Component({
  selector: 'pos-nav-footer',
  templateUrl: './nav-footer.component.html',
  styleUrls: ['./nav-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavFooterComponent {
  @Output() menuToggled = new EventEmitter<void>();
  routerLinkActiveOptions: IsActiveMatchOptions = {
    matrixParams: 'ignored',
    queryParams: 'ignored',
    fragment: 'ignored',
    paths: 'exact'
  };
  navigations: NavItem[] = [
    {
      displayName: 'Menu',
      iconName: 'menu',
      routerLink: ['']
    },
    {
      displayName: 'Dashboard',
      iconName: 'grid_view',
      routerLink: ['']
    },
    {
      displayName: 'Create',
      iconName: 'add_circle',
      routerLink: ['shipment']
    },
    {
      displayName: 'Shipments',
      iconName: 'inventory_2',
      routerLink: ['my-shipment'],
      queryParam: { t: 'request-pickup'},
    },
  ];
}
