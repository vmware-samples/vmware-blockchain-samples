/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component } from '@angular/core';
import { UserService } from '../user/user.service';

@Component({
  selector: 'vmw-sc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  currentRole: string;

  constructor(userService: UserService) {
    this.currentRole = userService.currentUser.role;
  }

}
