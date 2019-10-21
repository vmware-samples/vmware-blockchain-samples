/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as HttpHeaderProvider from 'httpheaderprovider';
import * as Web3 from 'web3';

import { Observable, of, bindCallback, throwError } from 'rxjs';
import { map, flatMap, retryWhen, } from 'rxjs/operators';

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

  loginLocally(refreshToken?: string): Observable<boolean> {

    return this.refreshAccessToken(refreshToken);
  }

  completeAuth(accessToken: string): Observable<boolean> {
    const provider = this.getVmwareBlockChainProvider(accessToken);
    const web3 = new Web3();
    web3.setProvider(provider);

    const getBlock = bindCallback(web3.eth.getBlock);

    // @ts-ignore
    return getBlock(0)
      .pipe(
        map(res => {
          localStorage.setItem('Access', accessToken);
          if (res[0]) {
            return false;
          } else if (res[1] && res[1].number === 0) {
            this.isLoggedIn = true;
            return true;
          }
        })
      );

  }

  refreshAccessToken(refreshToken?: string): Observable<boolean> {
    if (!refreshToken) {
      refreshToken = localStorage.getItem('Refresh');
    }

    return this.http.post(
      'https://console-stg.cloud.vmware.com/csp/gateway/am/api/auth/api-tokens/authorize',
      `refresh_token=${refreshToken}`,
      { headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'accept': 'application/json'
        }
      }
    ).pipe(
      map(authResponse => authResponse['access_token']),
      flatMap((token) => this.completeAuth(token)),
      map(isLoggedIn => {
        if (isLoggedIn) {
          localStorage.setItem('Refresh', refreshToken);
        }
        return isLoggedIn;
      })
    );
  }

  logout(): void {
    this.isLoggedIn = false;
    localStorage.removeItem('Refresh');
    localStorage.removeItem('Access');
  }

  loginCheck(): Promise<boolean> {
    return this.loginLocally().toPromise();
  }

  getAuthHeader(accessToken?: string): any {
    if (!accessToken) {
      accessToken = localStorage.getItem('Access');
    }

    return {
      'Authorization': `Bearer ${accessToken}`,
    };
  }

  getVmwareBlockChainProvider(accessToken?: string): HttpHeaderProvider {
    if (!accessToken) {
      accessToken = localStorage.getItem('Access');
    }

    const header = { 'Authorization': `Bearer ${accessToken}` };
    return new HttpHeaderProvider(`${environment.path}/concord/eth`, this.getAuthHeader(accessToken));
  }

}
