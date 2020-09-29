import {
  Directive,
  HostListener,
  HostBinding,
  Renderer2,
  ElementRef,
} from '@angular/core';

@Directive({
  selector: '[appDropdown]',
})
export class DropdownDirective {
  // With hostlistener and renderer
  // constructor(private renderer: Renderer2, private elmRef: ElementRef) {}
  // @HostListener('click') toggleMenu() {
  //   if (this.elmRef.nativeElement.classList.contains('open')) {
  //     this.renderer.removeClass(this.elmRef.nativeElement, 'open');
  //   } else {
  //     this.renderer.addClass(this.elmRef.nativeElement, 'open');
  //   }
  // }

  // with hostlistener and hostbinding
  @HostBinding('class.open') isOpen = false;
  @HostListener('click') toggleMenu() {
    this.isOpen = !this.isOpen;
  }
}
