import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Recipe } from './recipe.model';
import * as fromApp from '../store/app.reducer';
import * as RecipesActions from './store/recipes.actions';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take } from 'rxjs/operators';
import { RecipeService } from './recipe.service';

@Injectable({
  providedIn: 'root',
})
export class RecipesResolverService implements Resolve<Recipe[]> {
  constructor(
    private store: Store<fromApp.AppState>,
    private actions$: Actions,
    private RS: RecipeService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const recipes = this.RS.getRecipes();
    if (recipes) {
      return recipes;
    } else {
      this.store.dispatch(new RecipesActions.FetchRecipes());
      // This kludge waits for the first SET_RECIPES action (which will be called as a result of the FetchRecipes
      // action dispatched before) and returns it (it's synchronous). Actions are Observable<...>, and SetRecipes has
      // Recipe[] as payload so the resolve method is happy
      return this.actions$.pipe(ofType(RecipesActions.SET_RECIPES), take(1));
    }
  }
}
