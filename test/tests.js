var nock = require('nock');
var service = require('../index.js');
var assert = require('assert');

describe('reporting sdk', function () {

  it('should throw if the apikey is not provided', function () {

    try {
      var instance = service({});
      assert(false, 'it should not get here');
    } catch (e) {
      assert.equal(e.message, 'you must provide an API_KEY in your options');
    }
  });

  it('should search by template name', function (done) {

    var api = nock('https://reporting.reactcrm.com')
      .get('/search/transactions/dashboard')
      .matchHeader('Authorization', 'Bearer apiKey')
      .reply(200, {hits: {total: 2}});
    var instance = service({API_KEY: 'apiKey'});
    instance.search('dashboard')
      .then(function (result) {
        assert.deepEqual(result, {hits: {total: 2}});
        assert(api.isDone(), 'api should have been requested');
        nock.cleanAll();
        done();
      })
      .catch(function (err) {
        done(err);
      })
  });

  it('should search with body request', function (done) {
    var api = nock('https://reporting.reactcrm.com')
      .post('/search/transactions', {query: {term: {foo: 'bar'}}})
      .matchHeader('Authorization', 'Bearer apiKey')
      .reply(200, {hits: {total: 2}});

    var instance = service({API_KEY: 'apiKey'});
    instance.search({query: {term: {foo: 'bar'}}})
      .then(function (result) {
        assert.deepEqual(result, {hits: {total: 2}});
        assert(api.isDone(), 'api should have been requested');
        nock.cleanAll();
        done();
      })
      .catch(function (err) {
        done(err);
      })
  });

  it('should reject promise if any error happens', function (done) {
    var api = nock('https://reporting.reactcrm.com')
      .get('/search/transactions/dashboard')
      .matchHeader('Authorization', 'Bearer apiKey')
      .reply(404, {message: 'could not find the search template'});
    var instance = service({API_KEY: 'apiKey'});
    instance.search('dashboard')
      .then(function () {
        done('should not get here');
      })
      .catch(function (result) {
        assert.equal(result.message, 'Not Found');
        assert(api.isDone(), 'api should have been requested');
        nock.cleanAll();
        done();
      });
  });

  it('should add transactions', function (done) {
    var api = nock('https://reporting.reactcrm.com')
      .post('/transactions', [{id: '1'}, {id: '2'}])
      .matchHeader('Authorization', 'Bearer apiKey')
      .reply(202);
    var instance = service({API_KEY: 'apiKey'});
    instance.saveTransactions([{id: '1'}, {id: '2'}])
      .then(function () {
        assert(api.isDone(), 'api should have been requested');
        nock.cleanAll();
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('should reject the promise if it could not accept the request', function (done) {
    var api = nock('https://reporting.reactcrm.com')
      .post('/transactions', [{id: '1'}, {}])
      .matchHeader('Authorization', 'Bearer apiKey')
      .reply(400);
    var instance = service({API_KEY: 'apiKey'});
    instance.saveTransactions([{id: '1'}, {}])
      .then(function () {
        throw new Error('it should not get here');
      })
      .catch(function (err) {
        assert.equal(err.message, 'Bad Request');
        assert(api.isDone(), 'api should have been requested');
        nock.cleanAll();
        done();
      });
  });

});