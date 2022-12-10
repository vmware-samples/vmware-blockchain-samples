import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';


import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { ConfigurationsComponent } from './configurations/configurations.component';
import { DappComponent } from './dapp/dapp.component';

@NgModule({
  declarations: [
    AppComponent,
    ConfigurationsComponent,
    DappComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    ClarityModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 
  
}
