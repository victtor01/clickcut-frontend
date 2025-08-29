import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarConfigureComponent } from "../components/sidebar-configure.component";

@Component({ templateUrl: "./configure.component.html", imports: [SidebarConfigureComponent, RouterOutlet] })
export class ConfigureComponent {

}