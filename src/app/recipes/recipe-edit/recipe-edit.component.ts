import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  FormGroup,
  Validators,
  FormBuilder,
  FormArray,
  FormControl,
} from '@angular/forms';
import { RecipeService } from '../recipe.service';
import { Ingredient } from 'src/app/shared/ingredient.model';
import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from '../store/recipes.actions';
import { Store } from '@ngrx/store';
import { switchMap, map } from 'rxjs/operators';
import { Recipe } from '../recipe.model';
import * as fromRecipes from '../store/recipes.reducer';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css'],
})
export class RecipeEditComponent implements OnInit {
  id: number;
  editMode: boolean = false;
  editForm: FormGroup;
  imageHasLoaded: boolean = false; // this must start as undefined or it won't load correctly on edit

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private RS: RecipeService,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      name: [
        '',
        [Validators.required, this.invalidRecipeNameValidator.bind(this)],
      ],
      imagePath: ['', Validators.required],
      description: ['', Validators.required],
      ingredients: this.fb.array([]),
    });
    function getRecipeFromState(
      state: fromRecipes.State,
      index: number
    ): Recipe {
      return state.recipes.find((_, i) => {
        return index === i;
      });
    }
    this.route.params
      .pipe(
        map((params: Params) => {
          this.id = +params['id'];
          this.editMode = params['id'] != null;
          return params;
        }),
        switchMap(() => {
          // transform the observable into a store one
          return this.store.select('recipes');
        }),
        map((state: fromRecipes.State) => {
          return getRecipeFromState(state, this.id);
        })
      )
      .subscribe((recipe: Recipe) => {
        if (this.editMode) {
          // prepare the form ingredients fields when needed
          if (
            this.editForm.controls.ingredients.value.length <
            recipe.ingredients.length
          ) {
            recipe.ingredients.forEach((_) => {
              this.addIngredientInput();
            });
          }
          const recipeData = {
            name: recipe.name,
            description: recipe.description,
            imagePath: recipe.imagePath,
            ingredients: recipe.ingredients.map((ingredient: Ingredient) => {
              return {
                name: ingredient.name,
                amount: ingredient.amount,
              };
            }),
          };
          this.editForm.setValue(recipeData);
        }
      });
  }

  addIngredientInput() {
    this.ingredientInputs.push(
      this.fb.group({
        name: ['', Validators.required],
        amount: ['', [Validators.min(0), Validators.required]],
      })
    );
  }

  deleteIngredientInput(index: number) {
    this.ingredientInputs.removeAt(index);
  }

  get ingredientInputs() {
    return this.editForm.get('ingredients') as FormArray;
  }

  onSubmit() {
    const recipe = this.RS.newRecipeFromData(this.editForm.value);
    if (this.editMode) {
      this.store.dispatch(
        new RecipesActions.UpdateRecipe({ index: this.id, recipe: recipe })
      );
    } else {
      this.store.dispatch(new RecipesActions.AddRecipe(recipe));
    }
  }

  onCancel() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  invalidRecipeNameValidator(control: FormControl): { [s: string]: boolean } {
    const recipes = this.RS.getRecipes();
    const recipe = recipes[this.id];
    if (this.editMode && recipe.name == control.value) {
      // Allow a recipe to keep its own name
      return null;
    }
    const l = recipes.filter((recipe) => {
      return control.value == recipe.name;
    });
    if (l.length > 0) {
      return { InvalidRecipeName: true };
    }
    return null;
  }

  isInvalidName(): boolean {
    const f = this.editForm;
    return (
      !f.get('name').valid &&
      f.get('name').touched &&
      'InvalidRecipeName' in f.get('name').errors
    );
  }
}
