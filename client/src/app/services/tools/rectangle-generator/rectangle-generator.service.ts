import {Injectable} from '@angular/core';
import {Action, ActionType} from '../../../data-structures/Command';
import {PlotType} from '../../../data-structures/PlotType';
import {RendererSingleton} from '../../renderer-singleton';

@Injectable()
export class RectangleGeneratorService {

  private OFFSET_CANVAS_Y: number;
  private OFFSET_CANVAS_X: number;
  private currentRectNumber: number;
  private mouseDown: boolean;

  // attributes of rectangle
  private strokeWidth: number;
  private plotType: PlotType;

  constructor() {
    this.strokeWidth = 1;
    this.plotType = PlotType.Contour;
    this.currentRectNumber = 0;
    this.mouseDown = false;
  }

  set _currentRectNumber(count: number) { this.currentRectNumber = count; }
  get _strokeWidth() {
    return this.strokeWidth;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _plotType() {
    return this.plotType;
  }

  set _plotType(plotType: PlotType) {
    this.plotType = plotType;
  }

  do(svgElement: SVGElement): Action {
    return {
      actionType: ActionType.Create,
      svgElements: [svgElement],
      execute(): void {
        RendererSingleton.getCanvas().innerHTML += svgElement;
      },
      unexecute(): void {
        RendererSingleton.renderer.removeChild(RendererSingleton.getCanvas(), this.svgElements[0]);
      },
    };
  }

  createRectangle(mouseEvent: MouseEvent, canvas: SVGElement, primaryColor: string, secondaryColor: string) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    switch (this.plotType) {
      case PlotType.Contour:
        canvas.innerHTML +=
        `<rect id="rect${this.currentRectNumber}"
        x="${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}"
        data-start-x="${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}"
        y="${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}"
        data-start-y="${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}"
        width="0" height="0" stroke="${secondaryColor}" stroke-width="${this.strokeWidth}"
        fill="transparent"></rect>`;
        break;
      case PlotType.Full:
        canvas.innerHTML +=
        `<rect id="rect${this.currentRectNumber}"
        x="${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}"
        data-start-x="${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}"
        y="${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}"
        data-start-y="${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}"
        width = "0" height = "0" stroke="transparent" stroke-width="${this.strokeWidth}"
        fill="${primaryColor}"></rect>`;
        break;
      case PlotType.FullWithContour:
        canvas.innerHTML +=
        `<rect id="rect${this.currentRectNumber}"
        x="${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}"
        data-start-x="${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}"
        y="${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}"
        data-start-y="${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}"
        width="0" height="0" stroke="${secondaryColor}" stroke-width="${this.strokeWidth}"
        fill="${primaryColor}"></rect>`;
        break;
    }
    this.mouseDown = true;
  }

  updateSquare(canvasPosX: number, canvasPosY: number, canvas: SVGElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentRect = canvas.children[currentChildPosition - 1];
      if (currentRect != null) {
        const startRectX: number = Number(currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(currentRect.getAttribute('data-start-y'));
        const actualWidth: number = canvasPosX - startRectX;
        const actualHeight: number = canvasPosY - startRectY;
        if (actualWidth >= 0) {
          if (Math.abs(actualHeight) > Math.abs(actualWidth)) {
            // height is bigger
            currentRect.setAttribute('width', '' + Math.abs(actualHeight));
          } else {
            // width is bigger, act normal
            currentRect.setAttribute('width', '' + actualWidth);
          }
        } else {
          if (Math.abs(actualHeight) > Math.abs(actualWidth)) {
            // height is bigger
            currentRect.setAttribute('width', '' + Math.abs(actualHeight));
            currentRect.setAttribute('x', '' + (canvasPosX + Math.abs(actualWidth) - Math.abs(actualHeight)));
          } else {
            // width is bigger, act normal
            currentRect.setAttribute('width', '' + Math.abs(actualWidth));
            currentRect.setAttribute('x', '' + canvasPosX);
          }
        }
        if (actualHeight >= 0) {
          if (Math.abs(actualWidth) > Math.abs(actualHeight)) {
            // width is bigger
            currentRect.setAttribute('height', '' + Math.abs(actualWidth));
          } else {
            // height is bigger, act normal
            currentRect.setAttribute('height', '' + actualHeight);
          }
        } else {
          if (Math.abs(actualWidth) > Math.abs(actualHeight)) {
            // width is bigger
            currentRect.setAttribute('height', '' + Math.abs(actualWidth));
            currentRect.setAttribute('y', '' + (canvasPosY + Math.abs(actualHeight) - Math.abs(actualWidth)));
          } else {
            // height is bigger, act normal
            currentRect.setAttribute('height', '' + Math.abs(actualHeight));
            currentRect.setAttribute('y', '' + canvasPosY);
          }
        }
      }
    }
  }

  updateRectangle(canvasPosX: number, canvasPosY: number, canvas: SVGElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentRect = canvas.children[currentChildPosition - 1];
      if (currentRect != null) {
        const startRectX: number = Number(currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(currentRect.getAttribute('data-start-y'));
        const actualWidth: number = canvasPosX - startRectX;
        const actualHeight: number = canvasPosY - startRectY;
        if (actualWidth >= 0) {
          currentRect.setAttribute('width', '' + actualWidth);
        } else {
          currentRect.setAttribute('width', '' + Math.abs(actualWidth));
          currentRect.setAttribute('x', '' + canvasPosX);
        }
        if (actualHeight >= 0) {
          currentRect.setAttribute('height', '' + actualHeight);
        } else {
          currentRect.setAttribute('height', '' + Math.abs(actualHeight));
          currentRect.setAttribute('y', '' + canvasPosY);
        }
      }
    }
  }

  finishRectangle(currentChildPosition: number) {
    if (this.mouseDown) {
      this.currentRectNumber += 1;
      this.mouseDown = false;
      const currentRect =
        RendererSingleton.renderer.selectRootElement('#canvas', true).children[currentChildPosition - 1];
      console.log(currentRect.getAttribute('id'));
    }
  }

}
