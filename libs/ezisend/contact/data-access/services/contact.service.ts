import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact, IContact, IDeleteContact } from '../models/src';
import {} from '@pos/ezisend/shell/ui/nav-sidebar';
import { IResponse } from '@pos/ezisend/shared/data-access/models';
import { environment } from '@pos/shared/environments';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  url = environment.sppUatUrl + 'contacts/v1';

  constructor(private _http: HttpClient) {}

  fetchContacts = (
    page = 1,
    limit = 10,
    keyword = ''
  ): Observable<IResponse<IContact>> => {
    return this._http.get<IResponse<IContact>>(
      `${this.url}/search?page=${page}&limit=${limit}&keyword=${keyword}`
    );
  };

  fetchContactDetail = (contactId: number): Observable<IResponse<{contact: Contact}>> => {
    return this._http.get<IResponse<{contact: Contact}>>(`${this.url}/query?id=${contactId}`);
  }

  saveContact = (params: any, event: string): Observable<IResponse<{id: number}>> => {
    return this._http.post<IResponse<{id: number}>>(`${this.url}/${event}`, params)
  }

  uploadBulkContact = (query: any, data_body: any): Observable<any> => {
    return this._http.post<any>(
      `${this.url}/${query}`,
      data_body
    );
  };

  deleteContacts = (contactIds: number[]) => {
    return this._http.post<IResponse<IDeleteContact>>(`${this.url}/delete`, {
      ids: [...contactIds],
    });
  };
}
