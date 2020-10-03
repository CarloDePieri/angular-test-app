import { Injectable } from '@angular/core';
import { Ingredient } from '../shared/ingredient.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  private ingredients: Ingredient[] = [];

  ingredientsChanged = new Subject<Ingredient[]>();

  startedEditing = new Subject<number>();

  constructor() {}

  addIngredient(name: string, amount: number) {
    const ingredient = new Ingredient(name, amount);
    this.ingredients.push(ingredient);
    this.ingredientsChanged.next(this.getIngredients());
  }

  getIngredients() {
    return this.ingredients.slice();
  }

  getIngredientByIndex(index: number) {
    return this.ingredients[index];
  }

  deleteIngredient(editedItemIndex: number) {
    this.ingredients.splice(editedItemIndex, 1);
    this.ingredientsChanged.next(this.getIngredients());
  }
}
