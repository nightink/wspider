
var get = require('..');

describe('easy get test', function() {

  describe('get http', function() {
    it('should status code 200 get request http://www.baidu.com', function(done) {

      get('http://www.baidu.com', function(err, res) {
        res.statusCode.should.eql(200);
        done();
      });
    });

    it('should return text is right when get http://www.baidu.com', function(done) {

      get('http://www.baidu.com', function(err, res) {
        res.text.should.containEql('<title>百度一下，你就知道</title>');
        done();
      });
    });
  });

  describe('get https', function() {
    it('should status code 200 get request https://www.npmjs.org/', function(done) {

      get('https://www.npmjs.org/', function(err, res) {
        res.statusCode.should.eql(200);
        done();
      });
    });

    it('should return text is right when get https://www.npmjs.org/', function(done) {

      get('https://www.npmjs.org/', function(err, res) {
        res.text.should.containEql('<title>npm</title>');
        done();
      });
    });
  });
});
