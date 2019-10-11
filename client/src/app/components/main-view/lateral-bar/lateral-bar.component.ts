import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatIconRegistry} from '@angular/material/icon';
import {MatSidenav} from '@angular/material/sidenav';
import {DomSanitizer} from '@angular/platform-browser';
import {CreateDrawingFormValues} from '../../../data-structures/CreateDrawingFormValues';
import {Tools} from '../../../data-structures/Tools';
import {ToolManagerService} from '../../../services/tools/tool-manager/tool-manager.service';
import {CreateDrawingDialogComponent} from '../../modals/create-drawing-dialog/create-drawing-dialog.component';
import { MousePositionService } from './../../../services/mouse-position/mouse-position.service';
import { ModalManagerSingleton } from './../../modals/modal-manager-singleton';

const RECTANGLE_ICON_PATH = '../../../../assets/svg-icons/rectangle-icon.svg';

@Component({
  selector: 'app-lateral-bar',
  templateUrl: './lateral-bar.component.html',
  styleUrls: ['./lateral-bar.component.scss'],
})
export class LateralBarComponent implements OnInit {
  /* Need access to attributesSideNav to toggle when clicking on tool */
  @Input() attributesSideNav: MatSidenav;
  /* EventEmitter to transmit formValues to parent */
  @Output() createDrawing = new EventEmitter<CreateDrawingFormValues>();

  protected appropriateClass: string;
  private canvas: HTMLElement;

  private readonly HEIGHT_THRESHOLD = 412;
  private readonly PENCIL_KEY = 'c';
  private readonly PAINTBRUSH_KEY = 'w';
  private readonly RECTANGLE_KEY = '1';
  private readonly ELLIPSE_KEY = '2';
  private readonly COLOR_APPLICATOR_KEY = 'r';
  private readonly NEW_DRAWING_KEY = 'o';
  private readonly LINE_KEY = 'l';
  private readonly DELETE_FULL_ELEMENT_KEY = 'Escape';
  private readonly DELETE_LAST_ELEMENT_KEY = 'Backspace';

  constructor(private dialog: MatDialog,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              private toolManager: ToolManagerService,
              private mousePosition: MousePositionService,
              private renderer: Renderer2) {
    this.loadSVGIcons();
    this.setAppropriateIconsClass();
  }
  ngOnInit(): void {
    this.canvas = this.renderer.selectRootElement('#canvas', true);
  }
  @HostListener('document:keydown', ['$event'])
  keyDownEvent(keyboardEvent: KeyboardEvent) {
    // Verify that no dialog is open before checking for hotkeys
    const modalManager = ModalManagerSingleton.getInstance();
    if (!modalManager._isModalActive) {
      if (keyboardEvent.key === this.PENCIL_KEY) {
        this.toolManager._activeTool = Tools.Pencil;
      } else if (keyboardEvent.key === this.COLOR_APPLICATOR_KEY) {
        this.toolManager._activeTool = Tools.ColorApplicator;
      } else if (keyboardEvent.key === this.PAINTBRUSH_KEY) {
        this.toolManager._activeTool = Tools.Brush;
      } else if (keyboardEvent.key === this.RECTANGLE_KEY) {
        this.toolManager._activeTool = Tools.Rectangle;
      } else if (keyboardEvent.key === this.ELLIPSE_KEY) {
        this.toolManager._activeTool = Tools.Ellipse;
      } else if (keyboardEvent.key === this.LINE_KEY) {
        this.toolManager._activeTool = Tools.Line;
      } else if (keyboardEvent.key === this.NEW_DRAWING_KEY && keyboardEvent.ctrlKey) {
        keyboardEvent.preventDefault();
        this.openCreateDrawingDialog();
      } else if (keyboardEvent.key === this.DELETE_FULL_ELEMENT_KEY) {
        this.toolManager.escapePress();
      } else if (keyboardEvent.key === this.DELETE_LAST_ELEMENT_KEY) {
        this.toolManager.backSpacePress();
      }
    }
  }
  @HostListener('document:mousemove', ['$event'])
  mouseMoveEvent(mouseEvent: MouseEvent) {
    // Listen to the mouse's position in the page and communicate it to the service so it is available to all components.
    const OFFSET_CANVAS_Y = this.canvas.getBoundingClientRect().top;
    const OFFSET_CANVAS_X = this.canvas.getBoundingClientRect().left;
    this.mousePosition._pageMousePositionX = mouseEvent.pageX;
    this.mousePosition._pageMousePositionY = mouseEvent.pageY;
    this.mousePosition._canvasMousePositionX = (mouseEvent.pageX - OFFSET_CANVAS_X);
    this.mousePosition._canvasMousePositionY = (mouseEvent.pageY - OFFSET_CANVAS_Y);
  }

  protected get Tools() {
    return Tools;
  }

  protected toggleAttributesAndSetTool(tool: Tools) {
    this.toolManager._activeTool = tool;
    void this.attributesSideNav.toggle();
  }

  protected openCreateDrawingDialog() {
    const dialogRef = this.dialog.open(CreateDrawingDialogComponent, {
      autoFocus: false,
      data: { drawingNonEmpty: this.toolManager.drawingNonEmpty() },
    });
    dialogRef.afterClosed().subscribe((formValues: CreateDrawingFormValues) => {
      if (formValues) {
        this.sendCreateDrawingFormValues(formValues);
      }
    });
  }

  /**
   * @desc when the window gets to small,
   * this listener prevents the bottom buttons to mix with the top buttons
   * of the tools side nav.
   */
  @HostListener('window:resize', ['$event'])
  protected setAppropriateIconsClass() {
    if (window.innerHeight <= this.HEIGHT_THRESHOLD) {
      this.appropriateClass = 'bottomRelative';
    } else {
      this.appropriateClass = 'bottomStick';
    }
  }

  private sendCreateDrawingFormValues(formValues: CreateDrawingFormValues) {
    this.createDrawing.emit(formValues);
  }

  private loadSVGIcons(): void {
    this.matIconRegistry.addSvgIcon('rectangle',
      this.domSanitizer.bypassSecurityTrustResourceUrl(RECTANGLE_ICON_PATH), );
  }

}
