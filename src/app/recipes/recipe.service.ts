import { Injectable, EventEmitter } from '@angular/core';
import { Recipe } from './recipe.model';
import { Ingredient } from '../shared/ingredient.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  getRecipeId(recipe: Recipe): number {
    let id = -1;
    this.recipes.forEach((rec, index) => {
      if (rec.name == recipe.name) {
        id = index;
      }
    });
    return id;
  }

  recipeListChanged = new Subject<Recipe[]>();

  private recipes: Recipe[] = [
    new Recipe(
      'A test recipe 1',
      'simply a test',
      'https://www.telegraph.co.uk/content/dam/food-and-drink/2019/01/11/TELEMMGLPICT000185036503_trans_NvBQzQNjv4BqodXSHHE-j78vyZ0iwRUmY_nuzprQ_mxVCWqrJBTJk3A.jpeg',
      [new Ingredient('bread', 1), new Ingredient('flour', 1)]
    ),
    new Recipe(
      'A test recipe 2',
      'simply a test',
      'https://www.telegraph.co.uk/content/dam/food-and-drink/2019/01/11/TELEMMGLPICT000185036503_trans_NvBQzQNjv4BqodXSHHE-j78vyZ0iwRUmY_nuzprQ_mxVCWqrJBTJk3A.jpeg',
      [new Ingredient('salt', 2), new Ingredient('mango', 2)]
    ),
    new Recipe(
      'A test recipe 3',
      'simply a test',
      'https://www.telegraph.co.uk/content/dam/food-and-drink/2019/01/11/TELEMMGLPICT000185036503_trans_NvBQzQNjv4BqodXSHHE-j78vyZ0iwRUmY_nuzprQ_mxVCWqrJBTJk3A.jpeg',
      [new Ingredient('pepper', 3), new Ingredient('strawberries', 3)]
    ),
  ];

  constructor() {}

  getRecipes() {
    return this.recipes.slice();
  }

  getRecipe(id: number): Recipe {
    return this.recipes[id];
  }

  newRecipeFromData(data: {
    name: string;
    description: string;
    imagePath: string;
    ingredients: Array<{ name: string; amount: number }>;
  }): Recipe {
    return new Recipe(
      data.name,
      data.description,
      data.imagePath,
      data.ingredients.map((data) => {
        return new Ingredient(data.name, data.amount);
      })
    );
  }

  addRecipeFromData(data: {
    name: string;
    description: string;
    imagePath: string;
    ingredients: Array<{ name: string; amount: number }>;
  }) {
    const recipe = this.newRecipeFromData(data);
    this.recipes.push(recipe);
    this.recipeListChanged.next(this.getRecipes());
  }

  updateRecipe(id: number, newRecipe: Recipe) {
    this.recipes[id] = newRecipe;
    this.recipeListChanged.next(this.getRecipes());
  }

  deleteRecipe(id: number) {
    this.recipes.splice(id, 1);
    this.recipeListChanged.next(this.getRecipes());
  }
}
