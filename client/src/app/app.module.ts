import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {BrowserModule} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AppComponent} from './components/app/app.component';
import { LateralBarComponent } from './components/draw-view/lateral-bar/lateral-bar.component';
import { WorkZoneComponent } from './components/draw-view/work-zone/work-zone.component';

@NgModule({
  declarations: [
    AppComponent,
    WorkZoneComponent,
    LateralBarComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSidenavModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
