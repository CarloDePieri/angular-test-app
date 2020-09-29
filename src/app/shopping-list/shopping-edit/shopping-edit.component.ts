import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  ElementRef,
} from '@angular/core';
import { Ingredient } from 'src/app/shared/ingredient.model';
import { ShoppingListService } from '../shopping-list.service';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css'],
})
export class ShoppingEditComponent implements OnInit {
  @ViewChild('nameInput', { static: false }) nameInputRef: ElementRef;
  @ViewChild('amountInput', { static: false }) amountInputRef: ElementRef;
  @Output() addedIngredient = new EventEmitter<Ingredient>();

  constructor(private shoppingListService: ShoppingListService) {}

  ngOnInit(): void {}

  addIngredient() {
    this.shoppingListService.addIngredient(
      this.nameInputRef.nativeElement.value,
      this.amountInputRef.nativeElement.value
    );
  }
}
