import { Component } from '@angular/core';

@Component({
  templateUrl: './default-footer.component.html',
  selector: 'app-default-footer',
  styles: `
    :host {
      flex: 1;
      display: flex;
    }
  `,
})
export class DefaultFooterComponent {}
