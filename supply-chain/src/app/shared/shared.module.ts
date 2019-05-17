/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClarityModule, ClrButtonModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../core/user/user.service';
import { SimpleConfirmationComponent } from './simple-confirmation/simple-confirmation.component';
import { ToggleRadioGroupComponent } from './toggle-radio-group/toggle-radio-group.component';
import { ErrorAlertService } from './global-alert.service';
import { NotifierService } from './notifier.service';

@NgModule({
  imports: [
    ClarityModule,
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  declarations: [
    SimpleConfirmationComponent,
    ToggleRadioGroupComponent
  ],
  providers: [
   ErrorAlertService,
   NotifierService
  ],
  exports: [
    CommonModule,
    ClarityModule,
    FormsModule,
    TranslateModule,
    RouterModule,
    SimpleConfirmationComponent,
    ToggleRadioGroupComponent
  ]
})

export class SharedModule { }
