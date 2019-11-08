import { Injectable } from '@angular/core';
import {AbstractWritingTool} from '../../../data-structures/abstract-writing-tool';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';
import { MousePositionService } from './../../mouse-position/mouse-position.service';

@Injectable()
export class PencilGeneratorService extends AbstractWritingTool {

  /**
   * attributes of pencil tool :
   */
  private currentPencilPathNumber: number;
  private mouseDown = false;

  constructor(private mousePosition: MousePositionService,
              undoRedoService: UndoRedoService) {
    super(undoRedoService);
    this.currentPencilPathNumber = 0;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _strokeWidth(): number {
    return this.strokeWidth;
  }

  set _currentPencilPathNumber(count: number) { this.currentPencilPathNumber = count; }

  // Initializes the path
  createPenPath(canvas: SVGElement, primaryColor: string) {
    const path = RendererSingleton.renderer.createElement('path', 'svg');
    const properties: [string, string][] = [];
    properties.push(
      ['id', `pencilPath${this.currentPencilPathNumber}`],
      ['d', `M ${this.mousePosition.canvasMousePositionX} ${(this.mousePosition.canvasMousePositionY)}
        L ${(this.mousePosition.canvasMousePositionX)} ${(this.mousePosition.canvasMousePositionY)}`],
      ['stroke', `${primaryColor}`],
      ['stroke-width', `${this.strokeWidth}`],
      ['stroke-linecap', `round`],
      ['fill', `none`],
    );
    this.drawElement(path, properties);
    this.mouseDown = true;
  }

  /**
   * @desc // Updates the path when the mouse is moving (mousedown)
   */
  updatePenPath(mouseEvent: MouseEvent, currentChildPosition: number) {
    this.updatePath(mouseEvent, currentChildPosition);
  }

  /**
   * @desc Finalizes the path, sets up the next one
   */
  finishPenPath() {
    if (this.mouseDown) {
      this.currentPencilPathNumber += 1;
      this.pushAction(this.currentElement);
      this.mouseDown = false;
    }
  }

  clone(item: SVGElement): SVGElement {
    const newItem = item.cloneNode() as SVGElement;
    newItem.setAttribute('id', 'pencilPath' + this.currentPencilPathNumber++);
    return newItem;
  }
}
