'use strict';

const http = require('http');
const https = require('https');
const urlParse = require('url').parse;
const debug = require('debug')('wspider');
const HTMLRE = /html/i;
const JSONRE = /json/i;

module.exports = (url, args) => {
  args = Object.assign({}, args, {
    encoding: 'utf8',
  });

  return new Promise((resolve, reject) => {
    const httplib = urlParse(url).protocol === 'https:' ? https : http;
    const reqStartTime = Date.now();
    const writeStream = args.writeStream;

    let chunkSize = 0;
    let resAborted = false;

    const done = (err, data, res) => {
      if (err) {
        return reject(err);
      }

      res.rt = Date.now() - reqStartTime;
      res.data = res.data;
      debug('[response] rt %sms', res.rt);

      return resolve(res);
    };

    const req = httplib.get(url, (res) => {
      if (writeStream) {
        writeStream.on('close', done.bind(null, null, null, res));
        return res.pipe(writeStream);
      }

      const chunks = [];

      res.on('data', (chunk) => {
        chunkSize += chunk.length;
        chunks.push(chunk);
      });

      res.on('aborted', () => {
        resAborted = true;
      });

      res.on('end', () => {
        const data = Buffer.concat(chunks, chunkSize);
        const contentType = res.headers['content-type'];
        const response = {
          size: chunkSize,
          statusCode: res.statusCode,
          rawResponse: res,
          aborted: resAborted,
        };

        if (HTMLRE.test(contentType)) {
          response.html = data.toString(args.encoding);
        } else if (JSONRE.test(contentType)) {
          response.json = JSON.parse(data);
        }

        return done(null, data, response);
      });
    });

    req.on('error', (err) => {
      return done(err);
    });

    req.end();
  });
};
