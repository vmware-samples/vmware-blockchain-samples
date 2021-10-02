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

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<any> {
    const web3 = this.blockchainService.web3;
    await this.blockchainService.getAccounts();
    if (route.params && route.params['order_id'] && web3.utils.isAddress(route.params['order_id'])) {
      const orderId = route.params['order_id'];
      const order = await this.blockchainService.getOrderByAddress(orderId);
      const response =  await this.blockchainService.populateOrderDetails(order);

      return response;
    } else {
      return new Promise((resolve, reject) => {
         resolve(false);
      });
    }
  }
}
