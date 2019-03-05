/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'vmw-sc-toggle-radio-group',
  templateUrl: './toggle-radio-group.component.html',
  styleUrls: ['./toggle-radio-group.component.scss']
})
export class ToggleRadioGroupComponent {

  selectedValueData: string;

  @Input() disabled = false;
  @Input() name: string;
  @Input() values: string[] = ['yes', 'no'];

  @Output()
  valueChange = new EventEmitter<string>();

  @Input()
  get selectedValue() {
    return this.selectedValueData;
  }

  set selectedValue(val) {
    this.selectedValueData = val;
    this.valueChange.emit(this.selectedValueData);
  }

  constructor() { }

  evaluateUncheck( clickValue ) {
    if (this.disabled) {
      // Block input when the group is disabled
      event.preventDefault();
    } else {
      if (clickValue === this.selectedValue) {
        this.selectedValue = null;
      }
    }
  }
}
