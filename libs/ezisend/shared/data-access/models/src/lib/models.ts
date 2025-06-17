export interface BreadcrumbItem {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routerLink?: any[];
  external?: boolean;
  current: boolean;
  query?: object;
}

export interface IResponse<T> {
  code: string;
  message: string;
  data: T;
  error?: any;
}

export interface IHSC {
  hscode: string;
  keyword: string;
}

export interface IntlCountryCode {
  calling_code: string;
  code: string;
  country: string;
}

export interface ICountry {
  countries: IntlCountryCode[];
}

export interface IDataCuntry {
  countryCode: string;
  name: IntlCountryCode;
}

export interface IState {
  abbr: string;
  country_code: string;
  country_name: string;
  state_code: string;
  state_name: string;
}

export interface ICity {
  city_name: string;
  country: string;
  state_code: string;
  state_name: string;
}

export interface ShipmentSent {
  Key?: string,
  Count?: number,
  Date?: string,
  Percentage?: number
}