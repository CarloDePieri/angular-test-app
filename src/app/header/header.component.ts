import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataStorageService } from '../shared/data-storage.service';
import { Subscription } from 'rxjs';
import { User } from '../auth/auth/user.model';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  constructor(
    private DSS: DataStorageService,
    private store: Store<fromApp.AppState>
  ) {}
  userSub: Subscription;
  loggedUser: User = null;

  ngOnInit() {
    this.userSub = this.store.select('auth').subscribe((authState) => {
      this.loggedUser = authState.user;
    });
  }

  onSaveData() {
    this.DSS.storeRecipes();
  }

  onFetchData() {
    this.DSS.fetchRecipes().subscribe();
  }

  onLogout() {
    // this.AS.logout();
    this.store.dispatch(new AuthActions.Logout());
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}
