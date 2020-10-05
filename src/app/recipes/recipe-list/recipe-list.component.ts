import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { Subscription } from 'rxjs';
import { DataStorageService } from 'src/app/shared/data-storage.service';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
})
export class RecipeListComponent implements OnInit, OnDestroy {
  recipes: Recipe[];
  recipesChanged: Subscription;

  constructor(
    private recipeService: RecipeService,
    private DSS: DataStorageService
  ) {}

  ngOnInit(): void {
    // this.recipes = this.recipeService.getRecipes();
    this.DSS.fetchRecipes().subscribe();
    this.recipesChanged = this.recipeService.recipeListChanged.subscribe(
      (recipes: Recipe[]) => {
        this.recipes = recipes;
      }
    );
  }

  ngOnDestroy(): void {
    this.recipesChanged.unsubscribe();
  }
}
