/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

module.exports = {
  authValues: {
    setJwt: function(jwt) {this.jwt = jwt},
    clearJwt: function()  {this.jwt = undefined},
    getJwt: function()  {this.jwt},
    jwt: undefined,
    username: undefined,
    password: undefined,
    clearAuth: function()  {
      this.username = undefined;
      this.password = undefined;
    },
    genPath: function() {
      return `http://${this.username}:${this.password}@localhost:8080/api/concord/eth/`
    }
  }
}
