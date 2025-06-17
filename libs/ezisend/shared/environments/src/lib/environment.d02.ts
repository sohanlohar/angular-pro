export const environment = {
     production: false,
     sppUatUrl: 'https://d02-spp-svc.uat-pos.com/api/',
     MDMAPI: 'https://d02-spp-svc.uat-pos.com/api/options/',
     flagAPI: 'https://s.uat-pos.com/i/flags/',
     templateAPI: 'https://s.uat-pos.com/t/',
     templateHSCUrl: 'https://s.uat-pos.com/d/',
     trackingURL: 'https://ttu.uat-pos.com/tracking/',
     shopifyURL: 'https://admin.shopify.com/',
     wooCommerceURL: 'https://wordpress.com/log-in',
     posMalaysiaPluginURL: 'https://apps.shopify.com/pos-malaysia-plugin',
     trackingDetailURL: 'https://ttu-svc.uat-pos.com/',

     invoiceUrl: {
      invoiceApi:
        'https://y9nrqsno2d.execute-api.ap-southeast-1.amazonaws.com/prod/invoice',
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
      url: 'https://d02-spp.uat-pos.com/',
      pgw_url: 'https://fin-pgw-svc.uat-pos.com/'
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
    gleap: {
      api_key: '7xrUJGiYL6cMatEjXzugCNvGAAuG1oMR',
    },
    oms_stores:{
      bizapp: 'bizapp',
      easystore: 'dev@easystore.co'
    },
    version: '1.5'
   };