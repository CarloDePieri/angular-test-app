import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShoppingListComponent } from './shopping-list.component';
import { AuthGuard } from '../auth/auth/auth-guard';

const routes: Routes = [
  {
    path: '', // lazy loading /shopping
    canActivate: [AuthGuard],
    component: ShoppingListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShoppingListRouting {}
