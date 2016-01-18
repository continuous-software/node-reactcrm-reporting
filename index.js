var assert = require('assert');
var request = require('superagent');
var assign = require('object-assign');
var url = require('url');

var prototype = {
  search: function search (params) {
    return Promise.resolve()
      .then(function () {
        var type = typeof params;
        var path = type === 'string' ? '/search/transactions/' + params : '/search/transactions';
        var method = type === 'string' ? 'get' : 'post';
        var endpoint = url.format(assign({}, this.endpoint, {pathname: path}));
        return new Promise(function (resolve, reject) {
          var req = request[method](endpoint)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + this.apiKey);
          if (method === 'post') {
            req.send(params);
          }
          req.end(function (err, response) {
            if (err) {
              reject(err);
            } else {
              resolve(response.body);
            }
          });
        }.bind(this));
      }.bind(this));
  },

  saveTransactions: function saveTransactions (transactions) {
    return Promise.resolve()
      .then(function () {
        var endpoint = url.format(assign({}, this.endpoint, {pathname: '/transactions'}));
        return new Promise(function (resolve, reject) {
          request
            .post(endpoint, transactions)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + this.apiKey)
            .end(function (err, response) {
              if (err) {
                reject(err);
              } else {
                resolve(response.body);
              }
            });
        }.bind(this));
      }.bind(this));
  }
};


module.exports = function factory (options) {
  options = options || {};
  assert(options.API_KEY, 'you must provide an API_KEY in your options');
  return Object.create(prototype, {
    endpoint: {
      value: assign({
        protocol: 'https',
        hostname: 'reporting.funnels.io'
      }, options.endpoint || {})
    },
    apiKey: {
      value: options.API_KEY
    }
  });
};