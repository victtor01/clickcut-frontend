import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ThemeService } from "@app/core/services/theme.service";

@Component({  
	templateUrl: "./private-layout.component.html",
	imports: [RouterModule]
})
export class PrivateLayoutComponent {
	private themeService = inject(ThemeService);
}
