import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from 'src/app/store/app.reducer';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private store: Store<fromApp.AppState>) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this.store.select('auth').pipe(
      // Wait for the first user, pass it along and unsubscribe
      take(1),
      // Extract the user from the state
      map((authState) => {
        return authState.user;
      }),
      map((user) => {
        const authenticated = !!user;
        if (authenticated) {
          return true;
        }
        return this.router.createUrlTree(['/auth']);
      })
    );
  }
}
