/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as HttpHeaderProvider from 'httpheaderprovider';
import * as Web3 from 'web3';

import { Observable, of, bindCallback } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn = false;
  // store the URL so we can redirect after logging in
  redirectUrl: string;

  constructor(private http: HttpClient) { }

  loginServerSide(username: string, password: string): Observable<any> {
    return this.http.post('/api/authenticate',
      { username: username, password: password });
  }

  loginLocally(username?: string, password?: string): Observable<boolean> {
    let authKey;
    if (!username) {
      authKey = localStorage.getItem('BA');
    }  else {
      authKey = 'Basic ' + btoa(username + ':' + password);
    }
    const provider = this.getVmwareBlockChainProvider(authKey);
    const web3 = new Web3();
    web3.setProvider(provider);

    const getBlock = bindCallback(web3.eth.getBlock);

    // @ts-ignore
    return getBlock(0)
      .pipe(
        map(res => {
          localStorage.setItem('BA', authKey);
          if (res[0]) {
            return false;
          } else if (res[1] && res[1].number === 0) {
            this.isLoggedIn = true;

            return true;
          }
        })
      );
  }

  logout(): void {
    this.isLoggedIn = false;
    localStorage.removeItem('BA');
  }

  loginCheck(): Promise<boolean> {
    return this.loginLocally().toPromise();
  }

  getAuthHeader(authKey?: string): any {
    if (!authKey) {
      authKey = localStorage.getItem('BA');
    }
    return {
      'authorization': authKey,
      'X-Requested-With': 'XMLHttpRequest' // Suppress basic auth pop up
    };
  }

  getVmwareBlockChainProvider(authKey?: string): HttpHeaderProvider {
    return new HttpHeaderProvider(`${environment.path}/concord/eth`, this.getAuthHeader(authKey));
  }

}
