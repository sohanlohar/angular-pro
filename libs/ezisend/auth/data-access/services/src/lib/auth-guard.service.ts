import { Injectable } from '@angular/core';
import { Router, CanActivate, NavigationCancel } from '@angular/router';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { LoginFacade } from '@pos/ezisend/auth/data-access/store';
import { map, Observable, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  isLoggedIn$ = this.loginFacade.loggedIn$;
  constructor(private loginFacade: LoginFacade, public router: Router) {}
  canActivate(): Observable<boolean> {
    // If not logged in, redirect to login page
    return this.isLoggedIn$.pipe(
      tap(() =>
        this.router.events.pipe(take(1)).subscribe((event) => {
          if (event instanceof NavigationCancel) {
            const [base, queryParam] = event.url.split('?');
            const pathHistoryData = {
              base: base,
              queryParam: queryParam ? queryParam : '',
            }
            localStorage.setItem('pathHistoryData', JSON.stringify(pathHistoryData));
          }
        })
      ),
      map((loggedIn) => {
        if (!loggedIn && !localStorage.getItem('authToken')) {
          this.router.navigate(['/auth/login']);
        }
        return true;
      })
    );
  }
}
