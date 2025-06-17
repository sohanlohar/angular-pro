import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LOGIN_FEATURE_KEY, State } from './login.reducer';

// Lookup the 'Login' feature state managed by NgRx
export const selectLoginState = createFeatureSelector<State>(LOGIN_FEATURE_KEY);

export const selectLoggedIn = createSelector(
  selectLoginState,
  (state: State) => state.loggedIn
);

export const selectLoginError = createSelector(
  selectLoginState,
  (state: State) => state.error
);

export const selectAuthToken = createSelector(
  selectLoginState,
  (state: State) => state.token
);

export const selectLoginLoading = createSelector(
  selectLoginState,
  (state: State) => state.loading
);
