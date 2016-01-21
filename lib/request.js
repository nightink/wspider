'use strict';

const http = require('http');
const https = require('https');
const urlParse = require('url').parse;

const debug = require('debug')('wspider');

const HTMLRE = /html/i;
const JSONRE = /json/i;

exports.agent = new http.Agent();
exports.agent.maxSockets = 1000;

exports.httpsAgent = new https.Agent();
exports.httpsAgent.maxSockets = 1000;

exports.request = (url, args) => {
  args = Object.assign({}, args, {
    encoding: 'utf8',
  });

  const parsedUrl = urlParse(url);
  const writeStream = args.writeStream;

  const method = (args.type || args.method || parsedUrl.method || 'GET').toUpperCase();
  let port = parsedUrl.port || 80;
  let httplib = http;
  let agent = args.agent || exports.agent;

  if (parsedUrl.protocol === 'https:') {
    httplib = https;
    agent = args.httpsAgent || exports.httpsAgent;
    if (args.httpsAgent === false) {
      agent = false;
    }
    if (!parsedUrl.port) {
      port = 443;
    }
  }

  if (args.agent === false) {
    agent = false;
  }

  const options = {
    host: parsedUrl.hostname || parsedUrl.host || 'localhost',
    path: parsedUrl.path || '/',
    method: method,
    port: port,
    agent: agent,
    headers: args.headers || {},
  };

  return new Promise((resolve, reject) => {
    let chunkSize = 0;
    let resAborted = false;

    const reqStartTime = Date.now();
    const done = (err, data, res) => {
      if (err) {
        return reject(err);
      }

      res.rt = Date.now() - reqStartTime;
      res.data = res.data;
      debug('[response] rt %sms', res.rt);

      return resolve(res);
    };

    const req = httplib.request(options, (res) => {
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
