import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
//TODO: Fix circular dependency
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  LoginEntity,
  LoginResponse,
  MeResponse,
} from '@pos/ezisend/auth/data-access/store';
import { environment } from '@pos/shared/environments';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  SPPAPI = environment.sppUatUrl;
  url = this.SPPAPI + 'user/v1/login';
  badgeUrl = this.SPPAPI + 'user/v1/badge';
  configUrl = this.SPPAPI + 'user/v1/config';
  private codStatus = false;
  private codUbatStatus = false;
  codStatusUpdated = new Subject<boolean>();
  codUbatStatusUpdated = new Subject<boolean>();
  globalSearch = new BehaviorSubject<any>('')
  constructor(private http: HttpClient) {}

  login({ email, password }: LoginEntity): Observable<LoginResponse> {
    localStorage.setItem('pRequestId', uuidv4());
    return this.http.post<LoginResponse>(this.url, { email, password });
  }

  me() {
    return this.http.get<MeResponse>(this.badgeUrl);
  }

  config() {
    return this.http.get<MeResponse>(this.configUrl);
  }

  getCodStatus() {
    return this.codStatus;
  }

  getUbatCodStatus() {
    return this.codUbatStatus;
  }

  setCodStatus(status: boolean) {
    this.codStatus = status;
    this.codStatusUpdated.next(status);
  }

  setCodUbatStatus(status: boolean) {
    this.codUbatStatus = status;
    this.codUbatStatusUpdated.next(status);
  }
  async hashEmail(email: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(email);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedEmail = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return hashedEmail;
  }
}
