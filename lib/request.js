'use strict';

var urlParse = require('url').parse;
var http = require('http');
var https = require('https');

function wspider(url, opt, cb) {

  if(typeof opt === 'function') {
    cb = opt;
    opt = {};
  } else {
    opt = opt || { encoding: 'utf-8' };
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
      res.size = chunkSize;
      res.rawbody = Buffer.concat(chunks, chunkSize);
      res.text = res.rawbody.toString(opt.encoding);
      cb(err, res);
    });

    res.on('aborted', cb);

  }).on('error', cb);
};

wspider.requestToYield = function(url, opt) {
  return function request(cb) {
    return wspider(url, opt, cb);
  };
};

module.exports = wspider;
