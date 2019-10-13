import {  AfterViewInit, Component, HostListener, Input, OnInit, Renderer2} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Drawing } from '../../../../../../common/communication/Drawing';
import {SaveDrawingService} from '../../../services/back-end/save-drawing/save-drawing.service';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';

@Component({
  selector: 'app-work-zone',
  templateUrl: './work-zone.component.html',
  styleUrls: ['./work-zone.component.scss'],
})
export class WorkZoneComponent implements OnInit, AfterViewInit {

  private readonly DEFAULT_WIDTH = 1080;
  private readonly DEFAULT_HEIGHT = 720;
  private readonly SHIFT_KEY = 'SHIFT';
  private readonly DEFAULT_WHITE_COLOR = '#FFFFFF';

  @Input() width: number;
  @Input() height: number;
  @Input() color: string;

  private canvasElement: any;
  drawing = new BehaviorSubject<string>('');

  constructor(private toolManager: ToolManagerService,
              private renderer: Renderer2,
              private saveDrawing: SaveDrawingService) {

    this.width = this.DEFAULT_WIDTH;
    this.height = this.DEFAULT_HEIGHT;
    this.color = this.DEFAULT_WHITE_COLOR;

    this.saveDrawing.httpGetDrawing()
    .pipe(
      map((drawing: Drawing) => `${drawing.name} ${drawing.svgElements} ${drawing.tags} ${drawing.miniature}`),
    )
    .subscribe(this.drawing);
  }

  ngOnInit(): void {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
    this.saveDrawing._renderer = this.renderer;
  }

  ngAfterViewInit(): void {
    this.toolManager.loadRenderer(this.renderer);
  }

  @HostListener('document:keydown', ['$event'])
  keyDownEvent(keyboardEvent: KeyboardEvent) {
    if (keyboardEvent.key === this.SHIFT_KEY) {
      this.toolManager.changeElementShiftDown();
    }
  }
  @HostListener('document:keyup', ['$event'])
  keyUpEvent(keyboardEvent: KeyboardEvent) {
    if (keyboardEvent.key === this.SHIFT_KEY) {
      this.toolManager.changeElementShiftUp();
    }
  }

  onMouseDown(mouseEvent: MouseEvent) {
    this.toolManager.createElement(mouseEvent, this.canvasElement);
  }

  onMouseMove(mouseEvent: MouseEvent) {
    this.toolManager.updateElement(mouseEvent, this.canvasElement);
  }

  onMouseUp() {
    this.toolManager.finishElement();
  }

  onLeftClick(mouseEvent: Event) {
    this.toolManager.changeElementLeftClick(mouseEvent.target as HTMLElement);
  }

  onRightClick(mouseEvent: Event) {
    this.toolManager.changeElementRightClick(mouseEvent.target as HTMLElement);
    // deactivate context menu on right click
    return false;
  }

  protected setBackGroundColor(): {'background-color': string} {
    return {
      'background-color': this.color,
    };
  }
}
