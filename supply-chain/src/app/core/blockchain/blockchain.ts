/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

 export enum BlockchainNodeTransactionStates {
   approved = 'approved',
   healthy = 'healthy',
   pending = 'pending',
   unhealthy = 'unhealthy'
 }

export class BlockchainNode {
  address: string;
  hostname: string;
  status: string;
  transactionState: BlockchainNodeTransactionStates;
}

export enum BlockchainType {
   ganache = 'ganache',
   concord = 'concord',
   vmware = 'vmware',
   metamask = 'metamask'
 }
