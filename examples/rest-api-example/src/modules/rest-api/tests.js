require('blanket')({
  pattern: '/modules/'
})

var _ = require('lodash')
var Promise = require('es6-promise').Promise
var chai = require('chai')
var spies = require('chai-spies')
var expect = chai.expect
chai.use(spies)

var Flux = require('../../flux')
var RestApi = require('./index')

describe("modules/rest-api", function() {
  afterEach(function() {
    Flux.reset()
  })

  describe("#createApiActions", function() {
    var generatedId = 1

    var instances = {
      1: { id: 1, name: 'instance 1', category: 'foo' },
      2: { id: 2, name: 'instance 2', category: 'foo' },
      3: { id: 3, name: 'instance 3', category: 'bar' },
    }

    var fetchSpy, fetchAllSpy, saveSpy, deleteSpy

    var apiActions

    beforeEach(function() {
      fetchSpy = chai.spy()
      fetchAllSpy = chai.spy()
      saveSpy = chai.spy()
      deleteSpy = chai.spy()

      apiActions = RestApi.createApiActions({
        entity: 'entity',

        fetch: function(id) {
          fetchSpy(id)
          return new Promise(function(resolve, reject) {
            resolve(instances[id] || null)
          })
        },

        fetchAll: function(params) {
          fetchAllSpy(params)
          return new Promise(function(resolve, reject) {
            var results = _.toArray(_.filter(instances, params))
            resolve(results)
          })
        },

        save: function(instance) {
          saveSpy(instance)
          return new Promise(function(resolve, reject) {
            var newInstance = _.clone(instance)
            newInstance.id = generatedId
            resolve(newInstance)
          })
        },

        delete: function(instance) {
          deleteSpy(instance)
          return new Promise(function(resolve, reject) {
            resolve(null)
          })
        },
      })
    })

    describe("#fetch", function() {
      it("should call the original model.fetch with the correct param", function(done) {
        apiActions.fetch(1).then(function(result) {
          expect(fetchSpy).to.have.been.called.once
          expect(fetchSpy).to.have.been.called.with(1)
          done()
        }).catch(done)
      })

      it("should add the entry to the restApiCache store", function(done) {
        var id = 1
        apiActions.fetch(id).then(function(result) {
          var cachedResult = Flux.evaluateToJS(['restApiCache', 'entity', id])
          expect(cachedResult).to.deep.equal(instances[id])
          done()
        }).catch(done)
      })

      it("should pass the result through for promise chaining", function(done) {
        var id = 1
        apiActions.fetch(id).then(function(result) {
          expect(result).to.deep.equal(instances[id]);
          done()
        }).catch(done)
      })

      it("should not add anything when fetch comes back with `null`", function(done) {
        var id = 4
        apiActions.fetch(id).then(function(result) {
          var cachedResult = Flux.evaluateToJS(['restApiCache', 'entity', id])
          expect(cachedResult).to.be.undefined
          done()
        }).catch(done)
      })
    })

    describe("#fetchAll", function() {
      it("should call the original model.fetchAll with the correct params", function(done) {
        var params = { category: 'foo' }
        apiActions.fetchAll(params).then(function(results) {
          expect(fetchAllSpy).to.have.been.called.once
          expect(fetchAllSpy).to.have.been.called.with(params)
          done()
        }).catch(done)
      })

      it("should add the entries to the restApiCache store", function(done) {
        var params = { category: 'foo' }
        apiActions.fetchAll(params).then(function(results) {
          var cachedResults = Flux.evaluateToJS(['restApiCache', 'entity'])
          expect(cachedResults).to.deep.equal({
            1: instances[1],
            2: instances[2],
          })
          done()
        }).catch(done)
      })

      it("should pass the result through for promise chaining", function(done) {
        var params = { category: 'foo' }
        apiActions.fetchAll(params).then(function(results) {
          expect(results).to.deep.equal([
            instances[1],
            instances[2],
          ]);
          done()
        }).catch(done)
      })

      it("should not add anything when fetchAll comes back with `[]`", function(done) {
        var params = { category: 'invalid' }
        apiActions.fetchAll(params).then(function(results) {
          var cachedResult = Flux.evaluateToJS(['restApiCache', 'entity'])

          expect(_.toArray(cachedResult)).to.deep.equal([])
          done()
        }).catch(done)
      })
    })
  })
})
