import { IHSC, IntlCountryCode } from '@pos/ezisend/shared/data-access/models';

export interface IShipment {
  shipments: IDataShipment[];
  total: number;
}

export interface IDataShipment {
  tracking_id: string;
  parcel_width: string;
  parcel_height: string;
  parcel_length: string;
  parcel_volumetric_weight: string;
  item_description: string;
  premium_amount: null;
  created_date: string;
  channel_order: {
    channel: string,
    order_id: string,
  }
  delivery_details: any;
  id: number;
  is_cod: boolean;
  location: string;
  modified_date: string;
  order_amount: number;
  reason: string;
  recipient: any;
  status: string;
  tracking_details: any;
  type: string;
  pickup_details: {
    width?: null;
    height?: null;
    length?: null;
    volumetric_weight?: null;
    item_description?: null;
    pickup_number: string;
    pickup_datetime: string;
    pickup_address: string;
    total_quantity: string;
    total_weight: string;
  };
  sum_insured?: boolean;
  tracking_event_reason_code?: string | string[];
}

export interface IShipmentParamFilter {
  uitab?: string;
  start_date?: string;
  end_date?: string;
  pickup_start_date?: string;
  pickup_end_date?: string;
  tracking_id?: string;
  shipment_status?: string;
  order_status?: string;
  pickup_status?: string;
  pickup_no?: string;
  shipment_id?: string;
  recipient?: string;
  shipment_type?: string;
  order_type?: string;
  cod_type?: string;
  product_type?: string;
  keyword?: string;
  page?: number;
  limit?: number;
  view_option?: string;
  is_select_all?: boolean;
}

export interface IParcelDetails {
  category: string;
  category_details: string;
  ccod_amount: number;
  cod_amount: number;
  description: string;
  height: number;
  insured_premium: number;
  is_ccod: boolean;
  is_cod: boolean;
  is_insured: boolean;
  length: number;
  notes: string;
  parcel_Info: {
    children: IChildrenDetails[];
  };
  product: string;
  sum_insured: number;
  total_sum_insured: number;
  type: string;
  volumetric_weight: number;
  chargeableWeight: number;
  weight: number;
  width: number;
  total_mps_weight?: number;
  sender_ref?: string;
}

export interface IChildrenDetails {
  category: string;
  created_date: string;
  description: string;
  height: number;
  id: number;
  insured_premium: number;
  is_insured: boolean;
  child_isInsurance: boolean;
  child_premAmt: number;
  length: number;
  sum_insured: number;
  tracking_id: number;
  volumetric_weight: number;
  chargeableWeight: number;
  weight: number;
  width: number;
  deleted: boolean;
}

export interface IRecipientSenderDetails {
  address: string;
  address1: string;
  address2: string;
  address3: string;
  address4: string;
  city: string;
  company_name: string;
  country: string;
  dialing_code: string;
  email: string;
  name: string;
  phone_no: string;
  postcode: string;
  state: string;
}

export interface ICustomDetails {
  country_of_origin: string;
  hscode: string;
  id: number;
  item_category: string;
  parcel_description: string;
  quantity: number;
  value: number;
  weight: number;
}

export interface ICustomDetailFormGroup {
  parcel_type: IHSC;
  item_description: string;
  weight: number;
  quantity: number;
  value: number;
  country: {
    countryCode: string;
    name: IntlCountryCode;
  }
}

export interface IMpsChildShipmentFormGroup {
  child_weight: number;
  child_width: number;
  child_length: number;
  child_height: number;
  child_volumetric_weight: number;
  child_chargeable_weight: number;
  child_description: string;
  child_isInsurance: boolean;
  child_sumInsured: number;
  child_premAmt: number;
}

export interface IOrderDetails {
  created_date: 'string';
  channel_order: {
    channel:string,
    order_id:string,
    store_name:string
  }
  custom_details: ICustomDetails[];
  id: number;
  parcel_details: IParcelDetails;
  recipient_details: IRecipientSenderDetails;
  routing_code: string;
  sender_details: IRecipientSenderDetails;
  status: string;
  tracking_id: string;
  // not returned from backend, used only in frontend
  uiOrderDate?: string;
  tracking_detail?:any;
  uiOrderTime?: string;
  uiSenderPhoneNumber: string;
  uiRecipientPhoneNumber: string;
  uiParcelDimension: string;
  children: IMpsChildShipmentFormGroup[];
  total_child_shipments: number;
}

export interface IShipmentSummaryTotal {
  delivered_shipment_count: number
  failed_delivery_count: number
  live_shipment_count: number
  pending_pickup_count: number
  request_pickup_count: number
  return_cancelled_count: number
  total_cod_collected: number
  total_failed_cod_amount: number
  total_pending_cod_amount: number
}
