/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'vmw-sc-blockchain-status-connector',
  templateUrl: './blockchain-status-connector.component.html',
  styleUrls: ['./blockchain-status-connector.component.scss']
})
export class BlockchainStatusConnectorComponent implements OnInit {

  @Input() active: boolean;

  constructor() { }

  ngOnInit() {
  }

}
