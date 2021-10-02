/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

export interface NodeProperties {
  location: string;
  nodes: [{
    id: string,
    consortiumName: string;
    blockchainType: string;
    status: string;
  }];
}
