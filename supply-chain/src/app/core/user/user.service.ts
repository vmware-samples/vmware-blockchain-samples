/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable } from '@angular/core';
import { randomElement } from '../../shared/utils';
import { User, UserRole } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // TODO: get User, including role, from back end service
  _currentUser: User     ;

  constructor() { }

  get currentUser(): User {
    if (! this._currentUser) {
      this._currentUser = new User();
      this._currentUser.role = UserRole.farmer;
    }
    return this._currentUser;
  }

  hasRole(...roles: UserRole[]): boolean {
    return this._currentUser && (roles.indexOf(this._currentUser.role) !== -1);
  }

  nextRole() {
    const roles = Object.values(UserRole);
    let nextRoleIndex = 1 + Object.values(UserRole).indexOf(this._currentUser.role);
    nextRoleIndex = (nextRoleIndex < roles.length) ? nextRoleIndex : 0;
    this._currentUser.role = roles[nextRoleIndex];
  }
}
