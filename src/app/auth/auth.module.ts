import { NgModule } from '@angular/core';

import { AuthComponent } from './auth/auth.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [AuthComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '', // lazy loading /auth
        component: AuthComponent,
      },
    ]),
    ReactiveFormsModule,
    SharedModule,
  ],
})
export class AuthModule {}
