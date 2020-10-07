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
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as SLActions from '../store/shopping-list.actions';
import * as fromApp from '../../store/app.reducer';
import * as fromShoppingList from '../store/shopping-list.reducer';

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

  constructor(private store: Store<fromApp.AppState>) {}

  isEditMode(): boolean {
    return this.editMode;
  }

  ngOnInit(): void {
    this.subscription = this.store
      .select('shoppingList')
      .subscribe((stateData: fromShoppingList.State) => {
        if (stateData.editedIngredient) {
          this.editMode = true;
          const editedItem = stateData.editedIngredient;
          this.clearButtonRef.nativeElement.disabled = false;
          this.slForm.setValue({
            name: editedItem.name,
            amount: editedItem.amount,
          });
        } else {
          this.editMode = false;
        }
      });
  }

  addIngredient(form: NgForm) {
    const values = form.value;
    const ingredient = new Ingredient(values.name, values.amount);
    if (!this.editMode) {
      this.store.dispatch(new SLActions.AddIngredient(ingredient));
    } else {
      this.store.dispatch(new SLActions.UpdateIngredient(ingredient));
    }
    this.clearForm();
  }

  deleteIngredient() {
    this.store.dispatch(new SLActions.DeleteIngredient());
    this.clearForm();
  }

  clearForm() {
    this.slForm.reset();
    this.store.dispatch(new SLActions.StopEdit());
    this.clearButtonRef.nativeElement.disabled = true;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.store.dispatch(new SLActions.StopEdit());
  }
}
