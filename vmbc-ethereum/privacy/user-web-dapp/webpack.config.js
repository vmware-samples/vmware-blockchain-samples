const webpack = require("webpack");
const path = require('path');

const webpackConfig = {
    entry: './web_client_app.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'main.js',
    },    
    target: 'web',
    plugins: [
        new webpack.ProvidePlugin({
          // Make a global `process` variable that points to the `process` package,
          // because the `util` package expects there to be a global variable named `process`.
               // Thanks to https://stackoverflow.com/a/65018686/14239942
          process: 'process/browser'
       })
    ],
    node:  {
        fs: 'empty',
        child_process: 'empty',
        net: 'empty',
        dns: 'empty',
        tls: 'empty',
        http2: 'empty'
    },
    mode: 'development'
};
module.exports = webpackConfig;