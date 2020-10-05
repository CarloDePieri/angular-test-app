import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Subject, BehaviorSubject } from 'rxjs';
import { User } from './auth/user.model';
import { Router } from '@angular/router';

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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  signUpEndpoint = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp';
  logInEndpoint =
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';
  apiKey = 'AIzaSyAFldaPumbNxFIeN8alDetNDhI8TAWEMD4';
  user = new BehaviorSubject<User>(null);
  private tokenExpireTimeout: any;

  constructor(private http: HttpClient, private router: Router) {}

  signUp(credentials: { email: string; password: string }) {
    credentials['returnSecureToken'] = true;
    return this.http
      .post<SignUpResponse>(this.signUpEndpoint, credentials, {
        params: {
          key: this.apiKey,
        },
      })
      .pipe(
        catchError(this.handleError),
        tap((data) => {
          this.handleAuthentication(
            data.email,
            data.localId,
            data.idToken,
            data.expiresIn
          );
        })
      );
  }

  autoLogin() {
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }
    const user = new User(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );
    if (!user.token) {
      // Should try to refresh here!
      return;
    }
    this.user.next(user);
    const expiresIn =
      new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
    this.autoLogout(expiresIn);
  }

  autoLogout(expiresIn: number) {
    this.tokenExpireTimeout = setTimeout(() => {
      this.logout();
    }, expiresIn);
  }

  logIn(credentials: { email: string; password: string }) {
    credentials['returnSecureToken'] = true;
    return this.http
      .post<LogInResponse>(this.logInEndpoint, credentials, {
        params: {
          key: this.apiKey,
        },
      })
      .pipe(
        catchError(this.handleError),
        tap((data) => {
          this.handleAuthentication(
            data.email,
            data.localId,
            data.idToken,
            data.expiresIn
          );
        })
      );
  }

  logout() {
    this.user.next(null);
    localStorage.removeItem('userData');
    if (this.tokenExpireTimeout) {
      clearTimeout(this.tokenExpireTimeout);
    }
    this.tokenExpireTimeout = null;
    this.router.navigate(['auth']);
  }

  private handleAuthentication(
    email: string,
    id: string,
    token: string,
    expiresIn: string
  ) {
    const expireDate = new Date(new Date().getTime() + +expiresIn * 1000);
    const user = new User(email, id, token, expireDate);
    this.user.next(user);
    this.autoLogout(+expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error has occurred.';
    if (!error.error || !error.error.error) {
      return throwError(errorMessage);
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
    return throwError(errorMessage);
  }
}
