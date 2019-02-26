/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from './core/user/user.service';

@Component({
  selector: 'vmw-sc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  currentRole: string;

  constructor(translate: TranslateService,
              userService: UserService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('en');
    this.currentRole = userService.currentUser.role;
  }
}
