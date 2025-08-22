import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MobileSidebarComponent } from "../../components/sidebar/mobile-sidebar.component";

@Component({ templateUrl: "./home-layout.component.html", imports: [RouterModule, MobileSidebarComponent] })
export class HomeLayoutComponent {

}