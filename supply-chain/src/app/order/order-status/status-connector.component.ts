/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'vmw-sc-status-connector',
  templateUrl: './status-connector.component.html',
  styleUrls: ['./status-connector.component.scss']
})
export class StatusConnectorComponent implements OnInit {

  @Input() active: boolean;

  constructor() { }

  ngOnInit() {
  }

}
