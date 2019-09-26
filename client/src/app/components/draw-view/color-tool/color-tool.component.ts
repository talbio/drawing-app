import { Component, Input, OnInit  } from '@angular/core';
import { MatDialog } from '@angular/material';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ColorPickerDialogComponent } from '../../modals/color-picker-dialog/color-picker-dialog.component';

@Component({
  selector: 'app-color-tool',
  templateUrl: './color-tool.component.html',
  styleUrls: ['./color-tool.component.scss'],
})
export class ColorToolComponent implements OnInit {
  @Input()
    color: string;

  primaryColor: string;
  secondaryColor: string;
  primaryTransparency: number;
  secondaryTransparency: number;

  constructor( private storage: StorageService, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.primaryColor = this.assignPrimaryColor();
    this.secondaryColor = this.assignSecondaryColor();
    this.primaryTransparency = this.secondaryTransparency = 1;
  }

  openDialog(): void {
    this.dialog.open( ColorPickerDialogComponent, {
      height: '300px',
      width: '500px',
    });
  }

  assignPrimaryColor(): string {
    const color = this.storage.getPrimaryColor();
    if (color !== 'empty') {
      return this.storage.getPrimaryColor();
    }
    this.storage.setPrimaryColor('#ffffffff');
    return '#ffffffff';
  }

  assignSecondaryColor(): string {
    const color = this.storage.getSecondaryColor();
    if (color !== 'empty') {
      return this.storage.getSecondaryColor();
    }
    this.storage.setSecondaryColor('#000000ff');
    return '#000000ff';
  }

  switchMainColors(): void {
    const temp = this.primaryColor;
    this.primaryColor = this.secondaryColor;
    this.secondaryColor = temp;
    this.storage.setPrimaryColor(this.primaryColor);
    this.storage.setSecondaryColor(this.secondaryColor);
  }

  selectColor(color: string): void {
    this.primaryColor = color;
    this.storage.setPrimaryColor(color);
  }

  modifyPrimaryColorTransparency(transparency: number){
    this.primaryTransparency = transparency;
  }

}
