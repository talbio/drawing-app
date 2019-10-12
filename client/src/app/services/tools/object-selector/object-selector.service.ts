import { Injectable } from '@angular/core';
import { Colors } from 'src/app/data-structures/Colors';
import { MousePositionService } from '../../mouse-position/mouse-position.service';

const DASHED_LINE_VALUE = 5;
const STROKE_COLOR = Colors.BLACK;

@Injectable()
export class ObjectSelectorService {

  private OFFSET_CANVAS_Y: number;
  private OFFSET_CANVAS_X: number;
  private mouseDownSelector: boolean;
  private mouseDownTranslation: boolean;
  private currentRect: Element;
  private SVGArray: SVGElement[] = new Array();
  private isSelectorVisible: boolean;

  constructor(protected mousePosition: MousePositionService) {
    this.mouseDownSelector = false;
  }

  createSelectorRectangle(mouseEvent: MouseEvent, canvas: HTMLElement) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    canvas.innerHTML +=
      `<rect
            x="${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}"
            data-start-x = "${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}"
            y="${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}"
            data-start-y = "${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}"
            width = "0" height = "0" stroke="${STROKE_COLOR}" stroke-dasharray = "${DASHED_LINE_VALUE}"
            fill="transparent"></rect>`;
    this.mouseDownSelector = true;
  }

  updateSelectorRectangle(mouseEvent: MouseEvent, canvas: HTMLElement, currentChildPosition: number) {

    if (this.mouseDownSelector) {
      this.currentRect = canvas.children[currentChildPosition - 1];
      if (this.currentRect != null) {
        this.isSelectorVisible = true;
        const startRectX: number = Number(this.currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(this.currentRect.getAttribute('data-start-y'));
        const actualWidth: number = (mouseEvent.pageX - this.OFFSET_CANVAS_X) - startRectX;
        const actualHeight: number = (mouseEvent.pageY - this.OFFSET_CANVAS_Y) - startRectY;
        if (actualWidth >= 0) {
          this.currentRect.setAttribute('width', '' + actualWidth);
        } else {
          this.currentRect.setAttribute('width', '' + Math.abs(actualWidth));
          this.currentRect.setAttribute('x', '' + (mouseEvent.pageX - this.OFFSET_CANVAS_X));
        }
        if (actualHeight >= 0) {
          this.currentRect.setAttribute('height', '' + actualHeight);
        } else {
          this.currentRect.setAttribute('height', '' + Math.abs(actualHeight));
          this.currentRect.setAttribute('y', '' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
        }
      }
      this.selectItems(canvas);
    }
  }

  selectItems(canvas: HTMLElement): void {
    const drawings = canvas.querySelectorAll('rect, path, ellipse, line');
    const tempArray = new Array();
    drawings.forEach((drawing) => {
      if ((this.intersects(drawing.getBoundingClientRect() as DOMRect)) && (drawing.id !== '')) {
        tempArray.push(drawing);
      }
    });
    this.SVGArray = tempArray;
  }

  intersects(a: DOMRect): boolean {
    const b = this.currentRect.getBoundingClientRect();
    return !((a.left > b.right ||
      b.left > a.right) ||
      (a.top > b.bottom ||
        b.top > a.bottom));
  }

  finishSelector(canvas: HTMLElement): void {
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

  addToGroup(canvas: HTMLElement): void {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', 'selected');
    this.SVGArray.forEach((drawing) => {
      group.append(drawing);
    });
    canvas.append(group);
    // tslint:disable-next-line: no-non-null-assertion
    const boxGroup = group!.getBBox();
    canvas.innerHTML +=
      `<svg id="box"><rect id="boxrect"
            x="${boxGroup.x}"
            data-start-x = "${boxGroup.x}"
            y="${boxGroup.y}"
            data-start-y = "${boxGroup.y}"
            width = "${boxGroup.width}" height = "${boxGroup.height}"
            stroke="${STROKE_COLOR}"
            fill="transparent">
            </rect></svg>`;
    const box = canvas.querySelector('#box') as SVGGElement;
    box.append(group);
    const selected = canvas.querySelector('#selected') as SVGGElement;
    canvas.removeChild(selected);
  }

  startTranslation(): void {
    this.mouseDownTranslation = true;
  }

  translate(mouseEvent: MouseEvent): void {
    if (this.mouseDownTranslation) {
      const group = document.querySelector('#box') as SVGGElement;
      // tslint:disable-next-line: no-non-null-assertion
      const box = group!.getBBox();
      group.setAttribute('x', '' + (mouseEvent.pageX - this.OFFSET_CANVAS_X -  box.width  - (box.width / 2) ));
      group.setAttribute('y', '' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y -  box.height - (box.height / 2)));
    }
  }

  drop() {
    const groupElement = document.querySelector('#box') as SVGGElement;
    groupElement.setAttributeNS(null, 'onmousemove', 'null');
    this.mouseDownTranslation = false;
  }

}
