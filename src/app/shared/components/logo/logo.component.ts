import { Component, Input } from '@angular/core';

@Component({ templateUrl: './logo.component.html', selector: 'app-logo' })
export class LogoComponent {
  @Input() width: string = '50'; // valor padrão
  @Input() height: string = '50'; // valor padrão
  @Input() color: string = 'red'; // valor padrão
}
