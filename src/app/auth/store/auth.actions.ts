import { Action } from '@ngrx/store';
import { User } from '../auth/user.model';

export const LOGIN_START = '[Auth] Login Start';
export const AUTHENTICATE_FAIL = '[Auth] Authenticate Fail';
export const AUTHENTICATE_SUCCESS = '[Auth] Authenticate Success';
export const SIGNUP_START = '[Auth] SignUp Start';
export const LOGOUT = '[Auth] Logout';
export const CLEAR_ERROR = '[Auth] Clear Error';
export const AUTO_LOGIN = '[Auth] Auto Login';

export class Authenticate implements Action {
  readonly type = AUTHENTICATE_SUCCESS;
  constructor(public payload: User) {}
}

export class AutoLogin implements Action {
  readonly type = AUTO_LOGIN;
  constructor() {}
}

export class Logout implements Action {
  readonly type = LOGOUT;
  constructor() {}
}

export class LoginStart implements Action {
  readonly type = LOGIN_START;
  constructor(public payload: { email: string; password: string }) {}
}

export class SignUpStart implements Action {
  readonly type = SIGNUP_START;
  constructor(public payload: { email: string; password: string }) {}
}

export class AuthenticateFail implements Action {
  readonly type = AUTHENTICATE_FAIL;
  constructor(public payload: string) {}
}

export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
  constructor() {}
}

export type AuthActions =
  | AutoLogin
  | Authenticate
  | Logout
  | LoginStart
  | AuthenticateFail
  | SignUpStart
  | ClearError;
