/*
 * easy-get
 * https://github.com/Nightink/easy-get
 *
 * Copyright (c) 2014 Nightink
 * Licensed under the MIT license.
 */

'use strict';

var urlParse = require('url').parse;
var http = require('http');
var https = require('https');

module.exports = function easyGet(url, cb) {

  var request = urlParse(url).protocol === 'https:' ? https : http;
  request.get(url, function(res) {

    var data = '';
    res.on('data', function(d) {

      data += d;
    });

    res.on('end', function(err) {

      res.text = data.toString();
      cb(err, res);
    });

  }).on('error', cb);
};
