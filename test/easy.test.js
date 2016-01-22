
'use strict';

const ws = require('..');
const should = require('should');

describe('easy get test', function() {

  describe('request http', function() {
    it('should return text is right when get http://www.baidu.com', function(done) {
      ws.request('http://www.baidu.com').then(function(res) {
        res.statusCode.should.eql(200);
        (res.data.toString()).should.containEql('<title>百度一下，你就知道</title>');
      }).then(done);
    });
  });

  describe('request http options {}', function(done) {
    it('should return text is right when get http://www.baidu.com', function() {
      ws.request('http://www.baidu.com', {}).then(function(res) {
        (res.data.toString()).should.containEql('<title>百度一下，你就知道</title>');
      }).then(done);
    });
  });

  describe('get https', function() {
    it('should return text is right when get https://www.baidu.com/', function(done) {
      ws.request('https://www.baidu.com/').then((res) => {
        res.statusCode.should.eql(200);
        // res.data.toString().should.containEql('<title>百度一下，你就知道</title>');
        done();
      });
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
