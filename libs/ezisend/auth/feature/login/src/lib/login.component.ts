import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginFacade } from '@pos/ezisend/auth/data-access/store';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'pos-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  loginLoading$ = this.loginFacade.loginLoading$;
  loggedIn$ = this.loginFacade.loggedIn$;
  loginError$ = this.loginFacade.loginError$;
  authToken$ = this.loginFacade.authToken$;
  errorSubscription?: Subscription;
  protected _onDestroy = new Subject<void>();

  constructor(
    private loginFacade: LoginFacade,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute
  ) {

    this.commonService.downTimeChkOut(this.commonService.mDate, this.commonService.fromDate, this.commonService.toDate);
  }

  ngOnInit(): void {
    this.loginFacade.init();
    this.validateQueryParams();

    this.errorSubscription = this.loginError$
      .pipe(
        takeUntil(this._onDestroy),
        tap((x) => {
          if (x && x !== 'No auth token found') {
            this.openErrorDialog(x);
          } else {
            // checking if not login for multiple account dont navigate it
            this.activatedRoute.queryParams.subscribe(params => {
              const autToken = params['auth_token'];
              if (autToken && this.isValidJwt(autToken)) {
                localStorage.setItem('EmailToken', autToken);
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
              }else{
                this.router.navigate(['/']);
              }
            });
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
  }

  /**
   * Method Name: validateQueryParams
   *
   * Input Parameters:
   *   - activatedRoute (ActivatedRoute): Provides access to query parameters from the route.
   *
   * Output Parameters:
   *   - boolean: Returns true if the query parameter contains a valid JWT token, otherwise returns false.
   *
   * Purpose:
   *   - This method is used to validate the `auth_token` query parameter in the URL. If the token is valid,
   *     it stores the token in local storage as `EmailToken` and clears any old authentication tokens (`authToken` and `refreshToken`).
   *
   * Author:
   *   - Saepul Latif
   *
   * Description:
   *   - The method subscribes to the query parameters of the current route. It checks for the presence of the `auth_token` parameter.
   *     If found, it validates the token using the `isValidJwt()` function. If the token is valid, it stores it in local storage
   *     under the key `EmailToken`, and removes any existing authentication (`authToken`) and refresh tokens (`refreshToken`).
   *     If the token is invalid or not present, the method returns `false`. The subscription to `queryParams` is asynchronous,
   *     so the method initially returns `false` before the subscription completes, which may affect the behavior in some scenarios.
   */

  validateQueryParams(): boolean {
    this.activatedRoute.queryParams.subscribe(params => {
      const autToken = params['auth_token'];
      if (autToken && this.isValidJwt(autToken)) {
        localStorage.setItem('EmailToken', autToken);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        return true;
      }else{
        localStorage.removeItem('EmailToken');
        return false;
      }
    });

    localStorage.removeItem('EmailToken');
    return false;
  }

  /**
   * Method Name: isValidJwt
   *
   * Input Parameters:
   *   - token (string): The JWT token that needs to be validated.
   *
   * Output Parameters:
   *   - boolean: Returns `true` if the token is valid and not expired, otherwise returns `false`.
   *
   * Purpose:
   *   - This method decodes the JWT token, checks for its expiration, and determines whether the token is still valid.
   *
   * Author:
   *   - Saepul Latif
   *
   * Description:
   *   - The method attempts to decode the JWT token using `jwtDecode`. If the token contains an `exp` (expiration) field,
   *     it compares the expiration time with the current time (in seconds). If the expiration time is in the future,
   *     the token is considered valid and the method returns `true`. Otherwise, it returns `false`.
   *   - If the token does not have an expiration date or if decoding the token fails (an exception is caught),
   *     the method returns `false` and logs an error in the console for debugging purposes.
   */
  isValidJwt(token: string): boolean {
    try {
      const decodedToken: any = jwtDecode(token);

      // Check if the token has an expiration date and if it is still valid
      if (decodedToken.exp) {
        const currentTime = Math.floor(new Date().getTime() / 1000); // Get current time in seconds
        return decodedToken.exp > currentTime; // Return true if token is not expired
      } else {
        return false; // No expiration in the token
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      return false; // Token is not valid if decoding fails
    }
  }

  handleLogin({
    username: email,
    password,
  }: {
    username: string;
    password: string;
  }) {
    email = email?.replace(/\s/g, '');
    email = email?.toLowerCase();
    this.loginFacade.login({ email, password });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  openErrorDialog(errorMessage: string) {
    if(errorMessage === 'blocked') {
      this.commonService.openSnackBar(`It seems that your account is ${errorMessage}.
        Please contact your Account Manager for assistance.`, 'Close');
    }

    if(errorMessage === 'unauthorized' || errorMessage === 'invalid') {
      this.dialog.open(DialogComponent, {
        data: {
          title: 'Uh-oh',
          descriptions: `The username or password<br>you entered was incorrect.<br>
          Please try again.`,
          icon: 'warning',
          width: '400',
          confirmEvent: true,
          actionText: 'Confirm',
          actionUrl: 'auth/login',
        },
      });
    }

    if(errorMessage === 'accountDeactivated' ) {
      this.commonService.openSnackBar('Uh-oh! Your account is not active. Please contact account owner for details', 'Close');
    }

    if(errorMessage === 'accountBlocked' ) {
      this.dialog.open(DialogComponent, {
        data: {
          title: 'Uh-oh',
          descriptions: "User invalid or blocked. Please contact customer support",
          icon: 'warning',
          width: '400',
          confirmEvent: true,
          actionText: 'Confirm',
          actionUrl: 'auth/login',
        },
      });
    }
    if(errorMessage === 'migrated') {
      this.dialog.open(DialogComponent, {
        data: {
          title: 'Hello!',
          descriptions: `Please check your email to activate SendParcel Pro account and create a new password.`,
          icon: 'user',
          width: '400',
          confirmEvent: true,
          actionText: 'Close',
          actionUrl: 'auth/login',
        },
      });
    }
    if(errorMessage === 'deleteUser') {
      this.commonService.openSnackBar('Uh-oh! This user does not have the required access.', 'Close');
    }
  }
}
