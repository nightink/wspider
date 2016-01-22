# wspider [![Build Status](https://travis-ci.org/nightink/wspider.svg)](http://travis-ci.org/nightink/wspider)

web spider, use node@4 return Promise

base fork [urllib](http://github.com/node-modules/urllib)

## Getting Started
Install the module with: `npm install wspider`

```javascript
const ws = require('wspider');
ws.request(url).then((res) => { console.log(res) });
```

## API

```javascript
const ws = require('wspider');
ws.request(url).then((res) => { console.log(res) });
ws.request(url, {/* host: 'examples.com' */}).then((res) => {
  console.log(res)
});

// return
{
  aborted: ,
  data: ,
  size: ,
  statusCode: ,
  res: ,
  rt: ,
}
```

## License
Copyright (c) 2015 nightink
Licensed under the MIT license.
