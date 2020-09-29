import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: '[appCursorPointer]',
})
export class CursorPointerDirective {
  constructor() {}

  @HostBinding('style.cursor') cursor = 'pointer';
}
