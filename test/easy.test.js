
var get = require('..');

describe('easy get test', function() {

  describe('get http', function() {
    it('should status code 200 get request http://www.baidu.com', function() {

      get('http://www.baidu.com', function(err, res) {
        res.statusCode.should.eql(200);
      });
    });

    it('should return text is right when get http://www.baidu.com', function() {
      get('http://www.baidu.com', function(err, res) {
        res.text.should.containEql('<title>百度一下，你就知道</title>');
      });
    });
  });

  describe('get https', function() {
    it('should status code 200 get request https://www.baidu.com', function() {
      get('https://www.npmjs.com', function(err, res) {
        res.statusCode.should.eql(200);
      });
    });

    it('should return text is right when get https://www.baidu.com', function() {
      get('https://www.npmjs.com', function(err, res) {
        res.text.should.containEql('<title>百度一下，你就知道</title>');
      });
    });
  });
});
