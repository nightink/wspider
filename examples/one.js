
var request = require('..');

request('http://www.baidu.com', function(err, res) {

  console.log(err, res.body, res.size);
});

request('https://www.alipay.com', function(err, res) {

  console.log(err, res.body, res.size);
});

request('https://www.alipay.co', function(err, res) {

  console.log(err, res);
});
