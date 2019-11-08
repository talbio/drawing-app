import { Injectable } from '@angular/core';
import { Colors } from 'src/app/data-structures/colors';
import { MousePositionService } from '../../mouse-position/mouse-position.service';

const DASHED_LINE_VALUE = 5;
const STROKE_COLOR = Colors.BLACK;

@Injectable()
export class ObjectSelectorService {

  private mouseDownSelector: boolean;
  private mouseDownTranslation: boolean;
  private currentRect: Element;
  SVGArray: SVGElement[] = [];
  private isSelectorVisible: boolean;
  private hasBeenTranslated: boolean;
  private initialX: number;
  private initialY: number;

  constructor(protected mousePosition: MousePositionService) {
    this.mouseDownSelector = false;
    this.hasBeenTranslated = false;
  }

  selectorMouseDown(mouseEvent: MouseEvent, canvas: SVGElement) {
    if (!canvas.querySelector('#selected')) {
      this.createSelectorRectangle(canvas);
    } else {
      const selectorBox = canvas.querySelector('#boxrect') as SVGGElement;
      const box = selectorBox.getBBox();
      if (this.mousePosition.canvasMousePositionX < box.x || this.mousePosition.canvasMousePositionX > (box.x + box.width)
        || this.mousePosition.canvasMousePositionY < box.y || this.mousePosition.canvasMousePositionY > (box.y + box.height)) {
        this.removeSelector(canvas);
      } else { this.startTranslation(); }
    }

  }

  removeSelector(canvas: SVGElement): void {
    const box = canvas.querySelector('#box') as SVGElement;
    const boxrect = canvas.querySelector('#boxrect') as SVGElement;
    box.removeChild(boxrect);
    canvas.removeChild(box);
    this.hasBeenTranslated = false;
  }

  createSelectorRectangle(canvas: SVGElement) {

    canvas.innerHTML +=
      `<rect id="selector"
            x="${this.mousePosition.canvasMousePositionX}"
            data-start-x = "${this.mousePosition.canvasMousePositionX}"
            y="${this.mousePosition.canvasMousePositionY}"
            data-start-y = "${this.mousePosition.canvasMousePositionY}"
            width = "0" height = "0" stroke="${STROKE_COLOR}" stroke-dasharray = "${DASHED_LINE_VALUE}"
            fill="transparent"></rect>`;
    this.mouseDownSelector = true;
  }

  updateSelector(canvas: SVGElement) {
    if (!canvas.querySelector('#selected')) {
      this.updateSelectorRectangle(canvas);
    } else { this.translate(); }
  }
  updateSelectorRectangle(canvas: SVGElement) {

    if (this.mouseDownSelector) {
      this.currentRect = canvas.querySelector('#selector') as Element;
      if (this.currentRect != null) {
        this.isSelectorVisible = true;
        const startRectX: number = Number(this.currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(this.currentRect.getAttribute('data-start-y'));
        const actualWidth: number = this.mousePosition.canvasMousePositionX - startRectX;
        const actualHeight: number = this.mousePosition.canvasMousePositionY - startRectY;
        if (actualWidth >= 0) {
          this.currentRect.setAttribute('width', '' + actualWidth);
        } else {
          this.currentRect.setAttribute('width', '' + Math.abs(actualWidth));
          this.currentRect.setAttribute('x', '' + this.mousePosition.canvasMousePositionX);
        }
        if (actualHeight >= 0) {
          this.currentRect.setAttribute('height', '' + actualHeight);
        } else {
          this.currentRect.setAttribute('height', '' + Math.abs(actualHeight));
          this.currentRect.setAttribute('y', '' + this.mousePosition.canvasMousePositionY);
        }
      }
      this.selectItems(canvas);
    }
  }

  selectItems(canvas: SVGElement): void {
    const drawings = canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon');
    const tempArray = new Array();
    drawings.forEach((drawing) => {
      if ((this.intersects(drawing.getBoundingClientRect() as DOMRect)) && (drawing.id !== 'selector')
        && (drawing.id !== 'backgroundGrid') && (drawing.id !== '')) {
        tempArray.push(drawing);
      }
    });
    this.SVGArray = tempArray;
  }

  selectAll(canvas: SVGElement): void {
    if (!canvas.querySelector('#selected')) {
      const drawings = canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon');
      const tempArray = new Array();
      drawings.forEach((drawing) => {
        if ((drawing.id !== 'selector') && (drawing.id !== 'backgroundGrid') && (drawing.id !== '')) {
          tempArray.push(drawing);
        }
      });
      this.SVGArray = tempArray;
      this.addToGroup(canvas);
    }
  }

  intersects(a: DOMRect): boolean {
    const b = this.currentRect.getBoundingClientRect();
    return !((a.left > b.right ||
      b.left > a.right) ||
      (a.top > b.bottom ||
        b.top > a.bottom));
  }

  finish(canvas: SVGElement): void {
    if (!canvas.querySelector('#selected')) {
      this.finishSelection(canvas);
    } else { this.finishTranslation(canvas); }
  }

  finishSelection(canvas: SVGElement): void {
    if (this.mouseDownSelector) {
      if (this.isSelectorVisible) {
        canvas.removeChild(this.currentRect);
        this.isSelectorVisible = false;
        if (this.SVGArray.length !== 0) {
          this.addToGroup(canvas);
        }
      }
    }
    this.mouseDownSelector = false;
  }

  addToGroup(canvas: SVGElement): void {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', 'selected');
    this.SVGArray.forEach((drawing) => {
      group.append(drawing);
    });
    canvas.append(group);
    const boxGroup = (group as SVGGElement).getBBox();
    canvas.innerHTML +=
      `<svg id="box">
        <defs><marker id="dot" viewBox="0 0 10 10" refX="5" refY="5"
        markerWidth="5" markerHeight="5">
        <circle cx="5" cy="5" r="20" fill="red" />
        </marker></defs>
        <polyline id="boxrect"
        points="${boxGroup.x},${boxGroup.y} ${boxGroup.x + (boxGroup.width / 2)},${boxGroup.y} ${boxGroup.x + boxGroup.width},${boxGroup.y}
        ${boxGroup.x + boxGroup.width},${boxGroup.y + (boxGroup.height / 2)} ${boxGroup.x + boxGroup.width},${boxGroup.y + boxGroup.height}
        ${boxGroup.x + (boxGroup.width / 2)},${boxGroup.y + boxGroup.height} ${boxGroup.x},${boxGroup.y + boxGroup.height}
         ${boxGroup.x},${boxGroup.y + (boxGroup.height / 2)} ${boxGroup.x},${boxGroup.y}"
        stroke="${STROKE_COLOR}" fill="transparent"
        marker-start="url(#dot)" marker-mid="url(#dot)">
        </polyline></svg>`;
    const box = canvas.querySelector('#box') as SVGGElement;
    box.append(group);
    const selected = canvas.querySelector('#selected') as SVGGElement;
    canvas.removeChild(selected);
  }

  startTranslation(): void {
    this.mouseDownTranslation = true;
    const group = document.querySelector('#box');
    const box = (group as Element).getBoundingClientRect();
    this.initialX = box.left;
    this.initialY = box.top;
  }

  translate(): void {
    if (this.mouseDownTranslation) {
      const group = document.querySelector('#box');
      const box = (group as Element).getBoundingClientRect();
      (group as Element).setAttribute('x', '' + (this.mousePosition.canvasMousePositionX - this.initialX - (box.width / 2)));
      (group as Element).setAttribute('y', '' + (this.mousePosition.canvasMousePositionY - this.initialY - (box.height / 2)));
    }
    this.hasBeenTranslated = true;
  }

  finishTranslation(canvas: SVGElement) {
    const groupElement = document.querySelector('#box') as SVGGElement;
    groupElement.setAttributeNS(null, 'onmousemove', 'null');
    const box = canvas.querySelector('#box') as SVGElement;
    const selected = canvas.querySelector('#selected') as SVGGElement;
    const childArray = Array.from(selected.children);
    childArray.forEach((child) => {
      if (this.hasBeenTranslated) {
        this.translateChildren(child, box);
      }
      canvas.appendChild(child);
    });
    this.mouseDownTranslation = false;
  }

  translateChildren(child: Element, box: SVGElement): void {
    let newX: number;
    let newY: number;
    switch (child.nodeName) {
      case 'rect':
      case 'image':
        newX = parseFloat('' + child.getAttribute('x')) + parseFloat('' + box.getAttribute('x'));
        newY = parseFloat('' + child.getAttribute('y')) + parseFloat('' + box.getAttribute('y'));
        child.setAttribute('x', newX as unknown as string);
        child.setAttribute('y', newY as unknown as string);
        break;
      case 'ellipse':
        newX = parseFloat('' + child.getAttribute('cx')) + parseFloat('' + box.getAttribute('x'));
        newY = parseFloat('' + child.getAttribute('cy')) + parseFloat('' + box.getAttribute('y'));
        child.setAttribute('cx', newX as unknown as string);
        child.setAttribute('cy', newY as unknown as string);
        break;
      case 'path':
      case 'polyline':
      case 'polygon':
        const xforms = child.getAttribute('transform');
        if (xforms) {
          const parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(xforms as string) as unknown as string;
          const firstX = parseFloat(parts[1]);
          const firstY = parseFloat(parts[2]);
          newX = parseFloat('' + (firstX + parseFloat(box.getAttribute('x') as string)));
          newY = parseFloat('' + (firstY + parseFloat(box.getAttribute('y') as string)));
        } else {
          newX = parseFloat('' + box.getAttribute('x'));
          newY = parseFloat('' + box.getAttribute('y'));
        }
        child.setAttribute('transform', 'translate(' + newX + ' ' + newY + ')');
        break;
      default:
        break;
    }
  }
}
