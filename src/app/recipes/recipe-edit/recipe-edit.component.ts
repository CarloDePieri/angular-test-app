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
    private RS: RecipeService
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
    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.editMode = params['id'] != null;
      if (this.editMode) {
        const recipe = this.RS.getRecipe(this.id);
        const recipeData = {
          name: recipe.name,
          description: recipe.description,
          imagePath: recipe.imagePath,
          ingredients: recipe.ingredients.map((ingredient: Ingredient) => {
            this.addIngredientInput();
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
    if (this.editMode) {
      const recipe = this.RS.newRecipeFromData(this.editForm.value);
      this.RS.updateRecipe(this.id, recipe);
      this.router.navigate(['..'], { relativeTo: this.route });
    } else {
      this.RS.addRecipeFromData(this.editForm.value);
      const lastId = this.RS.getRecipes().length - 1;
      this.router.navigate(['..', lastId], { relativeTo: this.route });
    }
  }

  onCancel() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  invalidRecipeNameValidator(control: FormControl): { [s: string]: boolean } {
    if (this.editMode && this.RS.getRecipe(this.id).name == control.value) {
      // Allow a recipe to keep its own name
      return null;
    }
    const l = this.RS.getRecipes().filter((recipe) => {
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
