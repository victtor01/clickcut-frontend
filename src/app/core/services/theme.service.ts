// src/app/services/theme.service.ts

import { isPlatformBrowser } from '@angular/common';
import { effect, Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

// Definimos um tipo para garantir que só aceitamos 'light' ou 'dark'
export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_COOKIE_KEY = 'app-theme'; // Chave do cookie

  // Signal privado para gerenciar o estado internamente
  private _theme = signal<Theme>('light');

  /**
   * Signal público e somente leitura para que os componentes possam
   * reagir às mudanças de tema, mas não possam alterá-lo diretamente.
   */
  public readonly theme = this._theme.asReadonly();

  constructor(
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.initializeTheme();

    // Efeito para atualizar a classe no body e o cookie sempre que o tema mudar
    effect(() => {
      const currentTheme = this._theme();
      if (isPlatformBrowser(this.platformId)) {
        // Atualiza o cookie
        this.cookieService.set(this.THEME_COOKIE_KEY, currentTheme, { expires: 365, path: '/' });

        // Atualiza a classe no elemento <html> para que o dark: do Tailwind funcione
        const root = document.documentElement;
        if (currentTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    });
  }

  /**
   * Inicializa o tema na seguinte ordem de prioridade:
   * 1. Cookie existente.
   * 2. Preferência do sistema operacional do usuário.
   * 3. Padrão: 'light'.
   */
  private initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Não faz nada se não estiver no navegador (SSR)
    }

    const cookieTheme = this.cookieService.get(this.THEME_COOKIE_KEY);

    if (cookieTheme === 'dark' || cookieTheme === 'light') {
      this._theme.set(cookieTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this._theme.set('dark');
    } else {
      this._theme.set('light');
    }
  }

  /**
   * Alterna o tema entre 'light' e 'dark'.
   */
  public toggleTheme(): void {
    this._theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  /**
   * Define um tema específico.
   * @param theme O tema para definir ('light' ou 'dark').
   */
  public setTheme(theme: Theme): void {
    this._theme.set(theme);
  }
}
