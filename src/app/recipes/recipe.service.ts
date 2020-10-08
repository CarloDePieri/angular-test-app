import { Injectable } from '@angular/core';
import { Recipe } from './recipe.model';
import { Ingredient } from '../shared/ingredient.model';
import * as fromApp from '../store/app.reducer';
import * as fromRecipes from './store/recipes.reducer';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

export type RecipeData = {
  name: string;
  description: string;
  imagePath: string;
  ingredients?: Array<IngredientData>;
};

type IngredientData = {
  name: string;
  amount: number;
};

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  getRecipeId(recipe: Recipe): number {
    let id = -1;
    this.doWithCurrentRecipeState((state) => {
      state.recipes.forEach((rec, index) => {
        if (rec.name == recipe.name) {
          id = index;
        }
      });
    });
    return id;
  }
  getRecipes(): Recipe[] {
    let recipes = null;
    this.doWithCurrentRecipeState((state) => {
      recipes = state.recipes;
    });
    return recipes;
  }

  doWithCurrentRecipeState(f: (state: fromRecipes.State) => void) {
    // f will be called synchronously since take(1) returns as soon as the first state is available,
    // and a state is always ensured to be there; also, it kills the observable and the subscription
    this.store.select('recipes').pipe(take(1)).subscribe(f);
  }

  constructor(private store: Store<fromApp.AppState>) {}

  newRecipeFromData(data: RecipeData): Recipe {
    return new Recipe(
      data.name,
      data.description,
      data.imagePath,
      data.ingredients.map((data: IngredientData) => {
        return new Ingredient(data.name, data.amount);
      })
    );
  }
}
