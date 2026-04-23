import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[animateOnEnter]',
  standalone: true,
})
export class AnimateOnEnterDirective implements OnChanges {
  @Input() animateOnEnter: unknown = true;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animateOnEnter']) {
      this.play();
    }
  }

  private play(): void {
    const el = this.el.nativeElement;
    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.transform = 'scale(0.95)';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition =
          'opacity 0.45s ease-out, transform 0.45s ease-out';
        el.style.opacity = '1';
        el.style.transform = 'scale(1)';
      });
    });
  }
}
