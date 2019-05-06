/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable } from '@angular/core';
import { randomElement } from '../../shared/utils';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // TODO: get User, including role, from back end service
  public readonly roles = ['farmer', 'auditor', 'storage', 'distributor', 'super_market' ];
  _currentUser: User;

  constructor() { }

  get currentUser(): User {
    if (! this._currentUser) {
      this._currentUser = new User();
      this._currentUser.role = this.roles[0];
    }
    return this._currentUser;
  }

  hasRole(...roles: string[]): boolean {
    return this._currentUser && (roles.indexOf(this._currentUser.role) >= 0);
  }

  nextRole() {
    let nextRoleIndex = 1 + this.roles.indexOf(this._currentUser.role);
    nextRoleIndex = (nextRoleIndex < this.roles.length) ? nextRoleIndex : 0;
    this._currentUser.role = this.roles[nextRoleIndex];
  }
}
