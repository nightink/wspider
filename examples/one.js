
var get = require('..');

get('http://www.baidu.com', function(err, res) {

  console.log(err, res);
});
