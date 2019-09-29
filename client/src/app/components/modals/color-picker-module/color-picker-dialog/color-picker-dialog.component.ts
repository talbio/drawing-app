import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ColorService } from 'src/app/services/tools/color/color.service';

@Component({
  selector: 'app-color-picker-dialog',
  templateUrl: './color-picker-dialog.component.html',
  styleUrls: ['./color-picker-dialog.component.scss'],
})

export class ColorPickerDialogComponent {

  private opacity: number;
  private selectedColor: string;
  private hue: string;

  constructor(private dialogRef: MatDialogRef<ColorPickerDialogComponent>, protected colorService: ColorService) { }

  close(): void {
    this.dialogRef.close();
  }

  set _opacity(opacity: number) {
    if (0 <= opacity && opacity <= 1) {
      this.opacity = opacity;
    }
  }

  get _opacity(): number {
    return this.opacity;
  }

  get _selectedColor(): string {
    return this.selectedColor;
  }

  get _hue(): string {
    return this.hue;
  }

  onColorSelected(selectedColor: string) {
    this.selectedColor = selectedColor;
  }

  onHuePropertySelected(hue: string) {
    this.hue = hue;
  }

  submit(color: string, opacity: number) {

    const modifiedColor = this.modifyOpacity(color, opacity)

    this.dialogRef.close(modifiedColor);

  }


  modifyOpacity(colorSelected: string, opacity: number): string {
    if (colorSelected) {
      colorSelected = colorSelected.slice(0, -2) + opacity + ')';
      return colorSelected;
    }
    return colorSelected;
  }
}
