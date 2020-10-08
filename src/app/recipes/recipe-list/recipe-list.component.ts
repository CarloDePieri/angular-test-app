import { Component, OnInit, OnDestroy } from '@angular/core';
import { Recipe } from '../recipe.model';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from '../store/recipes.actions';
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
})
export class RecipeListComponent implements OnInit, OnDestroy {
  recipes: Recipe[];
  recipesChanged: Subscription;
  recipeSub: Subscription;

  constructor(
    private store: Store<fromApp.AppState>,
    private RS: RecipeService
  ) {}

  ngOnInit(): void {
    // Auto download the recipes if needed
    this.RS.doWithCurrentRecipeState((state) => {
      if (!state.recipes) {
        this.store.dispatch(new RecipesActions.FetchRecipes());
      }
    });
    // Load the recipes from the state once downloaded
    this.recipeSub = this.store.select('recipes').subscribe((state) => {
      this.recipes = state.recipes;
    });
  }

  ngOnDestroy(): void {
    if (this.recipeSub) {
      this.recipeSub.unsubscribe();
    }
  }
}
