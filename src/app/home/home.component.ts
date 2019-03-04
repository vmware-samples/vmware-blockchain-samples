/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, OnInit } from '@angular/core';
import { BlockchainService } from '../shared/blockchain.service';

@Component({
  selector: 'vmw-sc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    constructor(private blockchain: BlockchainService) { }

    ngOnInit() {
      setTimeout(() => {
        this.testConnection();
      }, 1000);
    }

    testConnection() {
      this.blockchain.ordersContract.methods.create(
        this.blockchain.web3.utils.fromAscii('Apples'),
        32
      )
      .send({ from: this.blockchain.from, 'gas': '4400000' })
      .then(transaction => {
        console.log('transaction', transaction);

        this.blockchain.web3.eth
          .getTransaction(transaction.transactionHash).then(data => {
          console.log(data);
        }, error => console.log('error', error));

      });
    }
  }
