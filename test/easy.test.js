
const request = require('..');
const should = require('should');

describe('easy get test', function() {

  describe('request http', function() {
    it('should status code 200 get request http://www.baidu.com', function() {

      request('http://www.baidu.com', function(err, response) {
        response.statusCode.should.eql(200);
      });
    });

    it('should return text is right when get http://www.baidu.com', function() {
      request('http://www.baidu.com', function(err, response) {
        response.html.should.containEql('<title>百度一下，你就知道</title>');
      });
    });
  });

  describe('request http options {}', function() {
    it('should return text is right when get http://www.baidu.com', function() {
      request('http://www.baidu.com', {}, function(err, response) {
        response.html.should.containEql('<title>百度一下，你就知道</title>');
      });
    });
  });

  describe('get https', function() {
    it('should status code 200 get request https://www.baidu.com', function() {
      request('https://www.baidu.com', function(err, response) {
        response.statusCode.should.eql(200);
      });
    });

    it('should return text is right when get https://www.baidu.com', function() {
      request('https://www.baidu.com', function(err, response) {
        response.html.should.containEql('<title>百度一下，你就知道</title>');
      });
    });
  });

  describe('get fail error', function() {
    it('get https://www.alipay.co', function(done) {
      request('https://www.alipay.co', function(err) {
        should.exist(err);
        done();
      });
    });
  });
});
