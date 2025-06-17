import { createAction, props } from '@ngrx/store';
import { LoginEntity, LoginResponse } from './login.models';

export const init = createAction('[Login Page] Init');

export const loginSuccess = createAction(
  '[Login/API] Login Success',
  props<{ login: LoginResponse, redirect: boolean }>()
);

export const loginFailure = createAction(
  '[Login/API] Login Failure',
  props<{ error: any }>()
);

export const login = createAction(
  '[Login/Login Button] Login',
  props<{ login: LoginEntity }>()
);

export const logout = createAction('[Login/Logout Button] Logout');
