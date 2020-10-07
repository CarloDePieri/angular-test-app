import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as SLActions from './store/shopping-list.actions';
import { Ingredient } from '../shared/ingredient.model';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css'],
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  private _ingredients: Ingredient[];

  constructor(private store: Store<fromApp.AppState>) {}

  ngOnInit(): void {
    this.sub = this.store.select('shoppingList').subscribe((stateData) => {
      this._ingredients = stateData.ingredients;
    });
  }

  get ingredients() {
    return this._ingredients;
  }

  onEditItem(id: number) {
    this.store.dispatch(new SLActions.StartEdit(id));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
