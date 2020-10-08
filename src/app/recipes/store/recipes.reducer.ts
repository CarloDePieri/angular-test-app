import * as actions from './recipes.actions';
import { Recipe } from '../recipe.model';
import { StateObservable } from '@ngrx/store';

export interface State {
  recipes: Recipe[];
}
const initialState: State = {
  recipes: null,
};

export function RecipeReducer(
  state: State = initialState,
  action: actions.RecipesActions
): State {
  switch (action.type) {
    case actions.SET_RECIPES:
      return {
        ...state,
        recipes: [...action.payload],
      };
    case actions.ADD_RECIPE:
      return {
        ...state,
        recipes: [...state.recipes, action.payload],
      };
    case actions.UPDATE_RECIPE:
      const updateRecipes = [...state.recipes];
      updateRecipes.splice(action.payload.index, 1, action.payload.recipe);
      return {
        ...state,
        recipes: [...updateRecipes],
      };
    case actions.DELETE_RECIPE:
      return {
        ...state,
        recipes: [
          ...state.recipes.filter((_, i) => {
            return i !== action.payload;
          }),
        ],
      };
    default:
      return state;
  }
}
