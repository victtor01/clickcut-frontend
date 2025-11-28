import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  template: `<main class="flex flex-col h-screen bg-white dark:bg-gray-950 bg-gradient-to-r from-transparent to-transparent dark:from-gray-900/50 dark:to-gray-900/50 overflow-auto w-full">
    <router-outlet></router-outlet>
  </main>`,
  imports: [RouterOutlet],
})
export class PublicLayoutComponent {}
