import {
  ICity,
  IntlCountryCode,
  IState,
} from '@pos/ezisend/shared/data-access/models';

export interface IPickupAddress {
  address: string;
  city: any;
  country: string | { countryCode: string; name: IntlCountryCode };
  email: string;
  id: number | null;
  is_default: boolean;
  name: string;
  nick_name: string;
  phone_no: string;
  postcode: string;
  state: any;
  dialing_code?: string;
}

export interface IProfile {
  name: string;
  company_name: string;
  phone_no: string;
  email: string;
  address: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
}

export interface IPluginList {
  stores: IStores[];
  total: number;
}

export interface IStores {
  id: string,
  external_id: string,
  account_no: string,
  name: string,
  url: string,
  image_url: string,
  status: string
}
