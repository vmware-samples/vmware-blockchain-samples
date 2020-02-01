/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

const PROXY_CONFIG = {
  "/api": {
    "target": "http://localhost:4000",
    "secure": false
  },
  "/vmware": {
    "target": process.env.BC_URL || "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/vmware": ""
    }
  },
  "/concord": {
    "target": "http://127.0.0.1:8545",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/concord": ""
    }
  },
  "/ganache": {
    "target": "http://127.0.0.1:7545",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/ganache": ""
    }
  }

}

module.exports = PROXY_CONFIG;
