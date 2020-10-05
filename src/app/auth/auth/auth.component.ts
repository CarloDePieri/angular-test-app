import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  isLoading = false;
  credForm: FormGroup;
  error: string = null;

  constructor(
    private fb: FormBuilder,
    private AS: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.credForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
        }
      );
    }
  }
}
