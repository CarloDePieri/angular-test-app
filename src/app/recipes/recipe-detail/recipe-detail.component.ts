import { Component, OnInit, Input } from '@angular/core';
import { Recipe } from '../recipe.model';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as SLActions from '../../shopping-list/store/shopping-list.actions';
import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from '../store/recipes.actions';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css'],
})
export class RecipeDetailComponent implements OnInit {
  @Input() recipe: Recipe;
  id: number;

  constructor(
    private route: ActivatedRoute,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params: Params) => {
          // save the id from the route
          this.id = +params['id'];
          // transform the observable into a state one
          return this.store.select('recipes');
        }),
        map((state) => {
          // extract the right recipe from the state
          return state.recipes.find((recipe, index) => {
            return index === this.id;
          });
        })
      )
      .subscribe((recipe: Recipe) => {
        this.recipe = recipe;
      });
  }

  addIngredients() {
    this.store.dispatch(new SLActions.AddIngredients(this.recipe.ingredients));
  }

  deleteRecipe() {
    this.store.dispatch(new RecipesActions.DeleteRecipe(this.id));
  }
}
