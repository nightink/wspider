/*
 * easy-get
 * https://github.com/Nightink/easy-get
 *
 * Copyright (c) 2014 Nightink
 * Licensed under the MIT license.
 */

'use strict';

var http = require('http');

module.exports = function easyGet(url, cb) {

  http.get(url, function(res) {

    var data = '';
    res.on('data', function(d) {

      data += d.toString();
    });

    res.on('end', function(err) {

      res.text = data;
      cb(err, res);
    });

  }).on('error', cb);
};
