/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/user/user.service';
import { random } from '../../shared/utils';

@Component({
  selector: 'vmw-sc-blockchain-status',
  templateUrl: './blockchain-status.component.html',
  styleUrls: ['./blockchain-status.component.scss']
})
export class BlockchainStatusComponent implements OnInit {

  roles: string[];

  // TODO - remove these arrays - they're just for demo data
  statuses: string[] = Array(5).fill('waiting');
  connectorActive: boolean[] = Array(4).fill(true);

  constructor(userService: UserService) {
    this.roles = userService.roles;
  }

  ngOnInit() {
    const pendingNode = random(5);
    this.statuses[pendingNode - 1] = 'pending';
    this.statuses.fill('approved', 0, pendingNode - 1);
    this.connectorActive.fill(false, pendingNode - 1);
    console.log(this.connectorActive);
  }

}
