import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal<boolean>(false);

  constructor() {
    const saved = localStorage.getItem('tr-theme');
    if (saved === 'dark') this.setDark(true);
  }

  toggle(): void {
    this.setDark(!this.isDark());
  }

  private setDark(dark: boolean): void {
    this.isDark.set(dark);
    const html = document.documentElement;
    dark ? html.classList.add('dark') : html.classList.remove('dark');
    localStorage.setItem('tr-theme', dark ? 'dark' : 'light');
  }
}
