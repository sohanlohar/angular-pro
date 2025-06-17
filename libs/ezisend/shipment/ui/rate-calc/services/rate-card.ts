import { ICity } from "@pos/ezisend/shared/data-access/models";

// RateCard interface definition
export interface RateCard {
  id?: number;
  account_no?: string;
  zone: number;
  first_weight: number;
  first_price: number;
  additional_weight: number;
  additional_price: number;
}

// Response interface definition
export interface RateCardResponse {
  code: string;
  message: string;
  data: {
      rate_cards: RateCard[];
  };
}
export interface RateCalculatorData {
  rate_cards: RateCard[];
} 

export interface IState {
  state_code: string;
}

export interface ICityResponse {
  code: string;
  message: string; 
  data: ICity[]; 
}
export interface ZoneResponse {
  code: string;
  message: string;
  data: {
    zone: number;
  };
}