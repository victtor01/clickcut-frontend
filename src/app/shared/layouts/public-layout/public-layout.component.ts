import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  template: `<main class="flex flex-col h-screen bg-white dark:bg-zinc-900 overflow-auto w-full">
    <router-outlet></router-outlet>
  </main>`,
  imports: [RouterOutlet],
})
export class PublicLayoutComponent {}
