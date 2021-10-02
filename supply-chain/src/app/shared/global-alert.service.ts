/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable, ErrorHandler } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ErrorAlertService {
  notify: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor() {
  }

  add(error: Error) {
    this.notify.next(error);
    console.error(error);
  }
}

@Injectable()
export class GlobalAlertService implements ErrorHandler {

  constructor(
    private alert: ErrorAlertService
  ) { }

  handleError(error: any) {
    this.alert.add(error);
  }
}
