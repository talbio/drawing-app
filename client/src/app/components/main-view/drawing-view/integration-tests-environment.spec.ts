import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {ComponentFixture} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {AbstractClosedShape} from '../../../data-structures/abstract-closed-shape';
import {AbstractGenerator} from '../../../data-structures/abstract-generator';
import {AbstractWritingTool} from '../../../data-structures/abstract-writing-tool';
import {Tools} from '../../../data-structures/tools';
import {DemoMaterialModule} from '../../../material.module';
import {ModalManagerService} from '../../../services/modal-manager/modal-manager.service';
import {MousePositionService} from '../../../services/mouse-position/mouse-position.service';
import {BrushGeneratorService} from '../../../services/tools/brush-generator/brush-generator.service';
import {ClipboardService} from '../../../services/tools/clipboard/clipboard.service';
import {ColorApplicatorService} from '../../../services/tools/color-applicator/color-applicator.service';
import {ColorService} from '../../../services/tools/color/color.service';
import {EllipseGeneratorService} from '../../../services/tools/ellipse-generator/ellipse-generator.service';
import {EmojiGeneratorService} from '../../../services/tools/emoji-generator/emoji-generator.service';
import {EraserService} from '../../../services/tools/eraser/eraser.service';
import {EyedropperService} from '../../../services/tools/eyedropper/eyedropper.service';
import {GridTogglerService} from '../../../services/tools/grid/grid-toggler.service';
import {LineGeneratorService} from '../../../services/tools/line-generator/line-generator.service';
import {ObjectSelectorService} from '../../../services/tools/object-selector/object-selector.service';
import {PenGeneratorService} from '../../../services/tools/pen-generator/pen-generator.service';
import {PencilGeneratorService} from '../../../services/tools/pencil-generator/pencil-generator.service';
import {PolygonGeneratorService} from '../../../services/tools/polygon-generator/polygon-generator.service';
import {RectangleGeneratorService} from '../../../services/tools/rectangle-generator/rectangle-generator.service';
import {ToolManagerService} from '../../../services/tools/tool-manager/tool-manager.service';
import {UndoRedoService} from '../../../services/undo-redo/undo-redo.service';
import {ColorPaletteComponent} from '../../modals/color-picker-module/color-palette/color-palette.component';
import {ColorPickerDialogComponent} from '../../modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';
import {ColorSliderComponent} from '../../modals/color-picker-module/color-slider/color-slider.component';
import {LastTenColorsComponent} from '../../modals/color-picker-module/last-ten-colors/last-ten-colors.component';
import {ToolsAttributesBarComponent} from '../tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import {WorkZoneComponent} from '../work-zone/work-zone.component';
import {DrawingViewComponent} from './drawing-view.component';

export const modalManagerSpy: jasmine.SpyObj<ModalManagerService> =
  jasmine.createSpyObj('ModalManagerService', ['showCreateDrawingDialog']);

export class CanvasDrawer {
  private fixture: ComponentFixture<DrawingViewComponent>;
  private component: DrawingViewComponent;

  constructor(fixture: ComponentFixture<DrawingViewComponent>, component: DrawingViewComponent) {
    this.fixture = fixture;
    this.component = component;
  }

  drawLine() {
    const toolManagerService = this.fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Line;
    const xInitial = 100;
    const yInitial = 100;
    const mouseEvent = new MouseEvent('click', {
      button: 0,
      clientX: xInitial,
      clientY: yInitial,
    });
    const mousePositionService = this.fixture.debugElement.injector.get(MousePositionService);
    mousePositionService.canvasMousePositionX = xInitial;
    mousePositionService.canvasMousePositionY = yInitial;
    this.component.workZoneComponent.onLeftClick(mouseEvent);
    const finalMouseEvent = new MouseEvent('click', {
      button: 0,
      clientX: 200,
      clientY: 200,
    });
    this.component.workZoneComponent.onDoubleClick(finalMouseEvent);
  }

  drawShapeOnCanvas(x1: number, y1: number, x2: number, y2: number, toolType: Tools)  {
    const toolManagerService = this.fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = toolType;
    let mouseEvent = new MouseEvent('mousedown', {
      button: 0,
      clientX: x1,
      clientY: y1,
    });
    const mousePositionService = this.fixture.debugElement.injector.get(MousePositionService);
    mousePositionService.canvasMousePositionX = x1;
    mousePositionService.canvasMousePositionY = y1;
    this.component.workZoneComponent.onMouseDown(mouseEvent);
    mouseEvent = new MouseEvent('mousemove', {
      clientX: x2,
      clientY: y2,
    });
    // update mouse position on the service
    mousePositionService.canvasMousePositionX = x2;
    mousePositionService.canvasMousePositionY = y2;
    this.component.workZoneComponent.onMouseMove(mouseEvent);
    this.component.workZoneComponent.onMouseUp(mouseEvent);
  }

  // This returns the child at 'position' from the canvas's last position (1 for last)
  getLastSvgElement(svgHandle: SVGElement, position: number)  {
    return svgHandle.children.item(svgHandle.children.length - position) as SVGElement;
  }
}
export const DRAWING_SERVICES = [
  AbstractGenerator,
  AbstractWritingTool,
  AbstractClosedShape,
  RectangleGeneratorService,
  EllipseGeneratorService,
  EmojiGeneratorService,
  PencilGeneratorService,
  BrushGeneratorService,
  ColorApplicatorService,
  LineGeneratorService,
  EyedropperService,
  ColorService,
  ClipboardService,
  UndoRedoService,
  MousePositionService,
  ObjectSelectorService,
  GridTogglerService,
  PolygonGeneratorService,
  EraserService,
  PenGeneratorService,
];

export const COMPONENTS = [
  DrawingViewComponent,
  WorkZoneComponent,
  ColorPaletteComponent,
  ColorSliderComponent,
  ColorPickerDialogComponent,
  LastTenColorsComponent,
  ToolsAttributesBarComponent,
];

export const IMPORTS = [
  DemoMaterialModule,
  CommonModule,
  FormsModule,
  PortalModule,
];