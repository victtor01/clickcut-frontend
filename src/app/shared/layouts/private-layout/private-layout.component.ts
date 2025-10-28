import { Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ThemeService } from '@app/core/services/theme.service';
import { scaleFade } from '@app/shared/utils/router-transition';

@Component({
  templateUrl: './private-layout.component.html',
  imports: [RouterModule, RouterOutlet],
  animations: [scaleFade],
})
export class PrivateLayoutComponent {
  private _ = inject(ThemeService);

  public getRouteAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
