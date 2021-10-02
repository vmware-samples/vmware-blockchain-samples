/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SimpleConfirmationComponent } from '../simple-confirmation/simple-confirmation.component';

@Component({
  selector: 'vmw-sc-toggle-radio-group',
  templateUrl: './toggle-radio-group.component.html',
  styleUrls: ['./toggle-radio-group.component.scss']
})
export class ToggleRadioGroupComponent {

  @ViewChild(SimpleConfirmationComponent, { static: true }) confirmation;
  _selectedValue: string;

  @Input() disabled = false;
  @Input() name: string;
  @Input() values: string[] = ['yes', 'no'];

  @Output()
  selectedValueChange = new EventEmitter<string>();

  @Input()
  set selectedValue(val) {
    this._selectedValue = val;
  }

  get selectedValue(): string {
    return this._selectedValue;
  }

  private pendingValue;

  constructor() { }

  closeConfirmation(confirmed: boolean) {
    if (confirmed) {
      this.evaluateUncheck(this.pendingValue);
      this.selectedValueChange.emit(this.selectedValue);
    }
    this.pendingValue = null;
  }

  evaluateUncheck( clickValue ) {
    if (clickValue === this.selectedValue) {
      this.selectedValue = null;
    } else {
      this.selectedValue = clickValue;
    }
  }

  reset() {
    this.selectedValue = null;
  }

  selectValue(value, event) {
    event.preventDefault(); // Prevent Radio button behavior
    if (! this.disabled) {
      this.pendingValue = value;
      this.confirmation.open();
    }
  }
}
