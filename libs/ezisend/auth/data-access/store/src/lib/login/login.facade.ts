import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import * as LoginActions from './login.actions';
import { LoginEntity } from './login.models';
import * as LoginSelectors from './login.selectors';

@Injectable({
  providedIn: 'root',
})
export class LoginFacade {
  /**
   * Combine pieces of state using createSelector,
   * and expose them as observables through the facade.
   */
  loggedIn$ = this.store.select(LoginSelectors.selectLoggedIn);
  loginError$ = this.store.select(LoginSelectors.selectLoginError);
  loginLoading$ = this.store.select(LoginSelectors.selectLoginLoading);
  authToken$ = this.store.select(LoginSelectors.selectAuthToken);

  constructor(private readonly store: Store) {}

  /**
   * Use the initialization action to perform one
   * or more tasks in your Effects.
   */
  init() {
    this.store.dispatch(LoginActions.init());
  }

  login(login: LoginEntity) {
    this.store.dispatch(LoginActions.login({ login }));
  }

  logout() {
    this.store.dispatch(LoginActions.logout());
  }
}
