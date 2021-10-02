/*
 * Copyright 2019-2020 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { BlockchainType } from '../core/blockchain/blockchain';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
    const url: string = state.url;

    return await this.checkLogin(url);
  }

  async checkLogin(url: string): Promise<boolean> {
    // Don't need to login with ganache
    if (environment.blockchainType === BlockchainType.ganache || BlockchainType.concord) { return true; }
    if (this.authService.isLoggedIn) { return true; }
    if (await this.authService.loginCheck()) { return true; }

    // Store the attempted URL for redirecting
    this.authService.redirectUrl = url;

    // Navigate to the login page with extras
    this.router.navigate(['/login']);
    return false;
  }
}
