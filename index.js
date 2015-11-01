'use strict'

const _ = require('lodash'),
      request = require('request'),
      urljoin = require('url-join'),
      clientName = 'kugelblitz-client:';

class Client {
  constructor(options) {
    const _defaultOptions = {
      endpoint: null,
      token: null,
      intervalInSeconds: 5 * 60,
      requestTimeoutInSeconds: 1 * 60,
      production: process.env.NODE_ENV === 'production',
      debug: false,
      callbackUrl: null
    };

    const mergedOptions = _.extend(
      _.clone(_defaultOptions),
      _.clone(options)
    );

    this.endpoint = mergedOptions.endpoint;
    this.intervalInSeconds = mergedOptions.intervalInSeconds;
    this.requestTimeoutInSeconds = mergedOptions.requestTimeoutInSeconds;
    this.token = mergedOptions.token;
    this.production = mergedOptions.production;
    this.debug = mergedOptions.debug;
    this.callbackUrl = mergedOptions.callbackUrl;

    if(!this.endpoint) throw new Error('An endpoint must be provided!');

    if(!this.token) throw new Error('A token must be provided!');

    if(this.intervalInSeconds <= this.requestTimeoutInSeconds) {
      throw new Error(`The interval (${this.intervalInSeconds}s) must be greater than the request timeout (${this.requestTimeoutInSeconds}s)`);
    }

    if(!this.production) console.log(clientName, 'The production option is set to false. No API calls will be made');

    if(this.debug) console.log(clientName, 'Debug mode is active');


    this._sendHeartbeat();

    setInterval(() => {
        this._sendHeartbeat();
      }.bind(this),
      this.intervalInSeconds * 1000
    );
  }

  _sendHeartbeat() {
    let options = {
      url: urljoin(this.endpoint, '/api/v1/heartbeat'),
      method: 'POST',
      json: true,
      timeout: this.requestTimeoutInSeconds * 1000,
      headers: {
        'X-KUGELBLITZ-TOKEN': this.token
      }
    };

    if(this.callbackUrl) {
      options.body = {
        callback: { url: this.callbackUrl }
      };
    }

    if(!this.production) {
      return;
    }

    request(options, (error, response, body) => {
      if(this.debug) {
        if(error || response.statusCode !== 200) {
          return console.error(clientName, 'Failed to send kugelblitz heartbeat:', error, response);
        }

        console.log(clientName, 'heartbeat sent!');
      }
    });
  }

  _sendReport(type, payload, cb) {
    const options = {
      url: urljoin(this.endpoint, '/api/v1/report'),
      method: 'POST',
      json: true,
      body: { type: type, payload: JSON.stringify(payload) },
      timeout: this.requestTimeoutInSeconds * 1000,
      headers: {
        'X-KUGELBLITZ-TOKEN': this.token
      }
    };

    if(!this.production) {
      return cb(null);
    }

    request(options, (error, response, body) => {
      if(error || response.statusCode !== 201) {
        console.log(error, response);
        return cb(error || new Error(`Failed to send heartbeat. Server sent a HTTP ${response.statusCode}`));
      }

      return cb(null);
    });
  }

  reportError(error) {
    return new Promise((rs, rj) => {
      this._sendReport(
        'error',
        {
          message: error.message,
          stack: error.stack ? error.stack : null
        }, (err) => {
          if(err) {
            return rj(err);
          }
          rs();
        }
      );
    });
  }

}

module.exports = Client
