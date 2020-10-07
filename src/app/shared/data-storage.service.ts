import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RecipeService, RecipeData } from '../recipes/recipe.service';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataStorageService {
  endpoint = 'https://test-angular-cbc17.firebaseio.com/recipes.json';

  constructor(private http: HttpClient, private RS: RecipeService) {}

  storeRecipes() {
    const recipes = this.RS.getRecipes();
    this.http.put(this.endpoint, recipes).subscribe();
  }

  fetchRecipes() {
    return this.http.get<[RecipeData]>(this.endpoint).pipe(
      map((recipesData) => {
        recipesData.forEach((recipeData) => {
          if (!('ingredients' in recipeData)) {
            recipeData['ingredients'] = [];
          }
        });
        return recipesData;
      }),
      tap((data) => {
        this.RS.loadRecipes(data);
      })
    );
  }
}
