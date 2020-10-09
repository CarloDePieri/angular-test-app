import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Recipe } from './recipe.model';
import * as fromApp from '../store/app.reducer';
import * as RecipesActions from './store/recipes.actions';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take, tap, map } from 'rxjs/operators';
import { RecipeService } from './recipe.service';
import { zip, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RecipesResolverService implements Resolve<Recipe[]> {
  constructor(
    private store: Store<fromApp.AppState>,
    private actions$: Actions,
    private router: Router,
    private RS: RecipeService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const recipes = this.RS.getRecipes();
    if (recipes) {
      // Return recipes if they are already there
      return recipes;
    } else {
      // No recipes object found, try to recover them
      return zip(
        // Set a listener on the FetchRecipes resulting actions
        this.actions$.pipe(
          ofType(
            RecipesActions.SET_RECIPES,
            RecipesActions.FETCH_RECIPES_FAILED
          ),
          take(1)
        ),
        // Dispatch the FetchRecipes action
        of(true).pipe(
          tap((_) => {
            this.store.dispatch(new RecipesActions.FetchRecipes());
          })
        )
      ).pipe(
        map(
          (
            zipValue: [
              RecipesActions.SetRecipes | RecipesActions.FetchRecipesFailed,
              boolean
            ]
          ) => {
            const action = zipValue[0];
            if (action.type === RecipesActions.SET_RECIPES) {
              // FetchRecipes succeeded
              const recipes = action.payload;
              // Check if the requested recipe is present
              if (+route.params.id + 1 > recipes.length) {
                this.router.navigate(['/recipes']);
              }
              return recipes;
            } else {
              // FetchRecipes failed
              this.router.navigate(['/recipes']);
            }
          }
        )
      );
    }
  }
}
