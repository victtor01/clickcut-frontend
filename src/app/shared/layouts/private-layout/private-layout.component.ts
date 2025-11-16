import { ChangeDetectorRef, Component, inject } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef); 
  public animationState: string | undefined;

  public onActivate(outlet: RouterOutlet) {
    const animation = outlet?.activatedRouteData?.['animation'];

    Promise.resolve().then(() => {
      this.animationState = animation;
      this.cdr.detectChanges(); 
    });
  }
}
