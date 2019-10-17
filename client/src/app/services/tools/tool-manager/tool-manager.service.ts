import { Injectable, Renderer2 } from '@angular/core';
import { Tools } from '../../../data-structures/Tools';
import { BrushGeneratorService } from '../brush-generator/brush-generator.service';
import { ColorApplicatorService } from '../color-applicator/color-applicator.service';
import { ColorService } from '../color/color.service';
import { EmojiGeneratorService } from '../emoji-generator/emoji-generator.service';
import { ObjectSelectorService } from '../object-selector/object-selector.service';
import { PencilGeneratorService } from '../pencil-generator/pencil-generator.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';
import { MousePositionService } from './../../mouse-position/mouse-position.service';
import { EllipseGeneratorService } from './../ellipse-generator/ellipse-generator.service';
import { EyedropperService } from './../eyedropper/eyedropper.service';
import { LineGeneratorService } from './../line-generator/line-generator.service';

@Injectable()
export class ToolManagerService {

  private numberOfElements = 1;
  private renderer: Renderer2;
  private canvasElement: SVGElement;
  private activeTool: Tools;
  private hasBeenTranslated: boolean;

  set _activeTool(tool: Tools) {
    this.activeTool = tool;
  }

  get _activeTool(): Tools {
    return this.activeTool;
  }

  constructor(private rectangleGenerator: RectangleGeneratorService,
              private ellipseGenerator: EllipseGeneratorService,
              private emojiGenerator: EmojiGeneratorService,
              private pencilGenerator: PencilGeneratorService,
              private brushGenerator: BrushGeneratorService,
              private colorApplicator: ColorApplicatorService,
              private objectSelector: ObjectSelectorService,
              private lineGenerator: LineGeneratorService,
              private eyedropper: EyedropperService,
              protected colorService: ColorService,
              protected mousePosition: MousePositionService) {
    this.activeTool = Tools.Pencil;
    this.hasBeenTranslated = false;
  }

  loadRenderer(renderer: Renderer2) {
    this.renderer = renderer;
    // Give it to the tools who also need it
    this.colorApplicator._renderer = renderer;
    this.eyedropper._renderer = renderer;
    this.lineGenerator._renderer = renderer;
    this.brushGenerator._renderer = renderer;
  }

  createElement(mouseEvent: MouseEvent, canvas: SVGElement) {
    switch (this._activeTool) {
      case Tools.Rectangle:
        this.rectangleGenerator
          .createRectangle(mouseEvent, canvas, this.colorService.getPrimaryColor(), this.colorService.getSecondaryColor());
        break;
      case Tools.Pencil:
        this.pencilGenerator.createPenPath(mouseEvent, canvas, this.colorService.getSecondaryColor());
        break;
      case Tools.Brush:
        this.brushGenerator
          .createBrushPath(mouseEvent, canvas, this.colorService.getPrimaryColor(), this.colorService.getSecondaryColor());
        break;
      case Tools.Selector:
        this.objectSelector.createSelectorRectangle(mouseEvent, canvas);
        break;
      case Tools.Ellipse:
        this.ellipseGenerator
          .createEllipse(mouseEvent, canvas, this.colorService.getPrimaryColor(), this.colorService.getSecondaryColor());
        break;
      case Tools.Stamp:
        this.emojiGenerator.addEmoji(mouseEvent, canvas);
        break;
      default:
        return;
    }
    this.numberOfElements = canvas.children.length;
  }

  updateElement(mouseEvent: MouseEvent, canvas: SVGElement) {
    switch (this._activeTool) {
      case Tools.Rectangle:
        if (mouseEvent.shiftKey) {
          this.rectangleGenerator.updateSquare(this.mousePosition._canvasMousePositionX,
            this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
        } else {
          this.rectangleGenerator.updateRectangle(this.mousePosition._canvasMousePositionX,
            this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
        }
        break;
      case Tools.Pencil:
        this.pencilGenerator.updatePenPath(mouseEvent, canvas, this.numberOfElements);
        break;
      case Tools.Brush:
        this.brushGenerator.updateBrushPath(mouseEvent, canvas, this.numberOfElements);
        break;
      case Tools.Selector:
        this.objectSelector.updateSelectorRectangle(mouseEvent, canvas);
        this.updateNumberOfElements();
        break;
      case Tools.Line:
        this.lineGenerator.updateLine(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
        break;
      case Tools.Ellipse:
        if (mouseEvent.shiftKey) {
          this.ellipseGenerator.updateCircle(this.mousePosition._canvasMousePositionX,
            this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
        } else {
          this.ellipseGenerator.updateEllipse(this.mousePosition._canvasMousePositionX,
            this.mousePosition._canvasMousePositionY, canvas, this.numberOfElements);
        }
        break;
      default:
        return;
    }
  }

  finishElement() {
    switch (this._activeTool) {
      case Tools.Rectangle:
        this.rectangleGenerator.finishRectangle();
        break;
      case Tools.Pencil:
        this.pencilGenerator.finishPenPath();
        break;
      case Tools.Brush:
        this.brushGenerator.finishBrushPath();
        break;
      case Tools.Selector:
        this.objectSelector.finishSelector(this.renderer.selectRootElement('#canvas', true));
        this.updateNumberOfElements();
        break;
      case Tools.Ellipse:
        this.ellipseGenerator.finishEllipse();
        break;
      default:
        return;
    }
  }

  changeElementLeftClick(clickedElement: SVGElement,  canvas: SVGElement) {
    switch (this._activeTool) {
      case Tools.ColorApplicator:
        this.colorApplicator.changePrimaryColor(clickedElement, this.colorService.getPrimaryColor());
        break;
      case Tools.Line:
        this.lineGenerator.makeLine(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, canvas, this.colorService.getSecondaryColor(),
            this.numberOfElements);
        break;
      case Tools.Eyedropper:
        this.eyedropper.changePrimaryColor(clickedElement);
        break;
      default:
        return;
    }
    this.numberOfElements = canvas.children.length;
  }

  changeElementRightClick(clickedElement: SVGElement) {
    switch (this._activeTool) {
      case Tools.ColorApplicator:
        this.colorApplicator.changeSecondaryColor(clickedElement, this.colorService.getSecondaryColor());
        break;
      case Tools.Eyedropper:
          this.eyedropper.changeSecondaryColor(clickedElement);
          break;
      default:
        return;
    }
  }

  finishElementDoubleClick(mouseEvent: MouseEvent, canvas: SVGElement) {
    if (this._activeTool === Tools.Line) {
      if (mouseEvent.shiftKey) {
        this.lineGenerator.finishAndLinkLineBlock(canvas, this.numberOfElements);
      } else {
        this.lineGenerator.finishLineBlock(canvas, this.numberOfElements);
      }
    }
  }
  changeElementAltDown() {
    this.emojiGenerator.lowerRotationStep();
  }

  changeElementAltUp() {
    this.emojiGenerator.higherRotationStep();
  }

  changeElementShiftDown() {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
    switch (this._activeTool) {
      case Tools.Rectangle:
        // change into square
        this.rectangleGenerator.updateSquare(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
        break;
      case Tools.Ellipse:
        // change into circle
        this.ellipseGenerator.updateCircle(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
        break;
      default:
        return;
    }
  }

  changeElementShiftUp() {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
    switch (this._activeTool) {
      case Tools.Rectangle:
        // change into rectangle
        this.rectangleGenerator.updateRectangle(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
        break;
      case Tools.Ellipse:
        // change into ellipse
        this.ellipseGenerator.updateEllipse(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
        break;
      default:
        return;
    }
  }

  drawingNonEmpty(): boolean {
    return this.numberOfElements > 1;
  }

  deleteAllDrawings(): void {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
    for (let i = this.canvasElement.children.length - 1; i > 0; i--) {
      this.canvasElement.children[i].remove();
    }
    this.numberOfElements = 1;
  }

  updateNumberOfElements(): void {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
    this.numberOfElements = this.canvasElement.childNodes.length;
  }

  escapePress() {
    switch (this._activeTool) {
      case Tools.Line:
        this.canvasElement = this.renderer.selectRootElement('#canvas', true);
        this.lineGenerator.deleteLineBlock(this.canvasElement, this.numberOfElements);
        this.numberOfElements = this.canvasElement.children.length;
        break;
      default:
        return;
    }
  }
  selectorMouseDown(): void {
    const selectorBox = this.canvasElement.querySelector('#boxrect') as SVGGElement;
    const box = selectorBox.getBBox();
    if (this.mousePosition._canvasMousePositionX < box.x || this.mousePosition._canvasMousePositionX > (box.x + box.width)
      || this.mousePosition._canvasMousePositionY < box.y || this.mousePosition._canvasMousePositionY > (box.y + box.height)) {
        this.removeSelector();
      // si il y a objet présent, inverser
    } else { this.objectSelector.startTranslation(); }
  }

  translate(mouseEvent: MouseEvent): void {
    this.objectSelector.translate(mouseEvent);
  }

  finishTranslation(): void {
    this.objectSelector.drop();
    this.hasBeenTranslated = true;
  }

  removeSelector(): void {
    const box = this.canvasElement.querySelector('#box') as SVGElement;
    const boxrect = this.canvasElement.querySelector('#boxrect') as SVGElement;
    const selected = this.canvasElement.querySelector('#selected') as SVGGElement;
    // tslint:disable-next-line: no-non-null-assertion
    const childArray = Array.from(selected!.children);
    childArray.forEach((child) => {
      if (this.hasBeenTranslated) {
      this.changeChildPosition(child, box);
      }
      this.canvasElement.appendChild(child);
    });
    box.removeChild(boxrect);
    this.canvasElement.removeChild(box);
    this.hasBeenTranslated = false;
  }

  backSpacePress() {
    switch (this._activeTool) {
      case Tools.Line:
        this.canvasElement = this.renderer.selectRootElement('#canvas', true);
        this.lineGenerator.deleteLine(this.canvasElement, this.numberOfElements);
        this.lineGenerator.updateLine(this.mousePosition._canvasMousePositionX,
          this.mousePosition._canvasMousePositionY, this.canvasElement, this.numberOfElements);
        break;
      default:
        return;
    }
  }

  changeChildPosition(child: Element, box: SVGElement): void {
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
        const xforms = child.getAttribute('transform');
        if (xforms) {
          // tslint:disable-next-line: no-non-null-assertion
          const parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(xforms!);
          // tslint:disable-next-line: no-non-null-assertion
          const firstX = parseFloat(parts![1]);
          // tslint:disable-next-line: no-non-null-assertion
          const firstY = parseFloat(parts![2]);
          // tslint:disable-next-line: no-non-null-assertion
          newX = parseFloat('' + (firstX + parseFloat(box.getAttribute('x')!)));
          // tslint:disable-next-line: no-non-null-assertion
          newY = parseFloat('' + (firstY + parseFloat(box.getAttribute('y')!)));
        } else {
          newX = parseFloat('' + box.getAttribute('x'));
          newY = parseFloat('' + box.getAttribute('y'));
        }
        child.setAttribute('transform', 'translate(' + newX + ' ' + newY + ')');
        break;
      case 'polygon':
        // TODO
        break;
      default:
        break;
    }
  }

  rotateEmoji(mouseEvent: WheelEvent): void {
    this.emojiGenerator.rotateEmoji(mouseEvent);
  }
}
