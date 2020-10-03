import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Ingredient } from 'src/app/shared/ingredient.model';
import { ShoppingListService } from '../shopping-list.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css'],
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @Output() addedIngredient = new EventEmitter<Ingredient>();
  @ViewChild('f') slForm: NgForm;
  @ViewChild('clear') clearButtonRef: ElementRef;
  private subscription: Subscription;
  private editMode = false;
  private editedItemIndex: number;
  private editedItem: Ingredient;

  constructor(private shoppingListService: ShoppingListService) {}

  isEditMode(): boolean {
    return this.editMode;
  }

  ngOnInit(): void {
    this.subscription = this.shoppingListService.startedEditing.subscribe(
      (id: number) => {
        this.editMode = true;
        this.editedItemIndex = id;
        this.editedItem = this.shoppingListService.getIngredientByIndex(id);
        this.clearButtonRef.nativeElement.disabled = false;
        this.slForm.setValue({
          name: this.editedItem.name,
          amount: this.editedItem.amount,
        });
      }
    );
  }

  addIngredient(form: NgForm) {
    const values = form.value;
    if (!this.editMode) {
      this.shoppingListService.addIngredient(values.name, values.amount);
    } else {
      this.editedItem.name = values.name;
      this.editedItem.amount = values.amount;
    }
    this.clearForm();
  }

  deleteIngredient() {
    this.shoppingListService.deleteIngredient(this.editedItemIndex);
    this.clearForm();
  }

  clearForm() {
    // this.slForm.setValue({ name: '', amount: '' });
    this.slForm.reset();
    this.editMode = false;
    this.editedItem = undefined;
    this.editedItemIndex = undefined;
    this.clearButtonRef.nativeElement.disabled = true;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
