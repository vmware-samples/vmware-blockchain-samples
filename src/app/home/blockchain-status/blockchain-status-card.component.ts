/*
 * Copyright 2019 VMware, all rights reserved.
 */

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'vmw-sc-blockchain-status-card',
  templateUrl: './blockchain-status-card.component.html',
  styleUrls: ['./blockchain-status-card.component.scss']
})
export class BlockchainStatusCardComponent implements OnInit {

  @Input() role: string;
  @Input() status: string;

  constructor() { }

  ngOnInit() {
  }

}
