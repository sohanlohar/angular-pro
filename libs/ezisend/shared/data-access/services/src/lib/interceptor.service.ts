import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpEvent,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
  HttpClient,
} from '@angular/common/http';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { CommonService } from './common.service';
import { datadogRum } from '@datadog/browser-rum';
import { environment } from '@pos/shared/environments';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EzisendInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private _commonService: CommonService,
    private httpClient: HttpClient) {

  }

  intercept(
    httpRequest: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    this._commonService.downTimeChkOut(this._commonService.mDate, this._commonService.fromDate, this._commonService.toDate);
    /**
     * We are skipping the interceptor for any request that have an authorization header set.
     * This is because we have few services such as in CommonService that require the authorization header to be set as Basic Auth.
     */

    if (httpRequest.headers.has('Authorization')) {
      return next.handle(httpRequest);
    }

    /**
     * We are retreiving the authorization header from the local storage. If there's no authorization header in the local storage,
     * we are returning the request as it is.
     */
    const authToken = localStorage.getItem('authToken');
    const pReqId = localStorage.getItem('pRequestId');
    const EmailToken = localStorage.getItem('EmailToken');

    if (authToken) {
      httpRequest = httpRequest.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
          P_Request_Id: `${pReqId}`,
          "X-Request-ID": uuidv4()
        },
      });
    }

    // for validation of multiple account
    if (EmailToken) {
      httpRequest = httpRequest.clone({
        setHeaders: {
          Authorization: `EmailToken ${EmailToken}`,
          "X-Request-ID": uuidv4()
        },
      });
    }

    return next.handle(httpRequest).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401 && !httpRequest.url.includes('login')) {
            return this.handle401Error(httpRequest, next);
          }
          if ((err.error?.status === 403 && err.error?.error?.code === 'E1004')) {
            this._commonService.openCustomErrorDialog(err);
          }
          return throwError(() => ({error: err}));
        }
        return throwError(() => ({error: err}));
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken)
        return this._commonService.refreshToken('user').pipe(
          switchMap((res: any) => {
            this.isRefreshing = false;

            localStorage.setItem('refreshToken', res.data.refreshToken);
            localStorage.setItem('authToken', res.data.token);
            this.refreshTokenSubject.next(res.data.token);

            return next.handle(this.addTokenHeader(request, res.data.token));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            if(err.status === 401){
              this._commonService.logout();
            }

            return throwError(err);
          })
        );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(request, token)))
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({headers: request.headers.set('Authorization', `Bearer ${token}`)});
  }
}
