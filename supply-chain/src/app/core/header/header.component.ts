/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../user/user';
import { UserService } from '../user/user.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'vmw-sc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  currentUser: User;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.currentUser = userService.currentUser;
  }

  nextRole() {
    this.userService.nextRole();
  }

  logOut() {
    this.authService.logout();
    this.router.navigate(['login']);
  }

}
