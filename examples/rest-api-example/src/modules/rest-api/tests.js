require('blanket')({
  pattern: '/modules/'
})

var _ = require('lodash')
var Promise = require('es6-promise').Promise
var chai = require('chai')
var spies = require('chai-spies')
var expect = chai.expect
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
chai.use(sinonChai);
chai.use(spies)

var Flux = require('../../flux')
var RestApi = require('./index')
var actionTypes = require('./action-types')

describe("modules/rest-api", function() {
  afterEach(function() {
    Flux.reset()
  })

  var generatedId = 4

  var instances = {
    1: { id: 1, name: 'instance 1', category: 'foo' },
    2: { id: 2, name: 'instance 2', category: 'foo' },
    3: { id: 3, name: 'instance 3', category: 'bar' },
  }

  describe("#createApiActions", function() {
    var apiActions

    describe("when the apiActions are successful", function() {
      var fetchSpy, fetchAllSpy, saveSpy, deleteSpy

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

      describe("#save", function() {
        it("should call the original model.save with the correct params", function(done) {
          var instance = { name: 'instance 4', category: 'new' }
          apiActions.save(instance).then(function(result) {
            expect(saveSpy).to.have.been.called.once
            expect(saveSpy).to.have.been.called.with(instance)
            done()
          }).catch(done)
        })

        it("should add the new entry to the restApiCache store", function(done) {
          var instance = { name: 'instance 4', category: 'new' }
          apiActions.save(instance).then(function(result) {
            var cachedResult = Flux.evaluateToJS(['restApiCache', 'entity', generatedId])
            var expected = {
              id: generatedId,
              name: 'instance 4',
              category: 'new',
            }
            expect(cachedResult).to.deep.equal(expected)
            done()
          }).catch(done)
        })

        it("should pass the result through for promise chaining", function(done) {
          var instance = { name: 'instance 4', category: 'new' }
          apiActions.save(instance).then(function(result) {
            expect(result).to.deep.equal({
              id: generatedId,
              name: 'instance 4',
              category: 'new',
            })
            done()
          }).catch(done)
        })
      })

      describe("#delete", function() {
        beforeEach(function(done) {
          apiActions.fetchAll().then(function() {
            done()
          })
        })

        it("should call the original model.delete with the correct params", function(done) {
          apiActions['delete'](instances[3]).then(function(result) {
            expect(deleteSpy).to.have.been.called.once
            expect(deleteSpy).to.have.been.called.with(instances[3])
            done()
          }).catch(done)
        })

        it("should remove the entry the restApiCache store", function(done) {
          apiActions['delete'](instances[3]).then(function(result) {
            var instance1 = Flux.evaluateToJS(['restApiCache', 'entity', 1])
            var instance2 = Flux.evaluateToJS(['restApiCache', 'entity', 2])
            var instance3 = Flux.evaluateToJS(['restApiCache', 'entity', 3])

            expect(instance1).to.exist;
            expect(instance2).to.exist;
            expect(instance3).to.be.undefined;
            done()
          }).catch(done)
        })
      })
    })

    describe("when the apiActions fail", function() {
      var model
      var fetchReason, fetchAllReason, saveReason, deleteReason

      beforeEach(function() {
        sinon.stub(Flux, 'dispatch')

        fetchReason = 'fetch failed'
        fetchAllReason = 'fetchAll failed'
        saveReason = 'save failed'
        deleteReason = 'delete failed'

        model = {
          entity: 'entity',

          fetch: function(id) {
            return new Promise(function(resolve, reject) {
              reject(fetchReason)
            })
          },

          fetchAll: function(params) {
            return new Promise(function(resolve, reject) {
              reject(fetchAllReason)
            })
          },

          save: function(instance) {
            return new Promise(function(resolve, reject) {
              reject(saveReason)
            })
          },

          delete: function(instance) {
            return new Promise(function(resolve, reject) {
              reject(deleteReason)
            })
          },
        }

        apiActions = RestApi.createApiActions(model)
      })

      afterEach(function() {
        Flux.dispatch.restore()
      })

      describe("#fetch", function() {
        it('should dispatch API_FETCH_FAIL with the model, params and reason', function(done) {
          var id = 123
          apiActions.fetch(id).then(
            function() {
              done("Did not go into reject handler")
            },
            // fail
            function(reason) {
              sinon.assert.calledWithExactly(Flux.dispatch, actionTypes.API_FETCH_FAIL, {
                model: model,
                params: id,
                reason: fetchReason,
              })
              done()
            }
          ).catch(done)
        })

        it('should pass the reason through for promise chaining', function(done) {
          var id = 123
          apiActions.fetch(id).then(
            function() {
              done("Did not go into reject handler")
            },
            // fail
            function(reason) {
              expect(reason).to.equal(fetchReason)
              done()
            }
          ).catch(done)
        })
      })

      describe("#fetchAll", function() {
        it('should dispatch API_FETCH_FAIL with the model, params and reason', function(done) {
          var params = { invalid: 'invalid' }
          apiActions.fetchAll(params).then(
            function() {
              done("Did not go into reject handler")
            },
            // fail
            function(reason) {
              sinon.assert.calledWithExactly(Flux.dispatch, actionTypes.API_FETCH_FAIL, {
                model: model,
                params: params,
                reason: fetchAllReason,
              })
              done()
            }
          ).catch(done)
        })

        it('should pass the reason through for promise chaining', function(done) {
          var params = { invalid: 'invalid' }
          apiActions.fetchAll(params).then(
            function() {
              done("Did not go into reject handler")
            },
            // fail
            function(reason) {
              expect(reason).to.equal(fetchAllReason)
              done()
            }
          ).catch(done)
        })
      })

      describe("#save", function() {
        it('should dispatch API_SAVE_FAIL with the model, params and reason', function(done) {
          var instance = { id: 5, invalid: 'invalid' }
          apiActions.save(instance).then(
            function() {
              done("Did not go into reject handler")
            },
            // fail
            function(reason) {
              sinon.assert.calledWithExactly(Flux.dispatch, actionTypes.API_SAVE_FAIL, {
                model: model,
                params: instance,
                reason: saveReason,
              })
              done()
            }
          ).catch(done)
        })

        it('should pass the reason through for promise chaining', function(done) {
          var instance = { id: 5, invalid: 'invalid' }
          apiActions.save(instance).then(
            function() {
              done("Did not go into reject handler")
            },
            // fail
            function(reason) {
              expect(reason).to.equal(saveReason)
              done()
            }
          ).catch(done)
        })
      })

      describe("#delete", function() {
        it('should dispatch API_DELETE_FAIL with the model, params and reason', function(done) {
          var instance = { id: 5, invalid: 'invalid' }
          apiActions['delete'](instance).then(
            function() {
              done("Did not go into reject handler")
            },
            // fail
            function(reason) {
              sinon.assert.calledWithExactly(Flux.dispatch, actionTypes.API_DELETE_FAIL, {
                model: model,
                params: instance,
                reason: deleteReason,
              })
              done()
            }
          ).catch(done)
        })

        it('should pass the reason through for promise chaining', function(done) {
          var instance = { id: 5, invalid: 'invalid' }
          apiActions['delete'](instance).then(
            function() {
              done("Did not go into reject handler")
            },
            // fail
            function(reason) {
              expect(reason).to.equal(deleteReason)
              done()
            }
          ).catch(done)
        })
      })
    })
  })

  describe("#createEntityMapGetter", function() {
    var model

    beforeEach(function() {
      model = {
        entity: 'entity'
      }
    })

    describe("when no entities are loaded", function() {
      it("should return an empty map", function() {
        var getter = RestApi.createEntityMapGetter(model)
        var result = Flux.evaluateToJS(getter)
        expect(result).to.deep.equal({})
      })
    })

    describe("when entities are loaded after a fetch success", function() {
      beforeEach(function() {
        // simulate a fetch success to insert entities in the restApiCache store
        Flux.dispatch(actionTypes.API_FETCH_SUCCESS, {
          model: model,
          result: [
            instances[1],
            instances[2],
            instances[3],
          ],
        })
      })

      it("should return a map of id => entity", function() {
        var getter = RestApi.createEntityMapGetter(model)
        var result = Flux.evaluateToJS(getter)
        expect(result).to.deep.equal(instances)
      })
    })
  })

  describe("#createByIdGetter", function() {
    var model

    beforeEach(function() {
      model = {
        entity: 'entity'
      }
    })

    describe("when entities are loaded after a fetch success", function() {
      beforeEach(function() {
        // simulate a fetch success to insert entities in the restApiCache store
        Flux.dispatch(actionTypes.API_FETCH_SUCCESS, {
          model: model,
          result: [
            instances[1],
            instances[2],
            instances[3],
          ],
        })
      })

      it("should return the entity by id", function() {
        var getter = RestApi.createByIdGetter(model)
        var result = Flux.evaluateToJS(getter(1))
        expect(result).to.deep.equal(instances[1])
      })
    })
  })
})
