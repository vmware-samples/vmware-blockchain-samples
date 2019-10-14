/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

export class User {
  id: number;
  role: UserRole;
}

export enum UserRole {
  farmer = 'farmer',
  auditor = 'auditor',
  storage = 'storage',
  distributor = 'distributor',
  super_market = 'super_market',
}
