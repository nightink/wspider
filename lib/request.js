/*
 * easy-get
 * https://github.com/nightink/easy-get
 *
 * Copyright (c) 2015 nightink
 * Licensed under the MIT license.
 */

'use strict';

var urlParse = require('url').parse;
var http = require('http');
var https = require('https');

module.exports = function easyGet(url, opt, cb) {
  if(typeof opt === 'function') {
    cb = opt;
    opt = {};
  }

  var request = urlParse(url).protocol === 'https:' ? https : http;
  request.get(url, function(res) {

    var chunks = [];
    var chunkSize = 0;
    res.on('data', function(chunk) {
      chunkSize += chunk.length;
      chunks.push(chunk);
    });

    res.on('end', function(err) {
      var body = Buffer.concat(chunks, chunkSize);
      res.size = chunkSize;
      res.body = body;
      res.text = body.toString(opt.encoding);
      cb(err, res);
    });

  }).on('error', cb);
};
