
import {PortalModule} from '@angular/cdk/portal';
import {HttpClientModule} from '@angular/common/http';
import {NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule } from '@angular/material';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSliderModule} from '@angular/material/slider';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AppComponent } from './components/app/app.component';
import { ColorToolComponent } from './components/main-view/color-tool/color-tool.component';
import { DrawingViewComponent } from './components/main-view/drawing-view/drawing-view.component';
import { LateralBarComponent } from './components/main-view/lateral-bar/lateral-bar.component';
import { ToolsAttributesComponent } from './components/main-view/tools-attributes/tools-attributes.component';
import { WorkZoneComponent } from './components/main-view/work-zone/work-zone.component';
import { ColorPaletteComponent } from './components/modals/color-picker-module/color-palette/color-palette.component';
import { ColorPickerDialogComponent } from './components/modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';
import { ColorSliderComponent } from './components/modals/color-picker-module/color-slider/color-slider.component';
import { LastTenColorsComponent } from './components/modals/color-picker-module/last-ten-colors/last-ten-colors.component';
import { CreateDrawingDialogComponent } from './components/modals/create-drawing-dialog/create-drawing-dialog.component';
import { GiveUpChangesDialogComponent } from './components/modals/give-up-changes-dialog/give-up-changes-dialog.component';
import { WelcomeModalComponent } from './components/modals/welcome-modal/welcome-modal.component';

import { StorageService } from './services/storage/storage.service';
import { BrushGeneratorService } from './services/tools/brush-generator/brush-generator.service';
import { ColorApplicatorService } from './services/tools/color-applicator/color-applicator.service';
import { ColorService } from './services/tools/color/color.service';
import { PencilGeneratorService } from './services/tools/pencil-generator/pencil-generator.service';
import { RectangleGeneratorService } from './services/tools/rectangle-generator/rectangle-generator.service';
import { ToolManagerService } from './services/tools/tool-manager/tool-manager.service';
import { ToolSelectorService } from './services/tools/tool-selector/tool-selector.service';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeModalComponent,
    CreateDrawingDialogComponent,
    WorkZoneComponent,
    DrawingViewComponent,
    WelcomeModalComponent,
    ColorToolComponent,
    ColorPaletteComponent,
    ColorSliderComponent,
    GiveUpChangesDialogComponent,
    ToolsAttributesComponent,
    LateralBarComponent,
    ColorPickerDialogComponent,
    LastTenColorsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatDialogModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatTooltipModule,
    MatToolbarModule,
    MatSliderModule,
    MatCardModule,
    PortalModule,
    MatSelectModule,
    MatIconModule,

  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'legacy' } },
    StorageService,
    RectangleGeneratorService,
    ToolManagerService,
    StorageService,
    PencilGeneratorService,
    ToolSelectorService,
    BrushGeneratorService,
    ColorApplicatorService,
    ColorService,
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ColorToolComponent,
    CreateDrawingDialogComponent,
    GiveUpChangesDialogComponent,
    ToolsAttributesComponent,
    ColorPickerDialogComponent,
  ],
})
export class AppModule {
}
