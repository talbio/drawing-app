import { MousePositionService } from './../../mouse-position/mouse-position.service';
import { Injectable, Renderer2 } from '@angular/core';

@Injectable()
export class BrushGeneratorService {

  private readonly DEFAULT_WIDTH = 5;
  private readonly DEFAULT_BRUSH_PATTERN = 'url(#brushPattern1)';

  private renderer: Renderer2;
  private strokeWidth: number;
  private currentBrushPathNumber: number;
  private mouseDown: boolean;
  private currentBrushPattern: string;

  constructor(private mousePosition: MousePositionService) {
    this.strokeWidth = this.DEFAULT_WIDTH;
    this.currentBrushPattern = this.DEFAULT_BRUSH_PATTERN;
    this.mouseDown = false;
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

  generateBrushPath(id: number, strokeWidth: number): string {
    return `<path
      id=\'brushPath${id}\'
      d=\'M ${this.mousePosition.canvasMousePositionX} ${(this.mousePosition.canvasMousePositionY)}
      L ${this.mousePosition.canvasMousePositionX} ${this.mousePosition.canvasMousePositionY}\'
      stroke-width=\'${strokeWidth}\' stroke-linecap=\'round\' fill=\'none\'></path>`;
  }

  createBrushPath(canvas: SVGElement, primaryColor: string, secondaryColor: string) {

    canvas.innerHTML +=
      this.generateBrushPath(this.currentBrushPathNumber, this.strokeWidth);

    this.createPattern(primaryColor, secondaryColor);
    this.mouseDown = true;
  }

  // Updates the path when the mouse is moving (mousedown)
  updateBrushPath(canvas: SVGElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentPath = canvas.children[currentChildPosition - 1];
      if (currentPath != null) {
        currentPath.setAttribute('d',
          currentPath.getAttribute('d') + ' L' + this.mousePosition.canvasMousePositionX +
        ' ' + this.mousePosition.canvasMousePositionY);
      }
    }
  }

  // Finalizes the path, sets up the next one
  finishBrushPath() {
    if (this.mouseDown) {
      this.currentBrushPathNumber += 1;
      this.mouseDown = false;
    }
  }

  createPattern(primaryColor: string, secondaryColor: string): SVGElement {
    const newPattern = this.renderer.createElement('pattern');
    const patternToCopy = this.renderer
        .selectRootElement(`${this.currentBrushPattern.substring(4, this.currentBrushPattern.length - 1)}`, true);
    // Copy all children into new pattern
    newPattern.innerHTML = patternToCopy.innerHTML;
    // Also copy the necessary attributes
    this.renderer.setAttribute(newPattern, 'height', patternToCopy.getAttribute('height') as string);
    this.renderer.setAttribute(newPattern, 'width', patternToCopy.getAttribute('width') as string);
    this.renderer.setAttribute(newPattern, 'patternUnits', patternToCopy.getAttribute('patternUnits') as string);
    this.renderer.setProperty(newPattern, 'id', `brushPath${this.currentBrushPathNumber}pattern`);
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
    const defs = this.renderer.selectRootElement('#definitions', true);
    const canvas = this.renderer.selectRootElement('#canvas', true);
    this.renderer.appendChild(defs, newPattern);
    this.addPatternToNewPath(newPattern, canvas);
    // reload
    canvas.innerHTML = canvas.innerHTML;
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
  set _renderer(rend: Renderer2) {
    this.renderer = rend;
  }

  clone(item: SVGElement): string {
    const linecap = item.getAttribute('stroke-linecap');
    const color1 = item.getAttribute('fill');
    // const color2 = item.getAttribute('stroke');
    const strokeWidth = item.getAttribute('stroke-width');
    const currentPath = item.getAttribute('d');
    let points: string[];
    if (currentPath !== null) {
      points = currentPath.split(' ');
      // Slightly displacing each point
      for (let point of points) {
        if (point !== 'L' && point !== 'M' && point !== 'Z') {
          point = (parseFloat(point) + 10) as unknown as string;
        }
      }
      const newItem =
        `<path id="brushPath${this.currentBrushPathNumber}"
        d="${currentPath}" stroke-width="${strokeWidth}"
        stroke-linecap="${linecap}" fill="${color1}"></path>`;
      this.currentBrushPathNumber++;
      return newItem;
    } else {
      console.log('cannot recognize "d" in html of ' + item.id);
      return 'to discard';
    }
  }
}
