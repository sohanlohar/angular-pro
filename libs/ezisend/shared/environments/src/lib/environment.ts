// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  sppUatUrl: 'https://spp-svc.uat-pos.com/api/',
  MDMAPI: 'https://spp-svc.uat-pos.com/api/options/',
  flagAPI: 'https://s.uat-pos.com/i/flags/',
  templateAPI: 'https://s.uat-pos.com/t/',
  templateHSCUrl: 'https://s.uat-pos.com/d/',
  trackingURL: 'https://ttu.uat-pos.com/tracking/',
  shopifyURL: 'https://admin.shopify.com/',
  wooCommerceURL: 'https://wordpress.com/log-in',
  posMalaysiaPluginURL: 'https://apps.shopify.com/pos-malaysia-plugin',
  trackingDetailURL: 'https://ttu-svc.uat-pos.com/',
  
  invoiceUrl:{
    invoiceApi: 'https://y9nrqsno2d.execute-api.ap-southeast-1.amazonaws.com/prod/invoice',
    clientSecret: '164p2aru35jbjcenvfq5d3jqbim6ah0pu1qaf5p6qhmdd091uklf',
    clientId: '7tm7oeh7niinhss1btu3v50lg9',
  },
  reportUrl:{
    reportAuthApi: 'https://spp.auth.ap-southeast-1.amazoncognito.com/oauth2/token',
    reportApi: 'https://zwijoqzkec.execute-api.ap-southeast-1.amazonaws.com/test/',
    clientSecret: '1q1gvvk58vplel8uh6mmdtu0qlrfamgm4f3jt6h4r35a75urmjk0',
    clientId: '4qpcgjj394ju18pro1ffjvqjki',
  },  
  paymentRedirect:{
    url: 'https://spp.uat-pos.com/',
    pgw_url: 'https://fin-pgw-svc.uat-pos.com/'
  },
  aws_rum_config:  {
    sessionSampleRate: 1,
    guestRoleArn: "arn:aws:iam::574514712417:role/RUM-Monitor-ap-southeast-1-574514712417-5617859301961-Unauth",
    identityPoolId: "ap-southeast-1:e2a0491b-87b5-405c-9df3-6949d4b78ec6",
    endpoint: "https://dataplane.rum.ap-southeast-1.amazonaws.com",
    telemetries: ["performance","errors","http"],
    allowCookies: true,
    enableXRay: false
  },
  aws_rum_app_config:{
    application_id : '34449e4d-07d4-417c-b4aa-b0360078036e',
    application_version : '1.0.0',
    application_region : 'ap-southeast-1',
  },
  oms_stores:{
    bizapp: 'bizapp',
    easystore: 'dev@easystore.co'
  },
  gleap: {
    api_key: 'IOFRETDjISAv2eexbat5YH5Qx5RegGgk',
  },
  version: '1.5'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
