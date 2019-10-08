import { AfterViewInit, Component, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { Colors } from 'src/app/data-structures/Colors';
import { Tools } from 'src/app/data-structures/Tools';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';

@Component({
  selector: 'app-work-zone',
  templateUrl: './work-zone.component.html',
  styleUrls: ['./work-zone.component.scss'],
})
export class WorkZoneComponent implements OnInit, AfterViewInit {

  private readonly DEFAULT_WIDTH = 1080;
  private readonly DEFAULT_HEIGHT = 720;
  private readonly SHIFT_KEY = 'Shift';

  @Input() width: number;
  @Input() height: number;
  @Input() color: string;

  private canvasElement: HTMLElement;

  constructor(private toolManager: ToolManagerService,
              private renderer: Renderer2) {
    this.width = this.DEFAULT_WIDTH;
    this.height = this.DEFAULT_HEIGHT;
    this.color = Colors.WHITE;
  }

  ngOnInit(): void {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
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
    if (this.toolManager._activeTool === Tools.Selector && this.hasActiveSelector()) {
      this.toolManager.selectorLeftClick();
    } else { this.toolManager.createElement(mouseEvent, this.canvasElement); }
  }

  hasActiveSelector(): boolean {
    let hasSelector = false;
    this.canvasElement.childNodes.forEach((element) => {
      if (element.nodeName === 'g') {
        hasSelector = true;
      }
    });
    return hasSelector;
  }

  onMouseMove(mouseEvent: MouseEvent) {
    this.toolManager.updateElement(mouseEvent, this.canvasElement);
  }

  onMouseUp() {
    this.toolManager.finishElement();
  }

  onLeftClick(mouseEvent: MouseEvent) {
    switch (this.toolManager._activeTool) {
      case Tools.ColorApplicator:
        this.toolManager.changeElementLeftClick(mouseEvent.target as HTMLElement);
        break;
      case Tools.Line:
        this.toolManager.createElementOnClick(mouseEvent, this.canvasElement);
        break;
      default:
        return;
    }
  }

  onRightClick(mouseEvent: Event) {
    this.toolManager.changeElementRightClick(mouseEvent.target as HTMLElement);
    // deactivate context menu on right click
    return false;
  }

  onDoubleClick(mouseEvent: MouseEvent) {
    this.toolManager.finishElementDoubleClick(mouseEvent, this.canvasElement);
  }

  protected setBackGroundColor(): { 'background-color': string } {
    return {
      'background-color': this.color,
    };
  }
}
