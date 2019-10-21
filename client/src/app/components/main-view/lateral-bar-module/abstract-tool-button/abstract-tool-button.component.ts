import {Component, Input} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';
import {Tools} from '../../../../data-structures/Tools';
import {ToolManagerService} from '../../../../services/tools/tool-manager/tool-manager.service';

export interface ToolProperties {
  tool: Tools;
  matToolTip: string;
  icon: string;
  isSvgIcon: boolean;
}

@Component({
  selector: 'app-abstract-tool-button',
  templateUrl: './abstract-tool-button.component.html',
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
    if (this.toolManager._activeTool === tool) {
      void this.attributesSideNav.toggle();
    } else {
      this.toolManager._activeTool = tool;
      void this.attributesSideNav.open();
    }
  }

}
