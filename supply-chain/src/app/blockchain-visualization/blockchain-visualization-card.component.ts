/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'vmw-sc-blockchain-visualization-card',
  templateUrl: './blockchain-visualization-card.component.html',
  styleUrls: ['./blockchain-visualization-card.component.scss']
})
export class BlockchainVisualizationCardComponent implements OnInit {

  @Input() role: string;
  @Input() status: string;
  @Input() transactionState: string;

  constructor() { }

  ngOnInit() {
  }

}
