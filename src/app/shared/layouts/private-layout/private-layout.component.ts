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
  private cdr = inject(ChangeDetectorRef); // 1. Injete o ChangeDetectorRef
  // 2. Crie uma propriedade para guardar o estado da animação
  public animationState: string | undefined;

  // 3. Crie o método que será chamado pelo (activate)
  public onActivate(outlet: RouterOutlet) {
    // Pega o dado da animação da rota
    const animation = outlet?.activatedRouteData?.['animation'];

    // 4. Adia a atualização para a próxima microtarefa (depois do ciclo atual)
    Promise.resolve().then(() => {
      this.animationState = animation;
      
      // 5. Força o Angular a rodar a detecção de mudanças para atualizar o binding
      this.cdr.detectChanges(); 
    });
  }
}
