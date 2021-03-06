import { Injectable } from '@angular/core';
// tslint:disable-next-line: max-line-length
import { BOTTOM_AFTER, BOTTOM_BEFORE, DEFAULT_FEATHER_ANGLE, DEFAULT_FEATHER_STROKE_WIDTH, MAX_ROTATION_STEP, MIN_ROTATION_STEP, TOP_AFTER, TOP_BEFORE, X, Y } from 'src/app/data-structures/constants';
import { AbstractWritingTool } from '../../../data-structures/abstract-writing-tool';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { RendererSingleton } from '../../renderer-singleton';
import { UndoRedoService } from '../../undo-redo/undo-redo.service';

@Injectable()
export class FeatherPenGeneratorService extends AbstractWritingTool {

  angle: number;
  rotationStep: number;
  color: string;
  idPrefix: string;
  pathArray: SVGElement[];
  polygonPoints: number[][];
  private subPathIndex: number;

  constructor(protected undoRedoService: UndoRedoService,
              protected mouse: MousePositionService) {
      super(mouse, undoRedoService);
      this.angle = DEFAULT_FEATHER_ANGLE;
      this.idPrefix = 'featherPenPath';
      this.polygonPoints = [[0, 0], [0, 0], [0, 0], [0, 0]];
      this.strokeWidth = DEFAULT_FEATHER_STROKE_WIDTH;
      this.pathArray = [];
      this.subPathIndex = 0;
      this.rotationStep = MAX_ROTATION_STEP;
  }

  degreesToRadians(angle: number) {
    return angle * (Math.PI / 180);
  }

  get rotationAngle() {
      return this.angle;
  }

  set rotationAngle(angle: number) {
    if (angle > 179) {
      angle = 0;
    } else if (angle < 0) {
      angle = 179;
    } else {
      this.angle = angle;
    }
  }

  lowerRotationStep(): void {
      this.rotationStep = MIN_ROTATION_STEP;
  }

  higherRotationStep(): void {
      this.rotationStep = MAX_ROTATION_STEP;
  }

  rotateFeather(mouseEvent: WheelEvent): void {
    if (mouseEvent.deltaY < 0) {
        this.angle  += this.rotationStep;
    } else { this.angle  -= this.rotationStep; }
    if (this.angle < 0) { this.angle += 180; }
    if (this.angle >= 180) { this.angle -= 180; }
  }

  createElement(mainColors: string[]) {
      this.color = mainColors[1];
      this.initializePoints();
      this.getNewPoints();
      this.producePolygon();
      this.actualizePoints();
      this.mouseDown = true;
  }

  updateElement() {
      if (this.mouseDown) {
          this.getNewPoints();
          this.producePolygon();
          this.actualizePoints();
      }
  }

  finishElement(): void {
      if (this.mouseDown) {
          this.currentElementsNumber += 1;
          this.pushGeneratorCommand(...this.pathArray);
          this.pathArray = [];
          this.mouseDown = false;
          this.subPathIndex = 0;
      }
  }

  initializePoints() {
      this.polygonPoints[TOP_BEFORE][X] = this.xPos + Math.cos(this.degreesToRadians(this.angle)) * (this.strokeWidth / 2);
      this.polygonPoints[TOP_BEFORE][Y] = this.yPos + Math.sin(this.degreesToRadians(this.angle)) * (this.strokeWidth / 2);
      this.polygonPoints[BOTTOM_BEFORE][X] = this.xPos - Math.cos(this.degreesToRadians(this.angle)) * (this.strokeWidth / 2);
      this.polygonPoints[BOTTOM_BEFORE][Y] = this.yPos - Math.sin(this.degreesToRadians(this.angle)) * (this.strokeWidth / 2);
  }

  getNewPoints() {
      this.polygonPoints[TOP_AFTER][X] = this.xPos + Math.cos(this.degreesToRadians(this.angle)) * (this.strokeWidth / 2);
      this.polygonPoints[TOP_AFTER][Y] = this.yPos + Math.sin(this.degreesToRadians(this.angle)) * (this.strokeWidth / 2);
      this.polygonPoints[BOTTOM_AFTER][X] = this.xPos - Math.cos(this.degreesToRadians(this.angle)) * (this.strokeWidth / 2);
      this.polygonPoints[BOTTOM_AFTER][Y] = this.yPos - Math.sin(this.degreesToRadians(this.angle)) * (this.strokeWidth / 2);
  }

  actualizePoints() {
    this.polygonPoints[TOP_BEFORE][X] = this.polygonPoints[TOP_AFTER][X];
    this.polygonPoints[TOP_BEFORE][Y] = this.polygonPoints[TOP_AFTER][Y];
    this.polygonPoints[BOTTOM_BEFORE][X] = this.polygonPoints[BOTTOM_AFTER][X];
    this.polygonPoints[BOTTOM_BEFORE][Y] = this.polygonPoints[BOTTOM_AFTER][Y];
  }

  producePolygon() {
    const polygon = RendererSingleton.renderer.createElement('polygon', 'svg');
    const properties = this.getProperties();
    this.drawElement(polygon, properties);
    this.pathArray[this.subPathIndex++] = polygon;
  }

  getProperties(): [string, string][] {
    let points = '';
    this.polygonPoints.forEach((element: number[]) => {
        points += ('' + element[X] + ',' + element[Y] + ' ');
    });
    const properties: [string, string][] = [];
    properties.push(
      ['id', this.idPrefix + this.currentElementsNumber],
      ['points', points],
      ['stroke', this.color],
      ['stroke-width', '2'],
      ['fill', this.color],
    );
    return properties;
  }
}
