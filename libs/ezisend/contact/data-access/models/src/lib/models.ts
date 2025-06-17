export interface Contact {
  id: number;
  person: string;
  contact_person?: string;
  company_name: string;
  mobile: any;
  dialing_code: string;
  email: string;
  address: string;
  postcode: string;
  city: any;
  state: any;
  country: any;
}

export interface IContact {
  contacts: Contact[];
  total: number;
}

export interface IDeleteContact {
  id: number;
  status: string;
}
