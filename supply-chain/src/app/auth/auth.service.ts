/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import Web3 from 'web3';

import { Observable, of, bindCallback, throwError } from 'rxjs';
import { map, flatMap, retryWhen, catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn = false;
  // store the URL so we can redirect after logging in
  redirectUrl: string;

  constructor(private http: HttpClient, private router: Router) { }

  loginServerSide(username: string, password: string): Observable<any> {
    return this.http.post('/api/authenticate',
      { username: username, password: password });
  }

  loginLocally(refreshToken?: string, blockchainId?: string): Observable<boolean> {
    if (blockchainId) {
      localStorage.setItem('blockchainId', blockchainId);
    }

    return this.refreshAccessToken(refreshToken);
  }

  completeAuth(accessToken: string): Observable<boolean> {
    const provider = this.getVmwareBlockChainProvider(accessToken);
    const web3 = new Web3(provider);

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
        localStorage.setItem('Refresh', refreshToken);
        return isLoggedIn;
      }),
      catchError((error) => {
        if (error && error.status === 400) {
          this.router.navigate(['/login']);
        }
        return of(false);
      }),
    );
  }

  logout(): void {
    this.isLoggedIn = false;
    localStorage.removeItem('Refresh');
    localStorage.removeItem('Access');
    localStorage.removeItem('blockchainId');
  }

  loginCheck(): Promise<boolean> {
    return this.loginLocally().toPromise();
  }

  getAuthHeader(accessToken?: string): any {
    if (!accessToken) {
      accessToken = localStorage.getItem('Access');
    }

    return {
      name: 'Authorization',
      value: `Bearer ${accessToken}`,
    };
  }

  getVmwareBlockChainProvider(accessToken?: string): any {
    if (!accessToken) {
      accessToken = localStorage.getItem('Access');
    }

    const blockchainId = localStorage.getItem('blockchainId');
    const header = { 'Authorization': `Bearer ${accessToken}` };

    return new Web3.providers.HttpProvider(
      `${environment.path}/api/blockchains/${blockchainId}/concord/eth`,
      {headers: [this.getAuthHeader(accessToken)]}
    );
  }

}
