import {
  Component,
  OnInit,
  ComponentFactoryResolver,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { AlertComponent } from 'src/app/shared/alert/alert.component';
import { PlaceholderDirective } from 'src/app/shared/placeholder.directive';
import { Subscription } from 'rxjs';

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

  constructor(
    private fb: FormBuilder,
    private AS: AuthService,
    private router: Router,
    private cfr: ComponentFactoryResolver
  ) {}

  ngOnInit(): void {
    this.credForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
    this.isLoading = true;

    const credentials = this.credForm.value;

    if (this.isLoginMode) {
      this.AS.logIn(credentials).subscribe(
        (data) => {
          this.isLoading = false;
          this.router.navigate(['/recipes']);
        },
        (errorMessage) => {
          this.isLoading = false;
          this.error = errorMessage;
          this.showErrorAlert(errorMessage);
        }
      );
    } else {
      this.AS.signUp(credentials).subscribe(
        (data) => {
          this.isLoading = false;
          this.router.navigate(['/recipes']);
        },
        (errorMessage) => {
          this.isLoading = false;
          this.error = errorMessage;
          this.showErrorAlert(errorMessage);
        }
      );
    }
  }

  ngOnDestroy() {
    if (this.alertSub) {
      this.alertSub.unsubscribe();
    }
  }
}
