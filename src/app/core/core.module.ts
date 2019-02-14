/*
 * Copyright 2019 VMware, all rights reserved.
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
