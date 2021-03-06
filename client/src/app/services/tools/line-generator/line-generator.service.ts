import { Injectable } from '@angular/core';
// tslint:disable-next-line: max-line-length
import { CURVY_ENDS, DASHARRAY_DOT_SIZE, DEFAULT_DASHARRAY, DEFAULT_LINECAP, DEFAULT_LINEDASHSTYLE, DEFAULT_LINEJOIN, DEFAULT_LINEJOINSTYLE, DEFAULT_POLYLINE_MARKER_DIAMETER, DEFAULT_POLYLINE_WIDTH, LINEJOIN_ANGLE, LINEJOIN_ROUND, STRAIGHT_ENDS } from 'src/app/data-structures/constants';
import { LineDashStyle, LineJoinStyle } from 'src/app/data-structures/line-styles';
import {AbstractGenerator} from '../../../data-structures/abstract-generator';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';
import { MousePositionService } from './../../mouse-position/mouse-position.service';

@Injectable()
export class LineGeneratorService extends AbstractGenerator {

  private strokeWidth: number;
  private markerDiameter: number;
  private isMakingLine = false;
  private currentPolylineStartX: number;
  private currentPolylineStartY: number;
  private isMarkersActive: boolean;
  private lineJoin: string;
  private dashArray: string;
  private lineCap: string;
  private lineJoinStyle: LineJoinStyle;
  private lineDashStyle: LineDashStyle;

  constructor(protected mouse: MousePositionService,
              protected undoRedoService: UndoRedoService) {
    super(mouse, undoRedoService);
    this.strokeWidth = DEFAULT_POLYLINE_WIDTH;
    this.currentElementsNumber = 0;
    this.markerDiameter = DEFAULT_POLYLINE_MARKER_DIAMETER;
    this.isMarkersActive = false;
    this.lineJoin = DEFAULT_LINEJOIN;
    this.dashArray = DEFAULT_DASHARRAY;
    this.lineCap = DEFAULT_LINECAP;
    this.lineJoinStyle = DEFAULT_LINEJOINSTYLE;
    this.lineDashStyle = DEFAULT_LINEDASHSTYLE;
    this.idPrefix = 'line';
  }

  set _lineJoinStyle(style: LineJoinStyle) {
    this.lineJoinStyle = style;
    switch (style) {
      case LineJoinStyle.WithPoints:
        this.isMarkersActive = true;
        this.lineJoin = DEFAULT_LINEJOIN;
        break;
      case LineJoinStyle.Angled:
        this.isMarkersActive = false;
        this.lineJoin = LINEJOIN_ANGLE;
        break;
      case LineJoinStyle.Round:
        this.isMarkersActive = false;
        this.lineJoin = LINEJOIN_ROUND;
        break;
      default:
        break;
    }
  }

  get _lineJoinStyle(): LineJoinStyle {
    return this.lineJoinStyle;
  }

  set _lineDashStyle(style: LineDashStyle) {
    this.lineDashStyle = style;
    switch (style) {
      case LineDashStyle.Continuous:
        this.dashArray = DEFAULT_DASHARRAY;
        this.lineCap = DEFAULT_LINECAP;
        break;
      case LineDashStyle.Dashed:
        this.dashArray = `${this.strokeWidth * 2}, ${this.strokeWidth}`;
        this.lineCap = STRAIGHT_ENDS;
        break;
      case LineDashStyle.Dotted:
        this.dashArray = `${DASHARRAY_DOT_SIZE}, ${this.strokeWidth * 2}`;
        this.lineCap = CURVY_ENDS;
        break;
      default:
        break;
    }
  }

  get _lineDashStyle(): LineDashStyle {
    return this.lineDashStyle;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
    // reload linedashstyle with new strokewidth
    this._lineDashStyle = this.lineDashStyle;

  }

  get _strokeWidth(): number {
    return this.strokeWidth;
  }

  set _markerDiameter(diameter: number) {
    this.markerDiameter = diameter;
  }

  get _markerDiameter(): number {
    return this.markerDiameter;
  }

  // Initializes the path
  createElement(mainColors: [string, string]) {
    if (!this.isMakingLine) {
      // Initiate the line
      const polyline: SVGElement = RendererSingleton.renderer.createElement('polyline', 'svg');
      RendererSingleton.renderer.setAttribute(polyline, 'id', `line${this.currentElementsNumber}`);
      RendererSingleton.renderer.setAttribute(polyline, 'stroke-width', `${this.strokeWidth}`);
      RendererSingleton.renderer.setAttribute(polyline, 'stroke-linecap', `${this.lineCap}`);
      RendererSingleton.renderer.setAttribute(polyline, 'stroke', `${mainColors[1]}`);
      RendererSingleton.renderer.setAttribute(polyline, 'stroke-dasharray', `${this.dashArray}`);
      RendererSingleton.renderer.setAttribute(polyline, 'fill', `none`);
      RendererSingleton.renderer.setAttribute(polyline, 'stroke-linejoin', `${this.lineJoin}`);
      RendererSingleton.renderer.setAttribute(polyline, 'points', `${this.xPos},${this.yPos}`);
      RendererSingleton.renderer.appendChild(RendererSingleton.canvas, polyline);

      this.currentElement = polyline;
      this.createMarkers(mainColors[1]);
      this.isMakingLine = true;
      this.currentPolylineStartX = this.xPos;
      this.currentPolylineStartY = this.yPos;

    } else {
      this.addPointToCurrentLine();
    }
  }

  addPointToCurrentLine() {
    if (!this.isMakingLine) {
      return;
    }
    const newPoint = ` ${this.xPos},${this.yPos}`;
    this.currentElement.setAttribute('points', this.currentElement.getAttribute('points') + newPoint);
  }

  updateElement(currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentPolyLine = RendererSingleton.canvas.children[currentChildPosition - 1];
      let pointsStr = currentPolyLine.getAttribute('points') as string;
      let indexLastPoint = pointsStr.lastIndexOf(' ');
      if (indexLastPoint === -1) {
        // There is only one point, add a second to enable the update
        this.addPointToCurrentLine();
        // There will be a splace since we added a point
        pointsStr = currentPolyLine.getAttribute('points') as string;
        indexLastPoint = pointsStr.lastIndexOf(' ');
      }
      const pointsWithoutLastStr = pointsStr.substring(0, indexLastPoint);
      const newPoints = `${pointsWithoutLastStr} ${this.xPos},${this.yPos}`;
      currentPolyLine.setAttribute('points', newPoints);
    }
  }

  finishElement(mouseEvent: MouseEvent) {
    if (mouseEvent.shiftKey) {
      this.finishAndLinkLineBlock();
    } else {
      this.finishLineBlock();
    }
    this.pushGeneratorCommand(this.currentElement);
  }
  finishLineBlock() {
    if (this.isMakingLine) {
      // delete the two last lines for double click
      this.deleteLine();
      this.deleteLine();
      this.currentElementsNumber += 1;
      this.isMakingLine = false;
    }
  }
  finishAndLinkLineBlock() {
    if (this.isMakingLine) {
      // delete the two last lines for double click
      this.deleteLine();
      this.deleteLine();
      const newPoint = ` ${this.currentPolylineStartX},${this.currentPolylineStartY}`;
      this.currentElement.setAttribute('points', this.currentElement.getAttribute('points') + newPoint);
      this.currentElementsNumber += 1;
      this.isMakingLine = false;
    }
  }
  deleteLineBlock(canvas: SVGElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentPolyLine = canvas.children[currentChildPosition - 1];
      currentPolyLine.remove();
      this.currentElementsNumber -= 1;
      this.isMakingLine = false;
    }
  }
  deleteLine() {
    if (this.isMakingLine) {
      const pointsStr = this.currentElement.getAttribute('points') as string;
      const indexLastPoint = pointsStr.lastIndexOf(' ');
      if (indexLastPoint === -1) {
        // Only one point, user never moved after creating the line
        return;
      }
      const pointsWithoutLastStr = pointsStr.substring(0, indexLastPoint);
      this.currentElement.setAttribute('points', pointsWithoutLastStr);
    }
  }

  // This function creates a marker tag with the color and the id of the polyline and returns a string for the URL
  createMarkers(color: string): SVGElement {
    const marker = RendererSingleton.renderer.createElement('marker', 'svg');
    const circle = RendererSingleton.renderer.createElement('circle', 'svg');

    RendererSingleton.renderer.setAttribute(circle, 'fill', color);
    RendererSingleton.renderer.setAttribute(circle, 'r', this.markerDiameter as unknown as string);
    RendererSingleton.renderer.setAttribute(circle, 'cy', this.markerDiameter as unknown as string);
    RendererSingleton.renderer.setAttribute(circle, 'cx', this.markerDiameter as unknown as string);
    RendererSingleton.renderer.setAttribute(marker, 'markerWidth', (this.markerDiameter * 2) as unknown as string);
    RendererSingleton.renderer.setAttribute(marker, 'markerHeight', (this.markerDiameter * 2) as unknown as string);
    RendererSingleton.renderer.setAttribute(marker, 'refX', this.markerDiameter as unknown as string);
    RendererSingleton.renderer.setAttribute(marker, 'refY', this.markerDiameter as unknown as string);
    RendererSingleton.renderer.setAttribute(marker, 'markerUnits', 'userSpaceOnUse');
    RendererSingleton.renderer.setProperty(marker, 'id', `line${this.currentElementsNumber}marker`);

    RendererSingleton.renderer.appendChild(marker, circle);
    const defs = RendererSingleton.renderer.selectRootElement('#definitions', true);
    const canvas = RendererSingleton.renderer.selectRootElement('#canvas', true);
    RendererSingleton.renderer.appendChild(defs, marker);
    if (this.isMarkersActive) {
      this.addMarkersToNewLine(marker, canvas);
    }
    return marker;
  }

  addMarkersToNewLine(markers: SVGElement, canvas: HTMLElement) {
    const markersAddress = `url(#${markers.id})`;
    RendererSingleton.renderer.setAttribute(this.currentElement, 'marker-start', markersAddress);
    RendererSingleton.renderer.setAttribute(this.currentElement, 'marker-mid', markersAddress);
    RendererSingleton.renderer.setAttribute(this.currentElement, 'marker-end', markersAddress);
  }
  // this function returns the markers element corresponding to a specific polyline so it can be modified
  findMarkerFromPolyline(polyline: SVGElement, defsElement: SVGElement): SVGElement {
    for (const child of [].slice.call(defsElement.children)) {
      const childCast = child as SVGElement;
      if (childCast.id === polyline.id + 'marker') {
        return childCast;
      }
    }
    // No marker was found for corresponding polyline, this should not happen as the marker is created with the polyline
    return new SVGElement();
  }
}
