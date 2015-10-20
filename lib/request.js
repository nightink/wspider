'use strict';

var urlParse = require('url').parse;
var http = require('http');
var https = require('https');

var HTMLRE = /html/i;
var JSONRE = /json/i;
function wspider(url, opt, cb) {
  if (typeof opt === 'function') {
    cb = opt;
    opt = {};
  } else {
    opt = opt || { encoding: 'utf-8' };
  }

  var ws = urlParse(url).protocol === 'https:' ? https : http;
  var chunks = [];
  var chunkSize = 0;
  ws.get(url, function(res) {
    res.on('data', function(chunk) {
      chunkSize += chunk.length;
      chunks.push(chunk);
    });

    res.on('end', function(err) {
      var response = {
        size: chunkSize,
        statusCode: res.statusCode,
        rawBody: Buffer.concat(chunks, chunkSize),
        rawResponse: res,
      }

      var contentType = res.headers['content-type'];
      if ( HTMLRE.test(contentType) ) {
        response.html = response.rawBody.toString(opt.encoding);
      } else if ( JSONRE.test(contentType) ) {
        response.json = JSON.parse(response.rawBody);
      }

      cb(err, response);
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
