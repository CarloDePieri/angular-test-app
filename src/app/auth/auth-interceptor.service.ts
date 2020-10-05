import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpParams,
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { take, exhaustMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private AS: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.AS.user.pipe(
      // Wait for the first user, pass it along and unsubscribe
      // Since user its a BehaviorSubject it will immediately return null or the last one
      take(1),
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
