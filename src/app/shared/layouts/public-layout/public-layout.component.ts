import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  template: `<main class="flex flex-col h-screen overflow-auto w-full">
    <router-outlet></router-outlet>
  </main>`,
  imports: [RouterOutlet],
})
export class PublicLayoutComponent {}
