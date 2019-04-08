/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable, ErrorHandler } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NotifierService {
  notify: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor() { }

  update(notifiation: any) {
    this.notify.next(notifiation);
  }
}
