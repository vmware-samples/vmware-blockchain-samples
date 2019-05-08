/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, Input } from '@angular/core';
import { OrderStatus } from '../../core/order/order';
import { UserService } from '../../core/user/user.service';
import { random } from '../../shared/utils';

@Component({
  selector: 'vmw-sc-blockchain-status',
  templateUrl: './blockchain-status.component.html',
  styleUrls: ['./blockchain-status.component.scss']
})
export class BlockchainStatusComponent {

  _order;
  roles: string[];

  @Input()
  set order(value) {
    let pendingNode;
    if (value) {
      if (value.status === OrderStatus.Ordered) {
        pendingNode = 1;
      } else if ([OrderStatus.Approved, OrderStatus.Audited].includes(value.status)) {
        pendingNode = 2;
      } else if ([OrderStatus.AuditDocUploaded, OrderStatus.AtWarehouse].includes(value.status)) {
        pendingNode = 3;
      } else if (value.status === OrderStatus.WarehouseReleased) {
        pendingNode = 4;
      } else if (value.status === OrderStatus.InTransit) {
        pendingNode = 5;
      } else if (value.status === OrderStatus.Delivered) {
        pendingNode = 6;
      }
    }
    this.connectorActive = Array(4).fill(true);
    this.statuses = Array(5).fill('waiting');
    this.statuses[pendingNode - 1] = 'pending';
    this.statuses.fill('approved', 0, pendingNode - 1);
    this.connectorActive.fill(false, pendingNode - 1);
    this._order = value;
  }

  get order() {
    return this._order;
  }

  // TODO - remove these arrays - they're just for demo data
  statuses: string[];
  connectorActive: boolean[];

  constructor(userService: UserService) {
    this.roles = userService.roles;
  }
}
