import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Tools } from '../../../../data-structures/tools';
import { ToolManagerService } from '../../../../services/tools/tool-manager/tool-manager.service';

export interface ToolProperties {
  tool: Tools;
  matToolTip: string;
  icon: string;
  isMainBarItem: boolean;
}

@Component({
  selector: 'app-abstract-tool-button',
  templateUrl: './abstract-tool-button.component.html',
  styleUrls: ['./abstract-tool-button.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AbstractToolButtonComponent {

  @Input() attributesSideNav: MatSidenav;
  @Input() toolProperties: ToolProperties;

  constructor(private toolManager: ToolManagerService) { }

  @Input() set attributesSidenav(attrSidenav: MatSidenav) {
    this.attributesSideNav = attrSidenav;
  }

  protected toggleAttributesAndSetTool() {
    const tool: Tools = this.toolProperties.tool;
    if (this.toolManager._activeTool === tool && tool !== Tools.Eyedropper) {
      void this.attributesSideNav.toggle();
    } else {
      if (tool === Tools.Eyedropper) {
        void this.attributesSideNav.close();
        this.toolManager._activeTool = tool;
        return;
      }
      this.toolManager._activeTool = tool;
      void this.attributesSideNav.open();
    }
  }
}
