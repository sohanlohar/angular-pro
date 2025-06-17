import { Route } from '@angular/router';
import { LayoutComponent } from '@pos/web/shell/ui/layout';

export const webShellRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('@pos/web/launch-pad/feature').then(
            (m) => m.WebLaunchPadFeatureModule
          ),
      },
    ],
  },
];
