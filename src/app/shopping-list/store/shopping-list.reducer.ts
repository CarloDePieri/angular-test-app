import { Ingredient } from '../../shared/ingredient.model';
import * as sla from './shopping-list.actions';

export interface State {
  ingredients: Ingredient[];
  editedIngredient: Ingredient;
  editedIngredientIndex: number;
}

const initialState: State = {
  ingredients: [new Ingredient('Apples', 5), new Ingredient('Tomatoes', 2)],
  editedIngredient: null,
  editedIngredientIndex: -1,
};

export function shoppingListReducer(
  state: State = initialState,
  action: sla.ShoppingListActions
): State {
  switch (action.type) {
    case sla.ADD_INGREDIENT:
      return {
        ...state,
        ingredients: [...state.ingredients, action.payload],
      };
    case sla.ADD_INGREDIENTS:
      return {
        ...state,
        ingredients: [...state.ingredients, ...action.payload],
      };
    case sla.UPDATE_INGREDIENT:
      console.log('updating');
      const updatedIngredient = {
        ...state.editedIngredient,
        ...action.payload,
      };
      const updatedIngredients = [...state.ingredients];
      updatedIngredients[state.editedIngredientIndex] = updatedIngredient;
      return {
        ...state,
        ingredients: updatedIngredients,
        editedIngredient: null,
        editedIngredientIndex: -1,
      };
    case sla.DELETE_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.filter((ingredient, index) => {
          return index !== state.editedIngredientIndex;
        }),
        editedIngredient: null,
        editedIngredientIndex: -1,
      };
    case sla.START_EDIT:
      const editIngredient = { ...state.ingredients[action.payload] };
      return {
        ...state,
        editedIngredient: editIngredient,
        editedIngredientIndex: action.payload,
      };
    case sla.STOP_EDIT:
      return {
        ...state,
        editedIngredient: null,
        editedIngredientIndex: -1,
      };
    default:
      return state;
  }
}
