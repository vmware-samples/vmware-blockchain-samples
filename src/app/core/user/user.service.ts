/*
 * Copyright 2019 VMware, all rights reserved.
 */

import { Injectable } from '@angular/core';
import { User } from './user';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    // TODO: get User, including role, from back end service
    readonly roles = ['auditor', 'farmer', 'distributor', 'storage' ];
    _currentUser: User;

    constructor() { }

    get currentUser(): User {
        if (! this._currentUser) {
            this._currentUser = new User();
            this._currentUser.role = this.roles[Math.floor(Math.random() * this.roles.length)];
        }
        return this._currentUser;
    }
}
