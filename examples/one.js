
var get = require('..');

get('http://www.baidu.com', function(err, res) {

  console.log(err, res);
});

get('https://www.alipay.com', function(err, res) {

  console.log(err, res);
});
