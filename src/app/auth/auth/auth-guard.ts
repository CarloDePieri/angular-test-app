import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable, of, zip } from 'rxjs';
import { take, map, tap, switchMap } from 'rxjs/operators';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from 'src/app/store/app.reducer';
import * as AuthActions from 'src/app/auth/store/auth.actions';
import { Actions, ofType } from '@ngrx/effects';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private store: Store<fromApp.AppState>,
    private actions$: Actions,
    @Inject(PLATFORM_ID) private platformId
  ) {}

  tryLocalStorage(): Observable<boolean | UrlTree> {
    // HUGE kludge alert

    // zip will start two Obs one right after the other, without waiting, and produce a result (their outputs as a [])
    // only when both Obs returned a value
    return zip(
      // This first Obs will wait on the actions pipe and filter in the two possible results of the AutoLogin action
      this.actions$.pipe(
        ofType(
          AuthActions.AUTHENTICATE_SUCCESS,
          AuthActions.AUTHENTICATE_NO_LOCAL_DATA
        ),
        take(1)
      ),
      // This Obs will dispatch the AutoLogin action
      of(true).pipe(
        tap((_) => {
          this.store.dispatch(new AuthActions.AutoLogin());
        }),
        take(1)
      )
    ).pipe(
      // To get here both Obs must have returned, which means that based on the action.type of the first one value we
      // can determine the result of AutoLogin, and treat the AuthGuard consequently
      map(
        (
          zipResult: [
            (
              | AuthActions.AuthenticateSuccess
              | AuthActions.AuthenticateNoLocalData
            ),
            boolean
          ]
        ) => {
          const action = zipResult[0];
          if (action.type === AuthActions.AUTHENTICATE_SUCCESS) {
            return true;
          } else {
            return this.router.createUrlTree(['/auth']);
          }
        }
      )
    );
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this.store.select('auth').pipe(
      switchMap((authState) => {
        if (authState.user) {
          // The user is already logged in
          return of(true);
        } else {
          // Make sure that no localStorage access is attempted if we are not executing on the browser
          if (isPlatformBrowser(this.platformId)) {
            // The user is not already logged in OR the page just refreshed and no AutoLogin action has been dispatched
            // Thanks to initialNavigation: 'enabled' in the router config, all route guards execute BEFORE any actual
            // component rendering (so no AutoLogin can dispatched by, for example, app.component.ts)
            return this.tryLocalStorage();
          } else {
            return of(this.router.createUrlTree(['/auth']));
          }
        }
      })
    );
  }
}
