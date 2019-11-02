import { Injectable } from '@angular/core';
import {AbstractWritingTool} from '../../../data-structures/abstract-writing-tool';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';

@Injectable()
export class BrushGeneratorService extends AbstractWritingTool {

  private readonly DEFAULT_BRUSH_PATTERN = 'url(#brushPattern1)';

  private currentBrushPathNumber: number;

  private currentBrushPattern: string;

  constructor(undoRedoService: UndoRedoService) {
    super(undoRedoService);
    this.currentBrushPattern = this.DEFAULT_BRUSH_PATTERN;
    this.currentBrushPathNumber = 0;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _strokeWidth(): number {
    return this.strokeWidth;
  }

  set _currentBrushPattern(pattern: string) {
    this.currentBrushPattern = pattern;
  }

  get _currentBrushPattern(): string {
    return this.currentBrushPattern;
  }

  set _currentBrushPathNumber(count: number) {
    this.currentBrushPathNumber = count;
  }

  createBrushPath(mouseEvent: MouseEvent, canvas: SVGElement, primaryColor: string, secondaryColor: string) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
    const xPos = mouseEvent.pageX - this.OFFSET_CANVAS_X;
    const yPos = mouseEvent.pageY - this.OFFSET_CANVAS_Y;
    const newPattern = this.createPattern(primaryColor, secondaryColor);
    this.generateBrushPath(this.currentBrushPathNumber, xPos, yPos, this.strokeWidth);
    this.addPatternToNewPath(newPattern, RendererSingleton.getCanvas());
    this.mouseDown = true;
  }

  // Updates the path when the mouse is moving (mousedown)
  updateBrushPath(mouseEvent: MouseEvent, currentChildPosition: number) {
    this.updatePath(mouseEvent, currentChildPosition);
  }

  // Finalizes the path, sets up the next one
  finishBrushPath() {
    if (this.mouseDown) {
      this.currentBrushPathNumber += 1;
      this.pushAction(this.currentElement);
      this.mouseDown = false;
    }
  }

  createPattern(primaryColor: string, secondaryColor: string): SVGElement {
    const newPattern = RendererSingleton.renderer.createElement('pattern', 'svg');
    const patternToCopy = RendererSingleton.renderer
        .selectRootElement(`${this.currentBrushPattern.substring(4, this.currentBrushPattern.length - 1)}`, true);
    // Copy all children into new pattern
    newPattern.innerHTML = patternToCopy.innerHTML;
    // Also copy the necessary attributes
    RendererSingleton.renderer.setAttribute(newPattern, 'height', patternToCopy.getAttribute('height') as string);
    RendererSingleton.renderer.setAttribute(newPattern, 'width', patternToCopy.getAttribute('width') as string);
    RendererSingleton.renderer.setAttribute(newPattern, 'patternUnits', patternToCopy.getAttribute('patternUnits') as string);
    RendererSingleton.renderer.setProperty(newPattern, 'id', `brushPath${this.currentBrushPathNumber}pattern`);

    // Fills take the primary color
    for (const child of [].slice.call(newPattern.children)) {
      if (child.hasAttribute('fill')) {
        child.setAttribute('fill', primaryColor);
      }
    }
    // Strokes take the secondaryColor
    for (const child of [].slice.call(newPattern.children)) {
      if (child.hasAttribute('stroke')) {
        child.setAttribute('stroke', secondaryColor);
      }
    }
    const defs = RendererSingleton.renderer.selectRootElement('#definitions', true);
    RendererSingleton.renderer.appendChild(defs, newPattern);
    return newPattern;
  }

  addPatternToNewPath(pattern: SVGElement, canvas: SVGElement) {
    const newBrushPath = canvas.children[canvas.children.length - 1];
    const patternAddress = `url(#${pattern.id})`;
    newBrushPath.setAttribute('stroke', patternAddress);
  }

  findPatternFromBrushPath(brushPath: SVGElement, defsElement: SVGElement): SVGElement {
    for (const child of [].slice.call(defsElement.children)) {
      const childCast = child as SVGElement;
      if (childCast.id === brushPath.id + 'pattern') {
        return childCast;
      }
    }
    // No pattern was found for corresponding brush path, this should not happen as the pattern is created with the path
    return new SVGElement();
  }

  private generateBrushPath(id: number, xPos: number, yPos: number, strokeWidth: number): void {
    const path = RendererSingleton.renderer.createElement('path', 'svg');
    const properties: [string, string][] = [];
    properties.push(
      ['id', `brushPath${id}`],
      ['d', `M ${xPos} ${(yPos)} L ${(xPos)} ${(yPos)}`],
      ['stroke-width', `${strokeWidth}`],
      ['stroke-linecap', `round`],
      ['fill', `none`],
    );
    this.drawElement(path, properties);
  }
}
