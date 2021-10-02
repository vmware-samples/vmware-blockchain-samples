/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlockchainService } from '../../core/blockchain/blockchain.service';

@Component({
  selector: 'vmw-sc-simple-confirmation',
  templateUrl: './simple-confirmation.component.html',
  styleUrls: ['./simple-confirmation.component.scss']
})
export class SimpleConfirmationComponent {

  _visible;

  @Output() close: EventEmitter<boolean> = new EventEmitter();
  @Input() message: string;
  @Input()
  set visible(value: boolean) {
    this._visible = value;
  }

  get visible(): boolean {
    return this._visible;
  }

  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  cancel() {
    this.visible = false;
    this.close.emit(false);
  }

  ok() {
    this.visible = false;
    this.close.emit(true);
  }

  public open() {
    this.visible = true;
  }
}
