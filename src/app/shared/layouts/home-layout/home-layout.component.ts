import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SidebarComponent } from "@app/shared/components/sidebar/sidebar.component";
import { MobileSidebarComponent } from "../../components/navbar/mobile-sidebar.component";

@Component({ templateUrl: "./home-layout.component.html", imports: [RouterModule, MobileSidebarComponent, SidebarComponent] })
export class HomeLayoutComponent {

}