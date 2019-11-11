import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ModalManagerSingleton } from './../modal-manager-singleton';

interface IShortcut {
    description: string;
    keys: string;
}

@Component({
    selector: 'app-user-manual-dialog',
    templateUrl: './user-manual-dialog.component.html',
    styleUrls: ['./user-manual-dialog.component.scss'],
})

export class UserManualDialogComponent {
    protected readonly DIALOG_TITLE = 'Manuel d\'instructions';
    protected readonly FILE_SHORTCUTS: IShortcut[] =
        [{ description: 'Créer un nouveau dessin', keys: 'Ctrl-O' },
        { description: 'Sauvegarder le dessin', keys: 'Ctrl-S' },
        { description: 'Voir la galerie de dessins', keys: 'Ctrl-G' },
        { description: 'Exporter le dessin', keys: 'Ctrl-E' }];

    protected readonly MANIPULATION_SHORTCUTS: IShortcut[] =
        [{ description: 'Couper la sélection', keys: 'Ctrl-X' },
        { description: 'Copier la sélection', keys: 'Ctrl-C' },
        { description: 'Coller la sélection ', keys: 'Ctrl-V' },
        { description: 'Dupliquer la sélection ', keys: 'Ctrl-D' },
        { description: 'Supprimer la sélection', keys: 'Supprimer' },
        { description: 'Tout sélectionner', keys: 'Ctrl-A' },
        { description: 'Annuler', keys: 'Ctrl-Z' },
        { description: 'Refaire', keys: 'Ctrl-Shift-Z' },
        ];
    protected readonly TOOL_SHORTCUTS: IShortcut[] =
        [{ description: 'Crayon', keys: 'C' },
        { description: 'Pinceau', keys: 'W' },
        { description: 'Plume', keys: 'P' },
        { description: 'Stylo ', keys: 'Y' },
        { description: 'Aérosol', keys: 'A' },
        { description: 'Rectangle', keys: '1' },
        { description: 'Ellipse', keys: '1' },
        { description: 'Polygone', keys: '3' },
        { description: 'Ligne', keys: 'L' },
        { description: 'Texte', keys: 'T' },
        { description: 'Applicateur de couleur ', keys: 'R' },
        { description: 'Sceau de peinture', keys: 'B' },
        { description: 'Efface', keys: 'E' },
        { description: 'Pipette', keys: 'I' },
        { description: 'Sélection', keys: 'S' },
        ];

    private modalManager = ModalManagerSingleton.getInstance();

    constructor(private dialogRef: MatDialogRef<UserManualDialogComponent>,
    ) {
        this.modalManager._isModalActive = true;
    }

    close(): void {
        this.dialogRef.close();
    }
}