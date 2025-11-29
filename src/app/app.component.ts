import { Component, inject, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { scaleFade } from './shared/utils/router-transition';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [scaleFade],
})
export class App implements OnInit {
  title = 'ClickYoup';
  
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  
  ngOnInit(): void {
    this.registerCustomIcons();
  }
  
  private registerCustomIcons(): void {
    const iconPath = 'assets/icons/';
    this.iconRegistry.addSvgIcon(
      'crown',
      this.sanitizer.bypassSecurityTrustResourceUrl(iconPath + 'crown.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'fire',
      this.sanitizer.bypassSecurityTrustResourceUrl(iconPath + 'fire.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'star',
      this.sanitizer.bypassSecurityTrustResourceUrl(iconPath + 'star.svg'),
    );
  }
}
