// Copyright 2020 VMware, all rights reserved.
// This software is released under MIT license.
// The full license information can be found in LICENSE in the root directory of this project.


const engine = process.env.ENGINE
let config = {test: {}};

const ganacheTestConfig = {
  orderLength: '1',
  orderIndex: 0,
  createOrders: '101',
  accountIndex: 0
};
const concordTestConfig = {
  orderLength: '2',
  orderIndex: 1,
  createOrders: '102',
  accountIndex: 2
};

switch (engine) {
  case 'CONCORD':
    config.test = concordTestConfig;
    break;

  case 'GANACHE':
    config.test = ganacheTestConfig;
    break;
}


module.exports = config;
