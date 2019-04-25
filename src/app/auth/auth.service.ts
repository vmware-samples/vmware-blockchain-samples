/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as HttpHeaderProvider from 'httpheaderprovider';
import * as HDWalletProvider from 'truffle-hdwallet-provider';
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
      console.log("Auth key from local");
      authKey = localStorage.getItem('BA');
    }  else {
      console.log("Auth key being built");
      authKey = 'Basic ' + btoa(username + ':' + password);
    }
    console.log("Login locally - getting blockchain provider");
    const provider = this.getVmwareBlockChainProvider(authKey);
    console.log("Got blockchain provider.");
    const web3 = new Web3();
    web3.setProvider(provider);

    const getBlock = bindCallback(web3.eth.getBlock);
    console.log("Get block?");
    // @ts-ignore
    return getBlock(0)
      .pipe(
        map(res => {
          console.log("Get block response");
          console.log(res);
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

  getVmwareBlockChainProvider(authKey?: string) {
    console.log("getVmwareBlockChainProvider()");
    if (!authKey) {
      console.log("Auth key from local storage?");
      authKey = localStorage.getItem('BA');
    }
    const mnemonic = "birth equip will assume kick skull elbow price general wage canoe ivory";
    const header = {
      'authorization': authKey,
      'X-Requested-With': 'XMLHttpRequest' // Suppress basic auth pop up
    };
    console.log("PATH");
    console.log(environment.path);
    //
    // return new HDWalletProvider(mnemonic, new HttpHeaderProvider(environment.path, header), 0, 5);
    if (false) {
      return new HDWalletProvider(mnemonic, new HttpHeaderProvider(environment.path, header), 0, 5);
    } else {
      return new HttpHeaderProvider(environment.path, header);
    }

  }

  getSigningVmwareBlockChainProvider(authKey?: string) {
    console.log("getSigningVmwareBlockChainProvider()");
    if (!authKey) {
      console.log("Auth key from local storage?");
      authKey = localStorage.getItem('BA');
    }
    const mnemonic = "birth equip will assume kick skull elbow price general wage canoe ivory";
    const header = {
      'authorization': authKey,
      'X-Requested-With': 'XMLHttpRequest' // Suppress basic auth pop up
    };

    return new HDWalletProvider(mnemonic, new HttpHeaderProvider(environment.path, header), 0, 5);
  }

}
