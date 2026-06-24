import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkTheme = signal<boolean>(false);

  constructor() {
    this.loadTheme();
  }

  private loadTheme(): void {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('pokedex-theme');
      // por defecto modo claro
      const isDark = savedTheme === 'dark';
      this.isDarkTheme.set(isDark);
      this.applyTheme(isDark);
    }
  }

  toggleTheme(): void {
    this.isDarkTheme.update(current => {
      const next = !current;
      if (typeof window !== 'undefined') {
        localStorage.setItem('pokedex-theme', next ? 'dark' : 'light');
      }
      this.applyTheme(next);
      return next;
    });
  }

  private applyTheme(isDark: boolean): void {
    if (typeof document !== 'undefined') {
      const body = document.body;
      if (isDark) {
        body.classList.add('dark-theme');
      } else {
        body.classList.remove('dark-theme');
      }
    }
  }
}
