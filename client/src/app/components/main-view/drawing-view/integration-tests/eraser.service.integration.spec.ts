import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Tools } from 'src/app/data-structures/tools';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { DemoMaterialModule } from '../../../../material.module';
import { ModalManagerService } from '../../../../services/modal-manager/modal-manager.service';
import { MousePositionService } from '../../../../services/mouse-position/mouse-position.service';
import { ColorService } from '../../../../services/tools/color/color.service';
import { EraserService } from '../../../../services/tools/eraser/eraser.service';
import { ToolManagerService } from '../../../../services/tools/tool-manager/tool-manager.service';
import { ColorPaletteComponent } from '../../../modals/color-picker-module/color-palette/color-palette.component';
import { ColorPickerDialogComponent } from '../../../modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';
import { ColorSliderComponent } from '../../../modals/color-picker-module/color-slider/color-slider.component';
import { LastTenColorsComponent } from '../../../modals/color-picker-module/last-ten-colors/last-ten-colors.component';
import { ToolsAttributesBarComponent } from '../../tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import { WorkZoneComponent } from '../../work-zone/work-zone.component';
import { DrawingViewComponent } from '../drawing-view.component';
import { DRAWING_SERVICES } from './integration-tests-environment.spec';

/* tslint:disable:max-classes-per-file for mocking classes*/
/* tslint:disable:no-string-literal for testing purposes*/
@Component({ selector: 'app-lateral-bar', template: '' })
class LateralBarStubComponent { }
@Component({ selector: 'app-welcome-modal', template: '' })
class WelcomeModalStubComponent { }

const rendererSpy: jasmine.SpyObj<Renderer2> =
  jasmine.createSpyObj('Renderer2', ['selectRootElement']);

const modalManagerSpy: jasmine.SpyObj<ModalManagerService> =
  jasmine.createSpyObj('ModalManagerService', ['showCreateDrawingDialog']);
const httpClientSpy: jasmine.SpyObj<HttpClient> =
  jasmine.createSpyObj('HttpClient', ['get', 'post']);

describe('EraserService', () => {
  let component: DrawingViewComponent;
  let fixture: ComponentFixture<DrawingViewComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DrawingViewComponent,
        WelcomeModalStubComponent,
        WorkZoneComponent,
        LateralBarStubComponent,
        ColorPaletteComponent,
        ColorSliderComponent,
        ColorPickerDialogComponent,
        LastTenColorsComponent,
        ToolsAttributesBarComponent,
      ],
      imports: [
        DemoMaterialModule,
        CommonModule,
        FormsModule,
        PortalModule,
      ],
      providers: [ToolManagerService, ...DRAWING_SERVICES, ColorService, ChangeDetectorRef,
        { provide: Renderer2, useValue: rendererSpy },
        { provide: ModalManagerService, useValue: modalManagerSpy },
        { provide: HttpClient, useValue: httpClientSpy }, ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ToolsAttributesBarComponent,
          DrawingViewComponent],
      },
    },
    ).compileComponents().then(() => {
      fixture = TestBed.createComponent(DrawingViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be possible to remove only the first drawing from a pile', () => {
    const toolManagerService = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerService._activeTool = Tools.Rectangle;
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const workChilds = svgHandle.children;
    const initialNumberOfChildren = workChilds.length;
    // Setting up the event
    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
    mousePositionService.canvasMousePositionX = 10;
    mousePositionService.canvasMousePositionY = 10;

    // Adding 3 rectangles in the same place
    component.workZoneComponent.onMouseDown();
    component.workZoneComponent.onMouseDown();
    component.workZoneComponent.onMouseDown();
    expect(workChilds.length).toBe(initialNumberOfChildren + 3);

    // erasing
    toolManagerService._activeTool = Tools.Eraser;
    component.workZoneComponent.onMouseDown();
    component.workZoneComponent.onMouseUp();
    // only one drawing missing
    expect(workChilds.length).toBe(initialNumberOfChildren + 2);
  });

  it('should be possible to use eraser as a brush', () => {
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    const workChilds = svgHandle.children;
    const initialNumberOfChildren = workChilds.length;
    const eraserService = fixture.debugElement.injector.get(EraserService);
    // Adding 3 rectangles in 3 different places
    svgHandle.innerHTML +=
      `<rect id="rectTest1"
        x="10" data-start-x="10"
        y="10" data-start-y="10"
        width="10" height="10" stroke="black" stroke-width="1"></rect>`;

    svgHandle.innerHTML +=
      `<rect id="rectTest2"
       x="20" data-start-x="10"
       y="20" data-start-y="10"
       width="10" height="10" stroke="black" stroke-width="1"></rect>`;

    svgHandle.innerHTML +=
      `<rect id="rectTest3"
       x="30" data-start-x="10"
       y="30" data-start-y="10"
       width="10" height="10" stroke="black" stroke-width="1"></rect>`;

    // erasing
    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);

    mousePositionService.canvasMousePositionX = 10;
    mousePositionService.canvasMousePositionY = 10;
    eraserService.startErasing();
    mousePositionService.canvasMousePositionX = 20;
    mousePositionService.canvasMousePositionY = 20;
    eraserService.moveEraser();
    mousePositionService.canvasMousePositionX = 30;
    mousePositionService.canvasMousePositionY = 30;
    eraserService.moveEraser();
    eraserService.stopErasing();

    // all three drawings have been erased
    expect(workChilds.length).toBe(initialNumberOfChildren);
  });

  it('should show a red border when close to being erased', () => {
    const eraserService = fixture.debugElement.injector.get(EraserService);
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;
    // Setting up the event

    // Adding 1 rectangle
    svgHandle.innerHTML +=
      `<rect id="rectTest"
        x="5" data-start-x="5"
        y="5" data-start-y="5"
        width="2" height="2" stroke="black" stroke-width="1"></rect>`;

    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
    mousePositionService.canvasMousePositionX = 15;
    mousePositionService.canvasMousePositionY = 15;
    // erasing
    eraserService.startErasing();
    // drawing is not erased and border should be red
    const child = svgHandle.querySelector('#rectTest') as SVGElement;
    expect(child.getAttribute('filter')).toEqual('url(#dropshadow)');
  });

  it('should be able to undo drawing being erased', () => {
    const svgHandle = component.workZoneComponent['canvasElement'] as SVGElement;

    svgHandle.innerHTML +=
    `<rect id="rectTestUndoRedo"
      x="10" data-start-x="10"
      y="10" data-start-y="10"
      width="10" height="10" stroke="black" stroke-width="1"></rect>`;

    const workChilds = svgHandle.children;
    const initialNumberOfChildren = workChilds.length;
    const eraserService = fixture.debugElement.injector.get(EraserService);
    const mousePositionService = fixture.debugElement.injector.get(MousePositionService);
    mousePositionService.canvasMousePositionX = 10;
    mousePositionService.canvasMousePositionY = 10;
    eraserService.startErasing();
    eraserService.stopErasing();
    expect(workChilds.length).toBe(initialNumberOfChildren - 1);
    const undoRedoService = fixture.debugElement.injector.get(UndoRedoService);
    undoRedoService.undo();
    expect(workChilds.length).toBe(initialNumberOfChildren);
  });
});
