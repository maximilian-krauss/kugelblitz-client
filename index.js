'use strict'

const _ = require('lodash'),
      request = require('request'),
      urljoin = require('url-join');

class Client {
  constructor(options) {
    const _defaultOptions = {
      endpoint: null,
      token: null,
      intervalInSeconds: 5 * 60,
      requestTimeoutInSeconds: 1 * 60,
      production: process.env.NODE_ENV === 'production',
      debug: false
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

    if(!this.endpoint) {
      throw new Error('An endpoint must be provided!');
    }

    if(!this.token) {
      throw new Error('A token must be provided!');
    }

    if(this.intervalInSeconds <= this.requestTimeoutInSeconds) {
      throw new Error(`The interval (${this.intervalInSeconds}s) must be greater than the request timeout (${this.requestTimeoutInSeconds}s)`);
    }

    if(!this.production) {
      console.log('meerkat-client:', 'The production option is set to false. No API calls will be made');
    }

    if(this.debug) {
      console.log('meerkat-client:', 'Debug mode is active');
    }

    this._sendPing();

    setInterval(() => {
        this._sendPing();
      }.bind(this),
      this.intervalInSeconds * 1000
    );
  }

  _sendPing() {
    const options = {
      url: urljoin(this.endpoint, '/event/heartbeat'),
      method: 'POST',
      json: true,
      timeout: this.requestTimeoutInSeconds * 1000,
      headers: {
        'X-MEERKAT-TOKEN': this.token
      }
    };

    if(!this.production) {
      return;
    }

    request(options, (error, response, body) => {
      if(this.debug) {
        if(error) {
          return console.error('meerkat-client:', 'Failed to send meerkat heartbeat:', error);
        }

        console.log('meerkat-client:', 'heartbeat sent!');
      }
    });
  }

}

module.exports = Client
