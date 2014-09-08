
var get = require('..');

describe('easy get test', function() {

  describe('only get', function() {
    it('should status code 200 get request http://www.baidu.com', function(done) {

      get('http://www.baidu.com', function(err, res) {
        res.statusCode.should.eql(200);
        done();
      });
    });

    it('should return text is right', function(done) {

      get('http://www.baidu.com', function(err, res) {
        res.text.should.containEql('<title>百度一下，你就知道</title>');
        done();
      });
    });
  });
});
