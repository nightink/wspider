'use strict';

const http = require('http');
const https = require('https');
const urlModule = require('url');
const zlib = require('zlib');
const qs = require('querystring');

const debug = require('debug')('wspider');

exports.agent = new http.Agent();
exports.agent.maxSockets = 1000;

exports.httpsAgent = new https.Agent();
exports.httpsAgent.maxSockets = 1000;

const redirect = {
  300: true,
  301: true,
  302: true,
  303: true,
  305: true,
  307: true,
  308: true,
};
const MAX_VALUE = Math.pow(2, 31) - 10;
let REQUEST_ID = 0;

exports.curl = exports.request = (url, args) => {
  const parsedUrl = urlModule.parse(url);

  args = Object.assign({
    encoding: 'utf-8',
    port: 80,
    method: 'GET',
    path: '/',
    headers: {},
    timeout: 5000,
    agent: exports.agent,
  }, parsedUrl, args);

  let port = args.port;
  let httplib = http;
  let agent = args.agent;
  let timer = null;

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

  if (args.port) {
    port = args.port;
  }

  if (args.agent === false) {
    agent = false;
  }

  const method = args.method.toUpperCase();
  const options = {
    host: args.host,
    path: args.path,
    method: method,
    port: port,
    agent: agent,
    headers: args.headers,
  };

  const auth = args.auth;
  if (auth) {
    options.auth = auth;
  }

  const isReadAction = method === 'GET' || method === 'HEAD';
  let body = args.data;

  if (body && !(typeof body === 'string' || Buffer.isBuffer(body))) {
    if (isReadAction) {
      // read: GET, HEAD, use query string
      body = qs.stringify(body);
    } else {
      let contentType = options.headers['Content-Type'] || options.headers['content-type'];
      // auto add application/x-www-form-urlencoded when using urlencode form request
      if (!contentType) {
        if (args.contentType === 'json') {
          contentType = 'application/json';
        } else {
          contentType = 'application/x-www-form-urlencoded';
        }
        options.headers['Content-Type'] = contentType;
      }

      if (contentType === 'application/json') {
        body = JSON.stringify(body);
      } else {
        // 'application/x-www-form-urlencoded'
        body = qs.stringify(body);
      }
    }
  }

  // if it's a GET or HEAD request, data should be sent as query string
  if (isReadAction && body) {
    options.path += (parsedUrl.query ? '&' : '?') + body;
    body = null;
  }

  if (body) {
    let length = body.length;
    if (!Buffer.isBuffer(body)) {
      length = Buffer.byteLength(body);
    }
    options.headers['Content-Length'] = length;
  }

  if (args.dataType === 'json') {
    options.headers.Accept = 'application/json';
  }

  // set user-agent
  if (!options.headers['User-Agent'] && !options.headers['user-agent']) {
    options.headers['User-Agent'] = 'node-wspider';
  }

  if (args.gzip) {
    if (!options.headers['Accept-Encoding'] || !options.headers['accept-encoding']) {
      options.headers['Accept-Encoding'] = 'gzip';
    }
  }

  if (REQUEST_ID >= MAX_VALUE) {
    REQUEST_ID = 0;
  }
  const reqId = ++REQUEST_ID;

  return new Promise((resolve, reject) => {
    let chunkSize = 0;
    let resAborted = false;

    const writeStream = args.writeStream;
    const reqStartTime = Date.now();

    function done(err, data, res) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      if (err) {
        return reject(err);
      }

      const response = {
        data: data,
        size: chunkSize,
        statusCode: res.statusCode,
        rawResponse: res,
        aborted: resAborted,
        requestId: reqId,
        rt: Date.now() - reqStartTime,
      };

      debug('Response: rt %sms', response.rt);

      return resolve(response);
    }

    function handleRedirect(res) {
      let err = null;
      if (args.followRedirect && redirect[res.statusCode]) {  // handle redirect
        args._followRedirectCount = (args._followRedirectCount || 0) + 1;
        if (!res.headers.location) {
          err = new Error(`Got statusCode ${res.statusCode} but cannot resolve next location from headers`);
          err.name = 'FollowRedirectError';
        } else if (args._followRedirectCount > args.maxRedirects) {
          err = new Error('Exceeded maxRedirects. Probably stuck in a redirect loop ' + url);
          err.name = 'MaxRedirectError';
        } else {
          const _url = urlModule.resolve(url, res.headers.location);
          debug('Request,%s %s: `redirected` from %s to %s', reqId, options.path, url, _url);

          if (timer) {
            clearTimeout(timer);
            timer = null;
          }

          // should pass done instead of callback
          exports.request(_url, args).then(done).catch(done);
          return {
            redirect: true,
            error: null,
          };
        }
      }
      return {
        redirect: false,
        error: err,
      };
    }

    function decodeContent(res, body, cb) {
      const encoding = res.headers['content-encoding'];

      if (body.length === 0 || !encoding || encoding.toLowerCase() !== 'gzip') {
        return cb(null, body, encoding);
      }

      debug('gunzip %d length body', body.length);
      zlib.gunzip(body, cb);
    }

    const req = httplib.request(options, (res) => {
      if (writeStream) {
        const result = handleRedirect(res);
        if (result.redirect) {
          return res.resume();
        }
        if (result.error) {
          res.resume();
          // end ths stream first
          writeStream.end();
          return done(result.error, null, res);
        }
        writeStream.on('close', done.bind(null, null, null, res));
        return res.pipe(writeStream);
      }

      const chunks = [];

      res.on('data', (chunk) => {
        chunkSize += chunk.length;
        chunks.push(chunk);
        debug('Response: chunking size %s', chunkSize);
      });

      res.on('aborted', () => {
        resAborted = true;
      });

      res.on('end', () => {
        const data = Buffer.concat(chunks, chunkSize);

        const result = handleRedirect(res);
        if (result.error) {
          return done(result.error, data, res);
        }
        if (result.redirect) {
          return null;
        }

        decodeContent(res, data, function(err, data/* , encoding */) {
          if (err) {
            return done(err, data, res);
          }

          return done(null, data, res);
        });
      });
    });

    req.on('error', (err) => {
      return done(err);
    });

    if (writeStream) {
      writeStream.once('error', (err) => {
        done(err);
        return req.abort();
      });
    }

    req.end(body);

    timer = setTimeout(() => {
      timer = null;
      req.abort();
    }, args.timeout);

    debug('Request,%s: Object %o', reqId, req);
  });
};
