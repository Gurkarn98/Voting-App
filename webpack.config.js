var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'views');
var APP_DIR = path.resolve(__dirname, 'public');

var config = {
  entry: {
    page1: APP_DIR + '/allPollsScript.jsx',
    page2: APP_DIR + '/myPollsScript.jsx',
    page3: APP_DIR + '/pollPageScript.jsx',
  },
  output: {
    path: APP_DIR,
    filename: '[name].js'
  },
  module : {
    loaders : [
      {
        test : /\.jsx?/,
        include : APP_DIR,
        loader : 'babel-loader'
      }
    ]
  }
};

module.exports = config;