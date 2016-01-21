
'use strict';

const ws = require('..');
const should = require('should');

describe('easy get test', function() {

  describe('request http', function() {
    it('should status code 200 get request http://www.baidu.com', function(done) {

      ws.request('http://www.baidu.com').then(function(response) {
        response.statusCode.should.eql(200);
      }).then(done);
    });

    it('should return text is right when get http://www.baidu.com', function(done) {
      ws.request('http://www.baidu.com').then(function(response) {
        response.html.should.containEql('<title>百度一下，你就知道</title>');
      }).then(done);
    });
  });

  describe('request http options {}', function(done) {
    it('should return text is right when get http://www.baidu.com', function() {
      ws.request('http://www.baidu.com', {}).then(function(response) {
        response.html.should.containEql('<title>百度一下，你就知道</title>');
      }).then(done);
    });
  });

  describe('get https', function() {
    it('should status code 200 get request https://www.baidu.com', function(done) {
      ws.request('https://www.baidu.com').then(function(response) {
        response.statusCode.should.eql(200);
      }).then(done);
    });

    it('should return text is right when get https://www.baidu.com', function(done) {
      ws.request('https://www.baidu.com').then(function(response) {
        response.html.should.containEql('<title>百度一下，你就知道</title>');
      }).then(done);
    });
  });

  describe('get fail error', function() {
    it('get https://www.alipay.co', function(done) {
      ws.request('https://www.alipay.co').catch(function(err) {
        should.exist(err);
        done();
      });
    });
  });
});
