const path = require('path');
const webpack = require('webpack');
const { VueLoaderPlugin } = require("vue-loader");
const merge = require('webpack-merge')
const CleanWebpackPlugin = require('clean-webpack-plugin');

var config = {
  output: {
    path: path.resolve(`${__dirname}/dist/`)
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
        }
      },
      {
        test: /\.(scss|css)/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          }
        ]
      }
    ]
  },
  externals: {
    'vue': 'Vue'
  },
  plugins: [new VueLoaderPlugin()]
};

module.exports = [
  merge(config,
  {
    entry: path.resolve(__dirname + '/src/components/Leapbox.vue'),
    output: {
      filename: 'leapbox.js',
      libraryTarget: 'umd',
      library: 'leapbox',
      umdNamedDefine: true
    }
  })
];
