/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { NgModule, Optional, SkipSelf } from '@angular/core';
import { OrderService } from './order/order.service';
import { UserService } from './user/user.service';

@NgModule({
  providers: [
    OrderService,
    UserService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() core: CoreModule) {
    if (core) {
      throw new Error('CoreModule should only be imported in AppModule');
    }
  }
}
