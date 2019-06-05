/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BlockchainService } from '../../core/blockchain/blockchain.service';

@Component({
  selector: 'vmw-sc-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent implements OnInit {

  item: string;
  items: string[];
  orderForm: FormGroup;
  quantity: number;
  visibleValue = true;

  @Input()
  get visible() {
    return this.visibleValue;
  }

  set visible(val) {
    this.visibleValue = val;
  }

  constructor(
    private formBuilder: FormBuilder,
    private blockchainService: BlockchainService,
    private router: Router,
  ) {
    this.items = this.blockchainService.items;
  }

  ngOnInit() {
    this.orderForm = this.formBuilder.group({
      item: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  create() {
    const item = this.orderForm.get('item').value;
    const quantity = this.orderForm.get('quantity').value;
    this.blockchainService.createOrder(item, quantity).then(order => {
      this.orderForm.reset();
      this.router.navigate(['/orders', 'last']);
    });
  }
}
