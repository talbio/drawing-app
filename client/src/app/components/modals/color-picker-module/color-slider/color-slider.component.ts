import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
const MIN_HUE_X_VALUE = 3;
const MAX_HUE_X_VALUE = 16;
const MIN_HUE_Y_VALUE = 0;
const MAX_HUE_Y_VALUE = 149;
@Component({
    selector: 'app-color-slider',
    templateUrl: './color-slider.component.html',
    styleUrls: ['./color-slider.component.scss'],
  })

  export class ColorSliderComponent implements AfterViewInit {
    @ViewChild('colorSliderCanvas', {static: false})
    canvas: ElementRef<HTMLCanvasElement>;

    @Output()
    huePropertySelected: EventEmitter<string> = new EventEmitter();

    private ctx: CanvasRenderingContext2D;
    private mousedown = false;
    private selectedHeight: number;

    ngAfterViewInit() {
      this.draw();
    }

    draw() {
      if (!this.ctx) {
        this.ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
      }
      const width = this.canvas.nativeElement.width;
      const height = this.canvas.nativeElement.height;

      this.ctx.clearRect(0, 0, width, height);

      const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
      gradient.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
      gradient.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
      gradient.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
      gradient.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
      gradient.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');

      this.ctx.beginPath();
      this.ctx.rect(0, 0, width, height);

      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      this.ctx.closePath();

      if (this.selectedHeight) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 5;
        this.ctx.rect(0, this.selectedHeight - 5, width, 10);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
      this.mousedown = false;
    }

    onMouseDown(event: MouseEvent) {
      this.mousedown = true;
      this.selectedHeight = event.offsetY;
      this.draw();
      this.emitColor(event.offsetX, event.offsetY);
    }

    onMouseMove(event: MouseEvent) {
      if (this.mousedown) {
        this.selectedHeight = event.offsetY;
        this.draw();
        this.emitColor(event.offsetX, event.offsetY);
      }
    }

    emitColor(x: number, y: number) {
      const rgbaColor = this.getColorAtPosition(x, y);
      this.huePropertySelected.emit(rgbaColor);
    }

    getColorAtPosition(x: number, y: number) {
      // make sure the values are within maximal and minimal bounds
      x = Math.max(MIN_HUE_X_VALUE, Math.min(x, MAX_HUE_X_VALUE));
      y = Math.max(MIN_HUE_Y_VALUE, Math.min(y, MAX_HUE_Y_VALUE));
      const imageData = this.ctx.getImageData(x, y, 1, 1).data;
      return 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
    }
  }
