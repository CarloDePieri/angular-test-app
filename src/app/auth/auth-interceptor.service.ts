import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpParams,
} from '@angular/common/http';
import { take, exhaustMap, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private store: Store<fromApp.AppState>) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // return this.AS.user.pipe(
    return this.store.select('auth').pipe(
      // Wait for the first user, pass it along and unsubscribe
      take(1),
      // Extract the user from the state
      map((authState) => {
        return authState.user;
      }),
      // Pipe the user in, then replace the user observable with the one returned inside
      exhaustMap((user) => {
        if (user === null) {
          return next.handle(req);
        }
        const authReq = req.clone({
          params: new HttpParams().set('auth', user.token),
        });
        return next.handle(authReq);
      })
    );
  }
}
