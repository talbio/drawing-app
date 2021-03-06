import {COMMA, ENTER, SPACE} from '@angular/cdk/keycodes';
import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {MatChipInputEvent} from '@angular/material/chips';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { Observable } from 'rxjs';
import { DRAWING_KEYS_COUNT } from 'src/app/data-structures/constants';
import { LocalOpenError } from 'src/app/data-structures/custom-errors';
import { ToolManagerService } from 'src/app/services/tools/tool-manager/tool-manager.service';
import { Drawing } from '../../../../../../common/communication/Drawing';
import {DrawingsService} from '../../../services/drawings/drawings.service';
import {GiveUpChangesDialogComponent} from '../give-up-changes-dialog/give-up-changes-dialog.component';
import { ModalManagerSingleton } from '../modal-manager-singleton';
import { ClipboardService } from './../../../services/tools/clipboard/clipboard.service';
import { GridTogglerService } from './../../../services/tools/grid/grid-toggler.service';
import { UndoRedoService } from './../../../services/undo-redo/undo-redo.service';

export interface DialogData {
  drawingNonEmpty: boolean;
}

@Component({
  selector: 'app-open-list-drawings-server',
  templateUrl: './open-drawing-dialog.component.html',
  styleUrls: ['./open-drawing-dialog.component.scss'],
})
export class OpenDrawingDialogComponent implements OnInit {

  protected readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
  protected readonly LOCAL_OPEN_DRAWING_SUCCEEDED_MSG = `Votre dessin a bien été chargé!`;
  protected readonly SERVER_NOT_FOUND_MSG = `L'accès au serveur est impossible. Veuillez ouvrir des dessins sauvegardés localement.`;

  protected selectedTags: string[];
  protected drawings: Drawing[];
  protected isLoading: boolean;

  private modalManagerSingleton = ModalManagerSingleton.getInstance();

  constructor(private dialogRef: MatDialogRef<OpenDrawingDialogComponent>,
              private toolManager: ToolManagerService,
              private drawingsService: DrawingsService,
              private dialog: MatDialog,
              private renderer: Renderer2,
              private notifier: NotifierService,
              private gridManager: GridTogglerService,
              private clipboard: ClipboardService,
              private undoRedo: UndoRedoService,
              @Inject(MAT_DIALOG_DATA) private data: DialogData) {

    this.modalManagerSingleton._isModalActive = true;
    this.drawings = [];
    this.selectedTags = [];
    this.afterClose();
    this.isLoading = false;
  }

  ngOnInit() {
    this.isLoading = true;
    this.drawingsService.httpGetDrawings().toPromise().then( (drawings: Drawing[]) => {
      if (drawings) {
        this.drawings = drawings;
      } else {
        this.notifier.notify('error', this.SERVER_NOT_FOUND_MSG);
      }
      this.isLoading = false;
    });
  }

  addSelectedTag(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.selectedTags.push(value.trim());
    }

    if (input) {
      input.value = '';
    }
  }

  removeSelectedTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    }
  }

  async openDrawing(drawing: Drawing): Promise<void> {
    if (this.data.drawingNonEmpty) {
      await this.openGiveUpChangesDialog()
        .then( (confirm: boolean) => {
          if (confirm) {
            this.loadDrawingAndCloseDialog(drawing);
            this.setupNewDrawing();
          }
        });
    } else {
      this.loadDrawingAndCloseDialog(drawing);
      this.setupNewDrawing();
    }
  }

  async deleteDrawing(drawing: Drawing): Promise<void> {
    await this.drawingsService.httpDeleteDrawing(drawing.id).then( () => {
      const index = this.drawings.indexOf(drawing);
      if (index > -1) {
        this.drawings.splice(index, 1);
      }
    });
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected setMiniature(index: number): void {
    const miniature = this.renderer.selectRootElement('#miniature' + index);
    this.renderer.setAttribute(miniature, 'src', 'data:image/svg+xml;base64,' + window.btoa(this.drawings[index].miniature));
  }

  private loadDrawingAndCloseDialog(drawing: Drawing) {
    this.toolManager.deleteAllDrawings();
    const svgCanvas: SVGElement = this.renderer.selectRootElement('#canvas', true);
    svgCanvas.innerHTML = drawing.svgElements;
    this.renderer.setAttribute(svgCanvas, 'width', drawing.canvasWidth as unknown as string);
    this.renderer.setAttribute(svgCanvas, 'height', drawing.canvasHeight as unknown as string);
    this.toolManager.synchronizeAllCounters();
    this.close();
  }

  private async openGiveUpChangesDialog(): Promise<boolean> {
    let confirm = false;
    const dialogRef = this.dialog.open(GiveUpChangesDialogComponent);
    await dialogRef.afterClosed().toPromise().then((confirmResult) => confirm = confirmResult);
    return confirm;
  }
  openLocalDrawing(fileInput: HTMLInputElement) {
    const fileList = fileInput.files as FileList;
    const fileToOpen = fileList[0] as File;
    try {
      this.validateFileType(fileToOpen, 'application/json');
    } catch (err) {
      this.notifier.notify('error', err.message);
      return;
    }
    this.loadFile(fileToOpen).subscribe((fileContent) => {
      const loadedDrawing = this.makeDrawingFromJSONString(fileContent as string);
      this.openDrawing(loadedDrawing);
      this.notifier.notify('success', this.LOCAL_OPEN_DRAWING_SUCCEEDED_MSG);
    });
  }
  // solution from Anes Belfodil on Teams
  loadFile(file: File) {
    return new Observable((subscriber) => {
      const fileLoader = new FileReader();
      fileLoader.onload = () => {
        if (fileLoader.result != null) {
          try {
            this.validateJSONDrawing(fileLoader.result as string);
            subscriber.next(fileLoader.result);
            subscriber.complete();
          } catch (err) {
            subscriber.error(err);
            this.notifier.notify('error', err.message);
          }
        }
      };
      fileLoader.onerror = (error) => {
        subscriber.error(error);
      };
      fileLoader.readAsText(file);
    });
  }
  // This function verifies that the file is of the correct type
  validateFileType(file: File, expectedFileType: string): void {
    if (file.type !== expectedFileType) {
      throw new LocalOpenError(`Type de fichier invalide! Le type devrait être 'application.json', mais il est en fait '${file.type}'.`);
    }
  }
  // This function tests several conditions for the JSON and throws the appropriate errors if the file is invalid.
  validateJSONDrawing(jsonContent: string): void {
    // Check if file is of type JSON
    if (this.JSONIsEmpty(jsonContent)) {
      throw new LocalOpenError('Le fichier est vide!');
    }
    if (this.JSONIsNotADrawing(jsonContent)) {
      throw new LocalOpenError(`Le fichier n'est pas d'un format valide! Veuillez utiliser un objet créé par l'application.`);
    }
  }
  JSONIsEmpty(jsonContent: string): boolean {
    if (jsonContent.length === 0) {
      return true;
    } else {
      return false;
    }
  }
  JSONIsNotADrawing(jsonContent: string): boolean {
    const jsonObject = JSON.parse(jsonContent);
    if (!jsonObject.hasOwnProperty('id')
    || !jsonObject.hasOwnProperty('name')
    || !jsonObject.hasOwnProperty('svgElements')
    || !jsonObject.hasOwnProperty('tags')
    || !jsonObject.hasOwnProperty('miniature')
    || !jsonObject.hasOwnProperty('canvasWidth')
    || !jsonObject.hasOwnProperty('canvasHeight')
    || Object.keys(jsonObject).length !== DRAWING_KEYS_COUNT) {
      return true;
    } else {
      return false;
    }
  }
  makeDrawingFromJSONString(jsonString: string): Drawing {
    const jsonObject = JSON.parse(jsonString);
    const jsonDrawing: Drawing = {
      id: jsonObject.id,
      name: jsonObject.name,
      svgElements: jsonObject.svgElements,
      tags: jsonObject.tags,
      miniature: jsonObject.miniature,
      canvasWidth: jsonObject.canvasWidth,
      canvasHeight: jsonObject.canvasHeight,
    };
    return jsonDrawing;
  }
  linkGrid(): void {
    this.gridManager._grid = this.renderer.selectRootElement('#backgroundGrid', true);
    this.gridManager._gridPattern = this.renderer.selectRootElement('#backgroundGridPattern', true);
  }
  setupNewDrawing(): void {
    // Empty the clipboard
    this.clipboard.reset();
    // Empty the undo and redo commands
    this.undoRedo.reset();
    // Fix the link to the grid
    this.linkGrid();
  }
  afterClose(): void {
    this.dialogRef.afterClosed().subscribe(() => {
      this.modalManagerSingleton._isModalActive = false;
    });
  }
}
