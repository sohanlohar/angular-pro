export const environment = {
  production: true,
  sppUatUrl: 'https://spp-svc.pos.com.my/api/',
  MDMAPI: 'https://spp-svc.pos.com.my/api/options/',
  flagAPI: 'https://spp-s.pos.com.my/i/flags/',
  templateAPI: 'https://spp-s.pos.com.my/t/',
  templateHSCUrl: 'https://spp-s.pos.com.my/d/',
  trackingURL: 'https://tracking.pos.com.my/tracking/',
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
    reportAuthApi: 'https://spp-prod.auth.ap-southeast-1.amazoncognito.com/oauth2/token',
    reportApi: 'https://69t7w3dlih.execute-api.ap-southeast-1.amazonaws.com/prod/',
    clientSecret: '1sqkobnlo04fi4btscmoqv6smrv7idufqt34cih7ta0ufq767ivt',
    clientId: '7g0v4kik1unlgtt6tekev1a00v',
  },  
  paymentRedirect:{
    url: 'https://dashboard.pos.com.my/',
    pgw_url: 'https://ins-pgw.pos.com.my/'
  },
  
  aws_rum_config:  {
    sessionSampleRate: 1,
    guestRoleArn: "arn:aws:iam::137116603702:role/RUM-Monitor-ap-southeast-1-137116603702-5831805311961-Unauth",
    identityPoolId: "ap-southeast-1:237fb3ae-8a7a-4d87-9f2f-c6fdbc1baf34",
    endpoint: "https://dataplane.rum.ap-southeast-1.amazonaws.com",
    telemetries: ["performance","errors","http"],
    allowCookies: true,
    enableXRay: true
  },
  aws_rum_app_config:{
    application_id : 'eec86edc-e107-4e90-9447-eac88fce8dc4',
    application_version : '1.0.0',
    application_region : 'ap-southeast-1',
  },
  oms_stores:{
    bizapp: 'bizapp101',
    easystore: 'dev@easystore.co'
  },
  gleap: {
    api_key: '7xrUJGiYL6cMatEjXzugCNvGAAuG1oMR',
  },
  version: '1.5'
};
