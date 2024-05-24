import {Component, Input, OnInit} from '@angular/core';
import {StateManager} from "../../models/state";
import {MenubarModule} from "primeng/menubar";
import {MenuModule} from "primeng/menu";
import {ButtonModule} from "primeng/button";
import {MenuItem} from "primeng/api";
import {DockManager, DockMode} from "./dock-manager";
import {AuthService} from "../../services/auth/auth.service";

export interface ReleaseIdentifier {
  projectName: string;
  releaseId: number;
  savedAt?: Date;
}

@Component({
  selector: 'app-dock',
  templateUrl: './dock.component.html',
  styleUrl: './dock.component.scss',
  imports: [
    MenubarModule,
    MenuModule,
    ButtonModule
  ],
  standalone: true
})
export class DockComponent implements OnInit {
  @Input() items: MenuItem[] = [];
  @Input() mode: DockMode = 'editor';

  constructor(private dockManager: DockManager, private stateManager: StateManager, private authService: AuthService) {
  }


  get locationTitle(): string | ReleaseIdentifier {
    switch (this.mode) {
      case "editor":
        return this.stateManager.currentProject? this.stateManager.currentProject.name : "Editor";
      case "projects":
        return "Projects menu"
      case "editor-release":
        return {
          projectName: this.stateManager.currentProject?.name!,
          releaseId: this.stateManager.currentRelease?.id!,
        }
      default:
        return "Editor"
    }
  }




  ngOnInit() {
    const menuItems = this.dockManager.buildMenuItems(this.mode);
    this.items.push(...menuItems);
    this.authService.currentUser.subscribe(user => {
      console.log("user in dock", user)
      const userMenuItems: MenuItem[] = [
        {
          label: user?.name,
          styleClass: 'user-menu',
          icon: 'pi pi-user',
          items: [{
            label: 'Logout',
            command: () => {
              this.authService.logout();
            },
            icon: 'pi pi-sign-out',
          }],
        }
      ];

      this.items.push(...userMenuItems);
    });
  }

}
