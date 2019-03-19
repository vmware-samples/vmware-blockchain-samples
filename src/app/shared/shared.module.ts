/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../core/user/user.service';
import { ToggleRadioGroupComponent } from './toggle-radio-group/toggle-radio-group.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  declarations: [
    ToggleRadioGroupComponent
  ],
  exports: [
    ToggleRadioGroupComponent
  ]
})

export class SharedModule { }
