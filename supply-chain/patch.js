/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */


const fs = require('fs');
const f = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js';

fs.readFile(f, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    var result = data.replace(/node: false/g, 'node: {crypto: true, stream: true}');

    fs.writeFile(f, result, 'utf8', function (err) {
        if (err) return console.log(err);
    });
});
