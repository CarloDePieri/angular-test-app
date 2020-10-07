import { Injectable } from '@angular/core';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenExpireTimeout: any;

  constructor(private store: Store<fromApp.AppState>) {}

  setLogoutTimer(expiresIn: number) {
    this.tokenExpireTimeout = setTimeout(() => {
      this.store.dispatch(new AuthActions.Logout());
    }, expiresIn);
  }

  clearLogoutTimer() {
    if (this.tokenExpireTimeout) {
      clearTimeout(this.tokenExpireTimeout);
      this.tokenExpireTimeout = null;
    }
  }
}
