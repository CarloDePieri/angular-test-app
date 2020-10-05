import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataStorageService } from '../shared/data-storage.service';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../auth/auth/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  constructor(
    private DSS: DataStorageService,
    private AS: AuthService,
    private router: Router
  ) {}
  userSub: Subscription;
  loggedUser: User = null;

  ngOnInit() {
    this.userSub = this.AS.user.subscribe((user) => {
      this.loggedUser = user;
    });
  }

  onSaveData() {
    this.DSS.storeRecipes();
  }

  onFetchData() {
    this.DSS.fetchRecipes().subscribe();
  }

  onLogout() {
    this.AS.logout();
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}
