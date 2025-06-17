import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on, Action } from '@ngrx/store';

import * as LoginActions from './login.actions';
import { LoginEntity } from './login.models';

export const LOGIN_FEATURE_KEY = 'login';

export interface State extends EntityState<LoginEntity> {
  loggedIn: boolean; // has the user logged in?
  error?: string | null; // last known error (if any)
  token?: string | null; // last known auth token (if any)
  loading: boolean; // is the user currently being logged in?
}

export interface LoginPartialState {
  readonly [LOGIN_FEATURE_KEY]: State;
}

export const loginAdapter: EntityAdapter<LoginEntity> =
  createEntityAdapter<LoginEntity>();

export const initialState: State = loginAdapter.getInitialState({
  // set initial required properties
  loggedIn: false,
  loading: false,
  error: null,
});

const loginReducer = createReducer(
  initialState,
  on(
    LoginActions.login,
    (state): State => ({
      ...state,
      loading: true,
      error: null,
    })
  ),
  on(
    LoginActions.init,
    (state): State => ({
      ...state,
      loggedIn: false,
      error: null,
      token: null,
    })
  ),
  on(
    LoginActions.loginSuccess,
    (state, { login }): State => ({
      ...state,
      loggedIn: true,
      token: login.data?.token,
      loading: false,
      error: null,
    })
  ),
  on(
    LoginActions.loginFailure,
    (state, { error }): State => ({
      ...state,
      error,
      token: null,
      loading: false,
    })
  ),
  on(
    LoginActions.logout,
    (state): State => ({
      ...state,
      loggedIn: false,
      token: null,
    })
  )
);

export function reducer(state: State | undefined, action: Action) {
  return loginReducer(state, action);
}
