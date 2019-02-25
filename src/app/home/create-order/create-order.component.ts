/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlockchainService } from '../../core/blockchain/blockchain.service';

@Component({
  selector: 'vmw-sc-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent implements OnInit {

  item: string;
  orderForm: FormGroup;
  quantity: number;
  visibleValue = true;

  @Output() close: EventEmitter<any> = new EventEmitter();

  @Input()
  get visible() {
    return this.visibleValue;
  }

  set visible(val) {
    this.visibleValue = val;
    if (!val) {
      this.close.emit();
    }
  }

  constructor(private formBuilder: FormBuilder,
              private blockchainService: BlockchainService) {

  }

  ngOnInit() {
    this.orderForm = this.formBuilder.group({
      item: ['', Validators.required],
      quantity: ['', Validators.required]
    });
  }

  create() {
    const item = this.orderForm.get('item').value;
    const quantity = this.orderForm.get('quantity').value;
    this.blockchainService.createOrder(item, quantity).then((result) => {
      this.orderForm.reset();
      this.close.emit();
    });
  }
}
