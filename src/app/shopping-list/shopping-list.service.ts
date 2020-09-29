import { Injectable, EventEmitter } from '@angular/core';
import { Ingredient } from '../shared/ingredient.model';

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  private ingredients: Ingredient[] = [];

  ingredientAdded = new EventEmitter<Ingredient[]>();

  constructor() {}

  addIngredient(name: string, amount: number) {
    const ingredient = new Ingredient(name, amount);
    this.ingredients.push(ingredient);
    this.ingredientAdded.emit(this.getIngredients());
  }

  getIngredients() {
    return this.ingredients.slice();
  }
}
