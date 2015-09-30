# meerkat-client
node.js client for [meerkat](https://github.com/maximilian-krauss/meerkat)

## Requirements
* node.js >= 4.1 (ES6 ftw.)
* npm => 3.1

## Installation
```
npm install meerkat-client
```

## Usage
```
const MeerkatClient = require('meerkat-client');

// ...

let mkClient = new MeerkatClient({
  //options see below
});

```

## Options
* `endpoint` (default: null, *required*): The meerkat API endpoint URL
* `token` (default: null, *required*): The individual application token (keep this one secret!)
* `intervalInSeconds` (default: 5 min): The interval in which the meerkat client should send a heartbeat to its endpoint.
* `requestTimeoutInSeconds` (default: 1 min): The timeout for API calls. This one must be lower than the heartbeat-intervall.
* `production`: When set to `false` no API calls will be sent. The default value is `false` but will be automatically set to `true` if the environment variable `NODE_ENV` is set to `production`.
* `debug` (default: false): When true, the client will output debug messages and errors. Otherwise you won't notice that the client is active.

## License
MIT
