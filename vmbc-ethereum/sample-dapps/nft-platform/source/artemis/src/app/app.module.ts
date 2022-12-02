import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CdsModule } from '@cds/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DigitalArtsComponent } from './routes/digital-arts/digital-arts.component';
import { DigitalArtsGridComponent } from './routes/digital-arts/digital-arts-grid/digital-arts-grid.component';
import { DigitalArtsDetailsComponent } from './routes/digital-arts/digital-arts-details/digital-arts-details.component';

@NgModule({
  declarations: [
    AppComponent,

    DigitalArtsComponent,
    DigitalArtsGridComponent,
    DigitalArtsDetailsComponent,
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    ClarityModule,
    CdsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}


