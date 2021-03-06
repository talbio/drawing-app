import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { OpenDrawingDialogComponent } from 'src/app/components/modals/open-drawing-dialog/open-drawing-dialog.component';
import { UserManualDialogComponent } from 'src/app/components/modals/user-manual-dialog/user-manual-dialog.component';
import {ColorPickerDialogComponent} from '../../components/modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';
import {CreateDrawingDialogComponent} from '../../components/modals/create-drawing-dialog/create-drawing-dialog.component';
import {SaveDrawingDialogComponent} from '../../components/modals/save-drawing-dialog/save-drawing-dialog.component';
import {CreateDrawingFormValues} from '../../data-structures/create-drawing-form-values';
import {RendererSingleton} from '../renderer-singleton';
import {ColorService} from '../tools/color/color.service';
import {ToolManagerService} from '../tools/tool-manager/tool-manager.service';

const USER_MANUAL_WIDTH = '700px';

export enum Color {
  primaryColor,
  secondaryColor,
}

@Injectable({
  providedIn: 'root',
})
export class ModalManagerService {

  constructor(private dialog: MatDialog,
              private toolManager: ToolManagerService,
              protected colorService: ColorService) {
  }

  showCreateDrawingDialog(): void {
    this.toolManager.removeSelectorBoundingRect();
    const dialogRef = this.dialog.open(CreateDrawingDialogComponent, {
      autoFocus: false,
      data: {drawingNonEmpty: this.toolManager.drawingNonEmpty()},
    });
    dialogRef.afterClosed().subscribe((formValues: CreateDrawingFormValues) => {
      if (formValues) {
        RendererSingleton.renderer.setAttribute(RendererSingleton.canvas, 'width', formValues.width.toString());
        RendererSingleton.renderer.setAttribute(RendererSingleton.canvas, 'height', formValues.height.toString());
        RendererSingleton.renderer.setStyle(RendererSingleton.canvas, 'background-color', formValues.color.toString());
      }
    });
  }

  showColorPickerDialog(color: Color): void {
    this.toolManager.removeSelectorBoundingRect();
    const dialogRef = this.dialog.open(ColorPickerDialogComponent,
      {
        data: { color: color === Color.primaryColor ? this.colorService.getPrimaryColor() : this.colorService.getSecondaryColor() },
      });
    dialogRef.afterClosed().subscribe((colorSelectedByUser) => {
      if (colorSelectedByUser) {
        this.colorService.addToTopTenColors(colorSelectedByUser);
        if (color === Color.primaryColor) {
          this.colorService.primaryColor = colorSelectedByUser;
          this.colorService.setPrimaryColor(colorSelectedByUser);
        } else {
          this.colorService.secondaryColor = colorSelectedByUser;
          this.colorService.setSecondaryColor(colorSelectedByUser);
        }
      }
    });
  }

  showSaveDrawingDialog(): void {
    this.toolManager.removeSelectorBoundingRect();
    this.dialog.open(SaveDrawingDialogComponent, {
      autoFocus: false,
      data: {},
    });
  }

  showOpenDrawingDialog(): void {
    this.toolManager.removeSelectorBoundingRect();
    this.dialog.open(OpenDrawingDialogComponent, {
      autoFocus: false,
      data: {drawingNonEmpty: this.toolManager.drawingNonEmpty()},
    });
  }

  showUserManualDialog(): void {
    this.toolManager.removeSelectorBoundingRect();
    this.dialog.open(UserManualDialogComponent, {
       width: USER_MANUAL_WIDTH,
      data: {},
    });
  }

}
