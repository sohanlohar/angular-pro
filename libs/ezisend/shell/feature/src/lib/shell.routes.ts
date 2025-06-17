import { Route } from '@angular/router';
import { AuthGuardService } from '@pos/ezisend/auth/data-access/services';
import { MobileBlockGuard } from '@pos/ezisend/auth/data-access/services';
import { LayoutComponent } from '@pos/ezisend/shell/ui/layout';

export const shellRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('@pos/ezisend/dashboard/feature').then(
            (m) => m.DashboardFeatureModule
          ),
      },
      {
        path: 'shipment',
        data: { animation: 'openClosePage'},
        loadChildren: () =>
          import('@pos/ezisend/shipment/feature/single-shipment').then(
            (m) => m.SingleShipmentModule
          ),
      },
      {
        path: 'bulk-shipment',
        canActivate: [MobileBlockGuard],
        data: { animation: 'openClosePage'},
        loadChildren: () =>
          import('@pos/ezisend/shipment/feature/bulk-shipment').then(
            (m) => m.BulkShipmentModule
          ),
      },
      {
        path: 'pickup',
        loadChildren: () =>
          import('@pos/ezisend/shipment/feature/pick-up').then(
            (m) => m.PickUpModule
          ),
      },
      // {
      //   path: 'my-shipment',
      //   loadChildren: () =>
      //     import('@pos/ezisend/shipment/feature/history').then(
      //       (m) => m.HistoryModule
      //     ),
      // },
      {
        path: 'my-shipment',
        data: { animation: 'openClosePage'},
        loadChildren: () =>
          import('@pos/ezisend/shipment/feature/my-shipment').then(
            (m) => m.EzisendShipmentFeatureMyShipmentModule
          ),
      },
      {
        path: 'order-edit/:id/:id1',
        loadChildren: () =>
          import('@pos/ezisend/shipment/feature/order-edit').then(
            (m) => m.EzisendShipmentFeatureOrderEditModule
          ),
      },
      {
        path: 'order-edit/:id/:id1/:id2',
        loadChildren: () =>
          import('@pos/ezisend/shipment/feature/order-edit').then(
            (m) => m.EzisendShipmentFeatureOrderEditModule
          ),
      },
      {
        path: 'return-order/:id/:id1',
        loadChildren: () =>
          import('@pos/ezisend/shipment/feature/return-order').then(
            (m) => m.EzisendShipmentFeatureReturnOrderModule
          ),
      },

      {
        path: 'rate-calc',
        loadChildren: () =>
          import('@pos/ezisend/shipment/feature/rate-calc').then(
            (m) => m.EzisendShipmentFeatureRateCalcModule
          ),
      },
      {
        path: 'order-edit/:id',
        loadChildren: () =>
          import('@pos/ezisend/shipment/feature/order-edit').then(
            (m) => m.EzisendShipmentFeatureOrderEditModule
          ),
      },
      {
        path: 'return-order/:id',
        loadChildren: () =>
          import('@pos/ezisend/shipment/feature/return-order').then(
            (m) => m.EzisendShipmentFeatureReturnOrderModule
          ),
      },
      {
        path: 'contact',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('@pos/ezisend/contact/feature/contact-main').then(
                (m) => m.ContactMainModule
              ),
          },
          {
            path: 'details',
            loadChildren: () =>
              import('@pos/ezisend/contact/feature/contact-detail').then(
                (m) => m.ContactDetailModule
              ),
          },
          {
            path: 'create',
            loadChildren: () =>
              import('@pos/ezisend/contact/feature/contact-create').then(
                (m) => m.ContactCreateModule
              ),
          },
          {
            path: 'bulk-upload',
            canActivate: [MobileBlockGuard],
            loadChildren: () =>
              import('@pos/ezisend/contact/feature/contact-bulk-upload').then(
                (m) => m.EzisendContactFeatureContactBulkUploadModule
              ),
          },
        ],
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('@pos/ezisend/profile/feature/my-profile').then(
            (m) => m.MyProfileModule
          ),
      },
      {
        path: 'user',
        loadChildren: () =>
          import('@pos/ezisend/user-management/feature/add-user').then(
            (m) => m.EzisendUserManagementFeatureAddUserModule
          ),
      },
      
      {
        path: 'billing',
        loadChildren: () =>
          import('@pos/ezisend/billing/feature/invoice').then(
            (m) => m.EzisendBillingFeatureInvoiceModule
          ),
      },
      {
        path: 'report',
        loadChildren: () =>
          import('@pos/ezisend/reports').then(
            (m) => m.ReportsModule
          ),
      },
      /**  TEMP HIDE FOR PLUGINS 
      {
        path: 'integration',
        loadChildren: () =>
          import('@pos/ezisend/integration/feature/add-store/add-store').then(
            (m) => m.EzisendIntegrationFeatureAddStoreAddStoreModule
          ),
      },
      {
        path: 'integration/my-store',
        loadChildren: () =>
          import('@pos/ezisend/integration/feature/my-store').then(
            (m) => m.EzisendIntegrationFeatureMyStoreModule
          ),
      },
      {
        path: 'integration/add-store/instruction',
        loadChildren: () =>
          import('@pos/ezisend/integration/feature/add-store/instruction').then(
            (m) => m.EzisendIntegrationFeatureAddStoreInstructionModule
          ),
      },
      */
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadChildren: () =>
          import('@pos/ezisend/auth/feature/login').then((m) => m.LoginModule),
      },
      {
        path: 'activate-account',
        loadChildren: () =>
          import('@pos/ezisend/auth/feature/activate-account').then(
            (m) => m.ActivateAccountModule
          ),
      },
      {
        path: 'password-reset',
        data: { animation: 'openClosePage'},
        loadChildren: () =>
          import('@pos/ezisend/auth/feature/password-reset').then(
            (m) => m.PasswordResetModule
          ),
      },
      {
        path: 'forgot-password',
        loadChildren: () =>
          import('@pos/ezisend/auth/feature/forgot-password').then(
            (m) => m.EzisendAuthFeatureForgotPasswordModule
          ),
      },
      {
        path: 'activation-email',
        loadChildren: () =>
          import('@pos/ezisend/auth/feature/activate-email').then(
            (m) => m.ActivateEmailModule
          ),
      },
    ],
  },

  {
    path: 'downtime',
    loadChildren: () =>
      import('@pos/ezisend/downtime/feature/downtime-page').then(
        (m) => m.EzisendDowntimeFeatureDowntimePageModule
    ),
  },
  {
    path: 'not-found',
    loadChildren: () =>
      import('@pos/ezisend/not-found/feature/not-found').then(
        (m) => m.EzisendNotFoundFeatureNotFoundModule
    ),
    data: {
      errorCode: '404',
      errorTitle: 'Page not found',
      errorDescription: 'The requested link is not found or has expired.'
    }
  },
  {
    path: '**',
    redirectTo: 'not-found'
  }
];
