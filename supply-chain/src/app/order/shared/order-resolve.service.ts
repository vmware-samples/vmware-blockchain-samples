/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';

import { BlockchainService } from './../../core/blockchain/blockchain.service';

@Injectable()
export class OrderResolver implements Resolve<any> {
  constructor(private blockchainService: BlockchainService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<any> {
    const web3 = this.blockchainService.web3;

    if (route.params && route.params['order_id'] && web3.isAddress(route.params['order_id'])) {
      const orderId = route.params['order_id'];

      return this.blockchainService.getOrderByAddress(orderId).then(order => {
        return this.blockchainService.populateOrderDetails(order).then(response => {
          return response;
          });
      });
    } else {
      return new Promise((resolve, reject) => {
         resolve(false);
      });
    }
  }
}
