
'use strict';

const co = require('co');
const document = require('cheerio');
const ws = require('..');

co(function* () {
  const res = yield ws.curl('https://www.zhihu.com/question/33022664');

  const html = res.data.toString();
  const $ = document.load(html);

  console.log($('#zu-top-add-question').text());
}).catch(err => {
  console.error(err.stack);
});
