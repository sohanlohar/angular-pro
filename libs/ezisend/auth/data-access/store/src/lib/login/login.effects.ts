/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { DataPersistence, fetch } from '@nrwl/angular';
//TODO: Fix circular dependency
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { LoginService } from '@pos/ezisend/auth/data-access/services';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { AuthErrorCodes } from '@pos/ezisend/auth/data-access/models';

import * as LoginActions from './login.actions';
import * as LoginFeature from './login.reducer';
import { of } from 'rxjs';
declare const window: any;

@Injectable()
export class LoginEffects {
  init$ = createEffect(() => {
    return this.dataPersistence.fetch(LoginActions.init, {
      run: (
        action: ReturnType<typeof LoginActions.init>,
        state: LoginFeature.LoginPartialState
      ) => {
        const token = localStorage.getItem('authToken');
        const refreshtoken = localStorage.getItem('refreshToken');
        if (token && refreshtoken) {
          return LoginActions.loginSuccess({
            login: {
              code: '',
              message: 'Token retreived from local storage',
              data: { token, refreshtoken },
            },
            redirect: false,
          });
        } else {
          throw new Error('No auth token found');
        }
      },
      onError: (action: ReturnType<typeof LoginActions.init>, error) => {
        return LoginActions.loginFailure({ error: error.message });
      },
    });
  });

  getCookie(name: string): string {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === name) {
        return value || ''; // Return value or empty string
      }
    }
    return '';
  }  

  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LoginActions.login),
      mergeMap((action) => 
        this.service.login(action.login).pipe(
          mergeMap((res) => {
            if (res.data?.token && res.data?.refreshtoken) {
              localStorage.setItem('authToken', res.data.token);
              localStorage.setItem('refreshToken', res.data.refreshtoken);
              localStorage.removeItem('EmailToken');
              return this.service.hashEmail(action.login.email).then((hashedEmail) => {
                const clientId = this.getCookie('_ga');
                const loginSuccessData = {
                  event: 'login',
                  event_category: 'SendParcel Pro - Login',
                  event_action: 'Login Success',
                  event_label: 'Success',
                  user_id: hashedEmail,
                  ga_clientid: clientId,
                  portal_type: 'SendParcel Pro',
                };
                window.dataLayer.push(loginSuccessData);
   
                return LoginActions.loginSuccess({
                  login: res,
                  redirect: true,
                });
              });
            } else {
              const loginFailureData = {
                event: 'login_failure',
                event_category: 'SendParcel Pro - Login',
                event_action: 'Login Failure',
                event_label: 'Failure',
              };
              window.dataLayer.push(loginFailureData);
              return of(
                LoginActions.loginFailure({ error: res.message })
              );
            }
          }),
          catchError((error: HttpErrorResponse) => {
            const errorMessage =
              AuthErrorCodes[
                error.error.error.code as keyof typeof AuthErrorCodes
              ] ?? 'unauthorized';
              const loginFailureData = {
                event: 'login_failure',
                event_category: 'SendParcel Pro - Login',
                event_action: 'Login Failure',
                event_label: 'Failure',
              };
              window.dataLayer.push(loginFailureData);
  
            return of(
              LoginActions.loginFailure({ error: errorMessage })
            );
          })
        )
      )
    );
  });

  loginFailure$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(LoginActions.loginFailure),
        map((action) => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        })
      );
    },
    { dispatch: false }
  );

  logout$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(LoginActions.logout),
        map((action) => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          this.router.navigate(['/auth/login']);
        })
      );
    },
    { dispatch: false }
  );

  loginSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(LoginActions.loginSuccess),
        map((action) => {
          if (action.redirect) {
            return this.router.navigateByUrl('/');
          }

          let decodedPathHistory = null;
          const pathHistory = localStorage.getItem('pathHistoryData');
          if (pathHistory) {
            decodedPathHistory = JSON.parse(pathHistory);
            localStorage.removeItem('pathHistoryData');
          }

          if (!decodedPathHistory) {
            return false;
          }

          let absolutePath = decodedPathHistory.base;
          absolutePath += decodedPathHistory.queryParam
            ? `?${decodedPathHistory.queryParam}`
            : '';

          return this.router.navigateByUrl(absolutePath);
        })
      );
    },
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly dataPersistence: DataPersistence<LoginFeature.LoginPartialState>,
    private service: LoginService,
    private router: Router
  ) {}
}
