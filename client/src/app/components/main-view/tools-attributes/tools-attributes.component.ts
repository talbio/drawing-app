import {Component} from '@angular/core';
import {PlotType} from '../../../data-structures/PlotType';
import {Tools} from '../../../data-structures/Tools';
import {BrushGeneratorService} from '../../../services/tools/brush-generator/brush-generator.service';
import {PencilGeneratorService} from '../../../services/tools/pencil-generator/pencil-generator.service';
import {RectangleGeneratorService} from '../../../services/tools/rectangle-generator/rectangle-generator.service';
import {ToolSelectorService} from '../../../services/tools/tool-selector/tool-selector.service';

@Component({
  selector: 'app-tools-attributes',
  templateUrl: './tools-attributes.component.html',
  styleUrls: ['./tools-attributes.component.scss'],
})
export class ToolsAttributesComponent  {

  constructor(protected toolSelector: ToolSelectorService,
              protected pencilGenerator: PencilGeneratorService,
              protected rectangleGenerator: RectangleGeneratorService,
              protected brushGenerator: BrushGeneratorService) {
  }

  protected get PlotType() {
    return PlotType;
  }

  protected get Tools() {
    return Tools;
  }

}