import { Actions, Effect, ofType } from '@ngrx/effects';
import * as RecipesActions from './recipes.actions';
import {
  switchMap,
  map,
  catchError,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { RecipeData, RecipeService } from '../recipe.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { Recipe } from '../recipe.model';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const endpoint = 'https://test-angular-cbc17.firebaseio.com/recipes.json';

@Injectable()
export class RecipesEffects {
  @Effect()
  fetchRecipes = this.actions$.pipe(
    ofType(RecipesActions.FETCH_RECIPES),
    switchMap(() => {
      return this.http.get<[RecipeData]>(endpoint);
    }),
    map((recipesData): Recipe[] => {
      return recipesData.map((recipeData) => {
        // fix possibly missing 'ingredients' field
        if (!('ingredients' in recipeData)) {
          recipeData['ingredients'] = [];
        }
        // transform data into a recipe
        return this.RS.newRecipeFromData(recipeData);
      });
    }),
    map((recipes) => {
      return new RecipesActions.SetRecipes(recipes);
    }),
    catchError((error) => {
      return of();
    })
  );

  @Effect({ dispatch: false })
  storeRecipes = this.actions$.pipe(
    ofType(RecipesActions.STORE_RECIPES),
    withLatestFrom(this.store.select('recipes')),
    switchMap(([_, recipeState]) => {
      return this.http.put(endpoint, recipeState.recipes);
    }),
    catchError((_) => {
      return of();
    })
  );

  @Effect({ dispatch: false })
  redirectAfterAdd = this.actions$.pipe(
    ofType(RecipesActions.ADD_RECIPE),
    tap((action: RecipesActions.AddRecipe) => {
      const recipeId = this.RS.getRecipeId(action.payload);
      this.router.navigate(['/recipes', recipeId]);
    })
  );

  @Effect({ dispatch: false })
  redirectAfterEdit = this.actions$.pipe(
    ofType(RecipesActions.UPDATE_RECIPE),
    tap((action: RecipesActions.UpdateRecipe) => {
      const recipeId = this.RS.getRecipeId(action.payload.recipe);
      this.router.navigate(['/recipes', recipeId]);
    })
  );

  @Effect({ dispatch: false })
  redirectAfterDelete = this.actions$.pipe(
    ofType(RecipesActions.DELETE_RECIPE),
    tap(() => {
      this.router.navigate(['/recipes']);
    })
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private store: Store<fromApp.AppState>,
    private RS: RecipeService
  ) {}
}
