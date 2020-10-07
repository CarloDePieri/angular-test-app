import {
  Component,
  OnInit,
  ComponentFactoryResolver,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertComponent } from 'src/app/shared/alert/alert.component';
import { PlaceholderDirective } from 'src/app/shared/placeholder.directive';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from 'src/app/store/app.reducer';
import * as AuthActions from '../store/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit, OnDestroy {
  isLoginMode = true;
  isLoading = false;
  credForm: FormGroup;
  error: string = null;
  @ViewChild(PlaceholderDirective, { static: false })
  alertHost: PlaceholderDirective;
  alertSub: Subscription;
  storeSub: Subscription;

  constructor(
    private fb: FormBuilder,
    private cfr: ComponentFactoryResolver,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit(): void {
    this.credForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.storeSub = this.store.select('auth').subscribe((state) => {
      this.isLoading = state.loading;
      this.error = state.authError;
      if (this.error) {
        this.showErrorAlert(this.error);
      }
    });
  }

  private showErrorAlert(errorMessage: string) {
    // Create a factory of type AlertComponent
    const alertFactory = this.cfr.resolveComponentFactory(AlertComponent);
    // Recover the viewControllerRef from the placeholder directive on the alertHost component
    const hostViewContainerRef = this.alertHost.viewContainerRef;
    // Clear all component already in the viewContainerRef
    hostViewContainerRef.clear();
    // Create the component by passing the right factory to the viewContainerRef method
    const componentRef = hostViewContainerRef.createComponent(alertFactory);
    // Access Input fields directly
    componentRef.instance.message = errorMessage;
    // Subscribe to Output events to react to them
    this.alertSub = componentRef.instance.close.subscribe(() => {
      // Clear the component
      hostViewContainerRef.clear();
      // Unsubscribe right now since it's no longer needed
      this.alertSub.unsubscribe();
    });
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit() {
    if (!this.credForm.valid) {
      return;
    }
    const credentials = this.credForm.value;
    if (this.isLoginMode) {
      this.store.dispatch(new AuthActions.LoginStart(credentials));
    } else {
      this.store.dispatch(new AuthActions.SignUpStart(credentials));
    }
  }

  ngOnDestroy() {
    if (this.alertSub) {
      this.alertSub.unsubscribe();
    }
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }
}
