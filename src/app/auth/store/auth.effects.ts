import { Actions, ofType, Effect } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { tap, switchMap, catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../auth/user.model';
import { AuthService } from '../auth.service';

const logInEndpoint =
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';
const signUpEndpoint =
  'https://identitytoolkit.googleapis.com/v1/accounts:signUp';
const apiKey = 'AIzaSyAFldaPumbNxFIeN8alDetNDhI8TAWEMD4';

interface SignUpResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}
interface LogInResponse extends SignUpResponse {
  registered: boolean;
}

@Injectable()
export class AuthEffects {
  @Effect()
  authSignup = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap(this.authenticate.bind(this))
  );

  @Effect()
  authLogin = this.actions$.pipe(
    // ofType filter observable actions
    ofType(AuthActions.LOGIN_START),
    // switchMap will exhaust the action obs and switch it to a new one
    switchMap(this.authenticate.bind(this))
  );

  // The dispatch: false allow this effect to not return an obs
  @Effect({ dispatch: false })
  authSuccessRedirect = this.actions$.pipe(
    // Activate this at AUTHENTICATE_SUCCESS, the final stage of successful login and signup processes
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    tap((action: AuthActions.AuthenticateSuccess) => {
      if (action.payload.redirect) {
        this.router.navigate(['/']);
      }
    })
  );

  // Clear local storage on logout
  @Effect({ dispatch: false })
  authLogout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap(() => {
      localStorage.removeItem('userData');
      this.authService.clearLogoutTimer();
      this.router.navigate(['/auth']);
    })
  );

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map((action) => {
      const userData: {
        email: string;
        id: string;
        _token: string;
        _tokenExpirationDate: string;
      } = JSON.parse(localStorage.getItem('userData'));
      if (!userData) {
        return { type: 'DUMMY' };
      }
      const date = new Date(userData._tokenExpirationDate);
      const user = new User(userData.email, userData.id, userData._token, date);
      if (!user.token) {
        // Should try to refresh here!
        return { type: 'DUMMY' };
      }
      const expiresIn =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.authService.setLogoutTimer(expiresIn);
      return new AuthActions.AuthenticateSuccess({
        user: user,
        redirect: false,
      });
    })
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  private authenticate(
    action: AuthActions.SignUpStart | AuthActions.LoginStart
  ): Observable<AuthActions.AuthActions> {
    const credentials = {
      email: action.payload.email,
      password: action.payload.password,
      returnSecureToken: true,
    };
    const endpoint =
      action.type === AuthActions.LOGIN_START ? logInEndpoint : signUpEndpoint;
    return this.http
      .post<LogInResponse | SignUpResponse>(endpoint, credentials, {
        params: {
          key: apiKey,
        },
      })
      .pipe(
        map((action) => {
          return this.handleHttpAuthSuccess(action);
        }),
        catchError(this.handleHttpAuthFail)
      );
  }

  private handleHttpAuthSuccess(
    respData: SignUpResponse | LogInResponse
  ): AuthActions.AuthActions {
    // Handle in here successful http authentication response
    const expireDate = new Date(
      new Date().getTime() + +respData.expiresIn * 1000
    );
    const user = new User(
      respData.email,
      respData.localId,
      respData.idToken,
      expireDate
    );
    localStorage.setItem('userData', JSON.stringify(user));
    this.authService.setLogoutTimer(+respData.expiresIn * 1000);
    return new AuthActions.AuthenticateSuccess({ user: user, redirect: true });
  }

  private handleHttpAuthFail(
    error: HttpErrorResponse
  ): Observable<AuthActions.AuthActions> {
    // Handle in here http errors
    // IMPORTANT: Since this will be called inside a catchError filter that will kill the Event Observable, we need to
    // return a new Observable<action>, since the whole Event Observable can never die

    let errorMessage = 'An unknown error has occurred.';
    if (!error.error || !error.error.error) {
      return of(new AuthActions.AuthenticateFail(errorMessage));
    }
    switch (error.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email is already used by another account!';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'Could not find an account with this address.';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'Wrong password';
        break;
    }
    return of(new AuthActions.AuthenticateFail(errorMessage));
  }
}
