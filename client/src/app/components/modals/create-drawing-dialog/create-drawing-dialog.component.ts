import {Component, HostListener, Inject, OnInit} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {GiveUpChangesDialogComponent} from '../give-up-changes-dialog/give-up-changes-dialog.component';

export interface DialogData {
  drawingNonEmpty: boolean;
  height: number;
  width: number;
}

@Component({
  selector: 'app-create-drawing-dialog',
  templateUrl: './create-drawing-dialog.component.html',
  styleUrls: ['./create-drawing-dialog.component.scss'],
})
export class CreateDrawingDialogComponent implements OnInit {
  protected drawingForm: FormGroup;
  protected dialogTitle = 'Créer un nouveau dessin';
  protected whiteColor = '#FFFFFF';

  constructor(private dialogRef: MatDialogRef<CreateDrawingDialogComponent>,
              private formBuilder: FormBuilder,
              private dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) private data: DialogData) {
  }

  ngOnInit() {
    this.drawingForm = this.formBuilder.group({
      height: [this.data.height, [
        Validators.required,
        Validators.min(0),
        Validators.pattern('^[0-9]*$'),
      ]],
      width: [this.data.width, [
        Validators.required,
        Validators.min(0),
        Validators.pattern('^[0-9]*$'),
      ]],
      color: [this.whiteColor, [
        Validators.required,
        Validators.pattern('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'),
      ]],
    });
  }

  get height(): AbstractControl {
    // we are sure that this is non null, (see drawingForm declaration)
    // tslint:disable-next-line:no-non-null-assertion
    return this.drawingForm.get('height')!;
  }

  get width(): AbstractControl {
    // we are sure that this is non null, (see drawingForm declaration)
    // tslint:disable-next-line:no-non-null-assertion
    return this.drawingForm.get('width')!;
  }

  get color(): AbstractControl {
    // we are sure that this is non null, (see drawingForm declaration)
    // tslint:disable-next-line:no-non-null-assertion
    return this.drawingForm.get('color')!;
  }

  set color(colorValue) {
    this.color.setValue(colorValue);
  }

  getErrorMsg(errorType: string): string {
    switch (errorType) {
      case 'posNumber': {
        return 'Nombre positif requis!';
      }
      case 'hexValue': {
        return 'La couleur doit être une valeur hexadécimale !';
      }
      default: {
        return '';
      }
    }
  }

  clear(formControlName: AbstractControl): void {
    formControlName.setValue('');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (event.target !== null) {
      if (!this.height.dirty) {
        // innerHeight property exists for object window
        // @ts-ignore
        this.height.setValue(event.target.innerHeight);
      }
      if (!this.width.dirty) {
        // innerWidth property exists for object window
        // @ts-ignore
        this.width.setValue(event.target.innerWidth);
      }
    }
  }

  close() {
    this.dialogRef.close();
  }

  async onSubmit() {
    // TODO: send the attributes of the new drawing to a service which will create the drawing
    if (this.data.drawingNonEmpty) {
      await this.openConfirmGiveUpChangesDialog().then((confirm) => {
        if (confirm) {
          this.dialogRef.close(this.drawingForm.value);
        }
      });
    }
  }

  private async openConfirmGiveUpChangesDialog(): Promise<boolean> {
    let confirm = false;
    const dialogRef = this.dialog.open(GiveUpChangesDialogComponent);
    await dialogRef.afterClosed().toPromise().then((confirmResult) => confirm = confirmResult);
    return confirm;
  }

}